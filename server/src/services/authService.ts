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
  membershipPurchaseRequestInputDto,
  fetchMembershipInputDto,
  createCheckoutSessionInputDto,
} from '../types/auth';
import { stripe } from '../config/stripe';
dotenv.config();

export class AuthService {
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

  async requestPasswordReset({ email }: RequestPasswordResetInputDto) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/change-password`,
    });

    if (error) {
      console.log(error);
      return { success: false, message: 'Error sending password reset email' };
    }

    return { success: true };
  }

  async resetPassword({ accessToken, refreshToken, newPassword }: ResetPasswordInputDto) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      console.log(sessionError);
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

  async processMembershipPurchaseRequest(purchaseSubmission:membershipPurchaseRequestInputDto) {

    //console.log(purchaseSubmission);
    // Check if the subscription exists
    const { data, error } = await supabase
      .from('subscriptions')
      .select('user_id, membership_status')
      .eq('user_id', purchaseSubmission.userId)
      .single();  // Get only one row

    if (error && error.code !== 'PGRST116') {  // Ignore "No rows found" error
      console.error(' Proccessing Membership: Error checking subscription:', error);
    } else if (data) {
      //If subscription exists and is ACTIVE, do nothing
      if (data.membership_status === true) {
        return { success: false, messsage:data };
      } else {
        //If subscription exists but is not ACTIVE, update it
        const { data:newData, error } = await supabase
          .from('subscriptions')
          .update({
              start_date: purchaseSubmission.startDate,
              renewal_date: purchaseSubmission.renewalDate,
              user_id: purchaseSubmission.userId,
              membership_status: purchaseSubmission.membershipStatus,
              billing_rate: purchaseSubmission.billingRate
          })
          .eq('user_id', purchaseSubmission.userId).select('*').single();

        if (error) {
          return { success: false, message: 'Error updating subscription.' };
        } else {
          return { success: true, message: newData};
        }
      }
    } else {

      // If no subscription exists, insert a new row
      const { data:newData, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            start_date: purchaseSubmission.startDate,
            renewal_date: purchaseSubmission.renewalDate,
            user_id: purchaseSubmission.userId,
            membership_status: purchaseSubmission.membershipStatus,
            billing_rate: purchaseSubmission.billingRate
          }
        ]).select('*').single();

      if (error) {
        return { success: false, message: 'Error inserting subscription.' };
      } else {
        return { success: true, message: newData };
      }
    }
  }

  async fetchMembership(user:fetchMembershipInputDto) {

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();  // Get only one row

    // Check if the row exists for the user id
    //Did we fail and get an error?
    if (error && error.code === 'PGRST116') {  // Ignore "No rows found" error

      if(user !== null)
      {
        const customers = await stripe.customers.list({ email:user.email, limit: 10 });
        console.log(customers,"LINE252");

        // Filter the results by userId in metadata
        const existingCustomer = customers.data.find(customer => customer.metadata?.userId === user.id);
        console.log(existingCustomer);
        if (existingCustomer) {
          //Nothing happens here yet.
        }else{
          await stripe.customers.create({
            email: user.email,
            metadata: { userId: user.id},
          });
        }


        const { data:insertData, error:insertError } = await supabase
        .from('subscriptions')
        .upsert([
          {
            start_date: null,
            renewal_date: null,
            user_id: user.id,
            membership_status: false,
            billing_rate: 0.00,
            stripe_customer_id:user.id
          }
        ]).select('*').single();
  
        console.log(insertData, insertError, "Bananarama");
        //console.log(insertError);

        if (insertError && insertError.code === '23505') { 

          const { data:antiDupeData, error:antiDupeError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();  // Get only one row
  
          if (antiDupeError) { 
            return { success: false, message: antiDupeError };
          }
          else{
            return { success: true, message: antiDupeData };
          }
        }else{
          return { success: false, message: insertError };
        }
        
      }
      
    } else if (data) {

      


      return { success: true, message: data };
    } 
    else {  
      return { success: false, message: error };
    }
  }

  async createCheckoutSession() {

    
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
     //    customer: null,
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: 'price_1QnQ61Rq5kC7KLJPpqupQ8Cs',
            quantity: 1,
          },
        ],
        
        mode: 'subscription',
        //return_url: `${process.env.CLIENT_URL!}/return?session_id={CHECKOUT_SESSION_ID}`,
        redirect_on_completion:"never"
      });
    
    return { success: true, message: session.client_secret };
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

  async verifySession(session: any) {
    console.log(session);

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
}
