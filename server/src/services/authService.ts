import e from 'express';
import dotenv from 'dotenv';
import { prisma } from '../config/prisma';
import { supabase } from '../config/supabase';
import {
  SignInInputDto,
  SignUpInputDto,
  ResetPasswordInputDto,
  RequestPasswordResetInputDto,
  verifyQRCodeInputDto,
  Role,
  fetchMembershipInputDto,
  createCheckoutSessionInputDto,
  cancelMembershipInputDto,
  manageMembershipInputDto,
} from '../types/auth';
import SpotifyWebApi from 'spotify-web-api-node';
import { stripe } from '../config/stripe';

dotenv.config();

export class AuthService {
  private generateRandomString(length: number): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async signUp(newUser: SignUpInputDto) {
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL}/register-confirmation`,
        data: {
          display_name: newUser.displayName,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
        },
      },
    });

    if (error) {
      console.log(error);
      let message: string = '';

      if (error.code === 'email_exists') {
        message = 'Email already exists';
      } else if (error.code === 'email_address_invalid') {
        message = 'Invalid email address';
      } else if (error.code === 'weak_password') {
        message = 'Password is too weak';
      } else if (error.code === 'unexpected_failure') {
        message = 'Unexpected failure';
      }

      return { success: false, message };
    }

    const user = await prisma.user.create({
      data: {
        id: data.user?.id!,
        email: data.user?.email!,
      },
    });

    if (!user) {
      console.log('Error creating user');
      return { success: false, message: 'Error creating user' };
    }

    return { success: true };
  }

  async signIn({ email, password }: SignInInputDto) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error);
      let message: string = '';

      if (error.code === 'email_not_confirmed') {
        message = 'Please verify your email before signing in';
      } else if (error.code === 'invalid_credentials') {
        message = 'Invalid email or password';
      }

      return { success: false, message };
    }

    return {
      success: true,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email!,
        displayName: data.user.user_metadata.display_name,
        firstName: data.user.user_metadata.first_name,
        lastName: data.user.user_metadata.last_name,
        role: Role.Admin,
      },
    };
  }

  async signOut() {
    let { error } = await supabase.auth.signOut();

    if (error) {
      console.log(error);
      return { success: false, message: 'Error signing out' };
    }

    return { success: true };
  }

  async requestPasswordChange({ email }: RequestPasswordResetInputDto) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/change-password`,
    });

    if (error) {
      console.log(error);
      return { success: false, message: 'Error sending password reset email' };
    }

    return { success: true };
  }

  async changePassword({ accessToken, refreshToken, newPassword }: ResetPasswordInputDto) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      console.log(sessionError);
      if (sessionError.code === 'same_password') {
        return {
          success: false,
          message:
            'Your new password matches your current password. Please enter a different password.',
        };
      }
      return { success: false, message: 'Error setting session' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.log(error);
      return { success: false, message: 'Error updating password' };
    }

    return { success: true };
  }

  async verifyQRCode({ id }: verifyQRCodeInputDto) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      //console.log('Invalid QR code');
      return { success: false, message: 'Invalid QR code' };
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    //console.log(data);

    if (error) {
      //console.log(error);
      return { success: false, message: 'Error signing in anonymously' };
    }

    return {
      success: true,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        displayName: data.user?.user_metadata.display_name,
        firstName: data.user?.user_metadata.first_name,
        lastName: data.user?.user_metadata.last_name,
        assignedOwner: id,
        role: Role.Customer,
      },
    };
  }

  async fetchMembership(user: fetchMembershipInputDto) {
    if (user !== null) {
      //Get list of customers with the user email
      const customers = await stripe.customers.list({ email: user.email, limit: 10 });

      // Filter the results by userId in metadata
      const existingCustomer = customers.data.find(
        (customer) => customer.metadata?.userId === user.id,
      );

      let newCustomerId = undefined;

      if (existingCustomer === undefined) {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        });

        newCustomerId = newCustomer.id;
      }

      const { error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single(); // Get only one row

      if (error && error.code === 'PGRST116') {
        const {} = await supabase.from('subscriptions').insert([
          {
            user_id: user.id,
            membership_status: false,
            stripe_customer_id:
              existingCustomer === undefined ? newCustomerId : existingCustomer.id,
          },
        ]);
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: existingCustomer === undefined ? newCustomerId : existingCustomer.id,
        status: 'active',
        limit: 1,
      });

      const hasActiveSubcription =
        subscriptions.data.length > 0 &&
        ['active', 'trialing'].includes(subscriptions.data[0].status);

      const { data: newData, error: newError } = await supabase
        .from('subscriptions')
        .update([
          {
            start_date: hasActiveSubcription
              ? new Date(subscriptions.data[0].current_period_start * 1000).toISOString()
              : null,
            renewal_date: hasActiveSubcription
              ? new Date(subscriptions.data[0].current_period_end * 1000).toISOString()
              : null,
            user_id: user.id,
            membership_status: hasActiveSubcription ? true : false,
            billing_rate: hasActiveSubcription
              ? subscriptions.data[0].items.data[0].price.unit_amount
              : 0.0,
            stripe_customer_id:
              existingCustomer === undefined ? newCustomerId : existingCustomer.id,
            stripe_subscription_id: hasActiveSubcription ? subscriptions.data[0].id : null,
            stripe_subscription_status: hasActiveSubcription ? 'active' : 'inactive',
          },
        ])
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (newData) {
        return { success: true, message: newData };
      }
      return { success: false, message: 'Nothing found' };
    }
  }

  async cancelMembership(user: cancelMembershipInputDto) {
    if (user !== null) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single(); // Get only one row

        if (error) {
          return { success: false, message: error };
        }

        const subscriptions = await stripe.subscriptions.list({
          customer: data.stripe_customer_id,
          status: 'active',
          limit: 1,
        });

        const subscription = subscriptions.data[0];

        if (subscription.status === 'active') {
          const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
          });

          const cancelSuccessMessage =
            'Your subscription has been successfully canceled. However, you will continue to have access until the end of the period. No further payments will be charged. Thank you for being a member!';

          return { success: true, message: cancelSuccessMessage };
        } else {
          const cancelFailedMessage = 'Subscription is already canceled or in a non-active state.';

          return { success: true, message: cancelFailedMessage };
        }
      } catch (error) {
        console.error('Error canceling subscription:', error);
        return { success: false, message: error };
      }
    }
    return { success: false, message: 'user not found.' };
  }

  async manageMembership(user: manageMembershipInputDto) {
    if (user !== null) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single(); // Get only one row

        if (error) {
          return { success: false, message: error };
        }

        const session = await stripe.billingPortal.sessions.create({
          customer: data.stripe_customer_id,
        });

        return { success: true, message: session.url };
      } catch (error) {
        console.error('Error canceling subscription:', error);
        return { success: false, message: error };
      }
    }
    return { success: false, message: 'user not found.' };
  }

  async createCheckoutSession(user: createCheckoutSessionInputDto) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single(); // Get only one row
    console.log(data);
    if (error) {
      return { success: false, message: error };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: data.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      console.log(data, 'Customer already has an active subscription.', data);

      return { success: true, message: data }; // Return existing subscription instead of creating a new one
    } else {
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        customer: data?.stripe_customer_id,
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: 'price_1QnQ61Rq5kC7KLJPpqupQ8Cs',
            quantity: 1,
          },
        ],

        mode: 'subscription',
        //return_url: `${process.env.CLIENT_URL!}/return?session_id={CHECKOUT_SESSION_ID}`,
        redirect_on_completion: 'never',
      });

      return { success: true, message: session.client_secret };
    }
  }

  async signInWithGoogle() {
    const {
      data: { url },
      error,
    } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.CLIENT_URL}/verify-oauth`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.log(error);
      return { success: false, message: 'Error signing in with Google' };
    }

    return { success: true, url };
  }

  async googleCallback(session: any) {
    const existingUser = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          id: session.user?.id!,
          email: session.user?.email!,
        },
      });

      if (!user) {
        console.log('Error creating user');
        return { success: false, message: 'Error creating user' };
      }
    }

    return {
      success: true,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: {
        id: session.user.id,
        email: session.user.email!,
        displayName: session.user.user_metadata.display_name ?? session.user.user_metadata.name,
        firstName:
          session.user.user_metadata.first_name ??
          session.user.user_metadata.full_name.split(' ')[0],
        lastName:
          session.user.user_metadata.last_name ??
          session.user.user_metadata.full_name.split(' ')[1],
        role: Role.Admin,
      },
    };
  }

  async spotifyLogin() {
    const scope =
      'streaming user-read-email user-read-private user-read-currently-playing user-read-playback-state user-modify-playback-state';
    const state = this.generateRandomString(16);

    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      scope: scope,
      redirect_uri: 'http://localhost:3000/auth/spotify-callback',
      state: state,
    });

    const redirectUrl = 'https://accounts.spotify.com/authorize/?' + queryParams.toString();

    return redirectUrl;
  }

  async spotifyCallback(code: string) {
    const spotifyApi = new SpotifyWebApi({
      redirectUri: 'http://localhost:3000/auth/spotify-callback',
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const {
      body: { access_token, refresh_token, expires_in },
    } = await spotifyApi.authorizationCodeGrant(code);

    return { access_token, refresh_token, expires_in };
  }

  async spotifyRefreshToken(refreshToken: string) {
    const spotifyApi = new SpotifyWebApi({
      // redirectUri: 'http://localhost:3000/auth/spotify-callback',
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      refreshToken,
    });

    const {
      body: { access_token, expires_in },
    } = await spotifyApi.refreshAccessToken();
    return { success: true, access_token, expires_in };
  }
}
