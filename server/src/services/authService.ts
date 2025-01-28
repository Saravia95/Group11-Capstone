import { supabase } from '../config/supabase';
import {
  SignInInputDto,
  SignUpInputDto,
  SignInOutputDto,
  ResetPasswordInputDto,
  RequestPasswordResetInputDto,
} from '../types/auth';

export class AuthService {
  async signUp(newUser: SignUpInputDto) {
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        emailRedirectTo: 'http://localhost:5173/owner-register-confirmation',
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

    return data.user;
  }

  async signIn(user: SignInInputDto): Promise<SignInOutputDto | null> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.session
      ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          user: {
            id: data.user.id,
            email: data.user.email!,
            displayName: data.user.user_metadata.display_name,
            firstName: data.user.user_metadata.first_name,
            lastName: data.user.user_metadata.last_name,
          },
        }
      : null;
  }

  async signOut() {
    let { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
    return null;
  }

  async requestPasswordReset(req: RequestPasswordResetInputDto) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(req.email, {
      redirectTo: 'http://localhost:5173/owner-change-password',
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
}
