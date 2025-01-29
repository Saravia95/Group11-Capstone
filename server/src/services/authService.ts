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
      throw new Error(error.message);
    }

    const user = await prisma.user.create({
      data: {
        id: data.user?.id!,
        email: data.user?.email!,
      },
    });

    if (!user) {
      throw new Error('User not created');
    }

    return data.user;
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
      }
      if (error.code === 'invalid_credentials') {
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
      throw new Error(error.message);
    }
    return null;
  }

  async requestPasswordReset({ email }: RequestPasswordResetInputDto) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/change-password',
    });

    if (error) {
      throw new Error(error.message);
    }
    return null;
  }

  async resetPassword({ accessToken, refreshToken, newPassword }: ResetPasswordInputDto) {
    const { data: session } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data.user;
  }

  async verifyQRCode({ id }: verifyQRCodeInputDto) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    console.log(data);

    if (error) {
      throw new Error(error.message);
    }

    return {
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
