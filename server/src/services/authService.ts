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

export class AuthService {
  async signUp(newUser: SignUpInputDto) {
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        emailRedirectTo: 'http://localhost:5173/register-confirmation',
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
      redirectTo: 'http://localhost:5173/change-password',
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
        role: Role.Customer,
      },
    };
  }
}
