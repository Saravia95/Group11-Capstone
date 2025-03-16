import { AuthService } from '../services/authService';
import { supabase } from '../config/supabase';
import { prisma } from '../config/prisma';
import { Role } from '../types/auth';

// Mock Supabase and Prisma
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('../config/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks(); // Reset mocks before each test
  });

  describe('signUp', () => {
    it('should return success: true when sign-up is successful', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: {}, error: null });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'Test1234!',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: Role.Admin,
      });

      expect(result).toEqual({ success: true });
      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'Test1234!',
        }),
      );
    });

    it('should return an error message when trying to sign up with an already registered email', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'email_exists' },
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'Test1234!',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: Role.Admin,
      });

      expect(result).toEqual({ success: false, message: 'Email already exists' });
    });

    it('should return an error message when trying to sign up with an invalid email', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'email_address_invalid' },
      });

      const result = await authService.signUp({
        email: 'test@example',
        password: 'Test1234!',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: Role.Admin,
      });

      expect(result).toEqual({ success: false, message: 'Invalid email address' });
    });

    it('should return an error message when trying to sign up with a weak password', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'weak_password' },
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: Role.Admin,
      });

      expect(result).toEqual({ success: false, message: 'Password is too weak' });
    });

    it('should return an error message when trying to sign up with a weak password', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'unexpected_failure' },
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: Role.Admin,
      });

      expect(result).toEqual({ success: false, message: 'Unexpected failure' });
    });

    it('should return an error message when trying to sign up with an already registered email', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'email_exists', message: 'Email already exists' },
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'Test1234!',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: Role.Admin,
      });

      expect(result).toEqual({ success: false, message: 'Email already exists' });
    });
  });
});
