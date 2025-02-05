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
} from '../types/auth';
import axios from 'axios';
// import queryString from 'query-string';

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
      console.log('Invalid QR code');
      return { success: false, message: 'Invalid QR code' };
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    console.log(data);

    if (error) {
      console.log(error);
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
    const scope = 'streaming user-read-email user-read-private';
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
    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000/auth/spotify-callback',
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    return data;
  }
}
