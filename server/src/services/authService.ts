import { access } from 'fs';
import { supabase } from '../config/supabase';
import { SignUpDto } from '../types/auth';

export class AuthService {
  async signUp(newUser: SignUpDto) {
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
}
