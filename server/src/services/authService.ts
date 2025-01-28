import { supabase } from '../config/supabase';
import { SignInInputDto, SignUpInputDto, SignInOutputDto, RequestPasswordResetInputDto, ResetPasswordInputDto } from '../types/auth';

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
    let { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message);
    }
    return null;
  }


  async requestPasswordReset(req: RequestPasswordResetInputDto) {

    const { data, error } = await supabase.auth.resetPasswordForEmail(req.email, {
      redirectTo: 'http://localhost:5173/owner-change-password',
    })
    

    if (error) {
      throw new Error(error.message);
    }
    return null;
  }


  async resetPassword(resetRequest: ResetPasswordInputDto) {
  // Verify the token first
  // const { error: tokenError } = await supabase.auth.getUser(resetRequest.accessToken);
  //   console.log(resetRequest, "resetRequest"); 
  // if (tokenError) {
  //   console.error("Invalid or expired token:", tokenError.message);
  //   return null;
  // }


    const { data, error } = await supabase.auth.updateUser({
      password: resetRequest.password
    })

    if (error) {
      throw new Error(error.message);
    }
    return data.user;
  }

}
