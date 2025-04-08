import { AuthService } from './authService';
import { supabase } from '../config/supabase';
import { prisma } from '../config/prisma';
import {
  cancelMembershipInputDto,
  createCheckoutSessionInputDto,
  fetchMembershipInputDto,
  manageMembershipInputDto,
  Role,
} from '../types/auth';
import { stripe } from '../config/stripe';
import SpotifyWebApi from 'spotify-web-api-node';
import { BASE_URL, CLIENT_URL } from '../constants/baseUrl';

// Mock Supabase and Prisma
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      setSession: jest.fn(),
      updateUser: jest.fn(),
      signInAnonymously: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

jest.mock('../config/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('../config/stripe', () => ({
  stripe: {
    customers: {
      list: jest.fn(),
      create: jest.fn(),
    },
    subscriptions: {
      list: jest.fn(),
      update: jest.fn(),
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

jest.mock('spotify-web-api-node', () => {
  return jest.fn().mockReturnValue({
    authorizationCodeGrant: jest.fn(),
    refreshAccessToken: jest.fn(),
  });
});

const originalEnv = process.env;

describe('AuthService', () => {
  let authService: AuthService;
  let mockSpotifyWebApiInstance: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks(); // Reset mocks before each test
    process.env = { ...originalEnv }; // Restore original env vars
    mockSpotifyWebApiInstance = new SpotifyWebApi(); // Create an "instance" of the mock

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv; // Restore original env vars after tests
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
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

  describe('signIn', () => {
    it('should successfully sign in with valid email and password', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          session: { access_token: 'fake_access_token', refresh_token: 'fake_refresh_token' },
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              display_name: 'Test User',
              first_name: 'Test',
              last_name: 'User',
            },
          },
        },
        error: null,
      });

      const result = await authService.signIn({ email: 'test@example.com', password: 'Test1234!' });

      expect(result).toEqual({
        success: true,
        accessToken: 'fake_access_token',
        refreshToken: 'fake_refresh_token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          role: expect.any(String),
        },
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test1234!',
      });
    });

    it('should fail to sign in with an unverified email', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'email_not_confirmed' },
      });

      const result = await authService.signIn({ email: 'test@example.com', password: 'wrongpass' });

      expect(result).toEqual({
        success: false,
        message: 'Please verify your email before signing in',
      });
    });

    it('should fail to sign in with incorrect password', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'invalid_credentials' },
      });

      const result = await authService.signIn({ email: 'test@example.com', password: 'wrongpass' });

      expect(result).toEqual({ success: false, message: 'Invalid email or password' });
    });
  });

  describe('signOut', () => {
    it('should return success: true when sign-out is successful', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const result = await authService.signOut();

      expect(result).toEqual({ success: true });
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should return an error message if sign-out fails', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'something went wrong' },
      });

      const result = await authService.signOut();

      expect(result).toEqual({ success: false, message: 'Error signing out' });
    });
  });

  describe('requestPasswordChange', () => {
    it('should return success: true when password change request is successful', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });

      const result = await authService.requestPasswordChange({ email: 'test@example.com' });

      expect(result).toEqual({ success: true });
    });

    it('should return an error message when password change request fails', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: { message: 'something went wrong' },
      });

      const result = await authService.requestPasswordChange({ email: 'test@example.com' });

      expect(result).toEqual({ success: false, message: 'Error sending password reset email' });
    });
  });

  describe('changePassword', () => {
    it('should return success: true when password change is successful', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

      const result = await authService.changePassword({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        newPassword: 'newPassword123!',
      });

      expect(result).toEqual({ success: true });
    });

    it('should return an error message when trying to change password with same password', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        error: { code: 'same_password' },
      });

      const result = await authService.changePassword({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        newPassword: 'samePassword123!',
      });

      expect(result).toEqual({
        success: false,
        message:
          'Your new password matches your current password. Please enter a different password.',
      });
    });

    it('should return an error message when tokens are invalid', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        error: { message: 'something went wrong' },
      });

      const result = await authService.changePassword({
        accessToken: 'invalid_access_token',
        refreshToken: 'invalid_refresh_token',
        newPassword: 'newPassword123!',
      });

      expect(result).toEqual({
        success: false,
        message: 'Error setting session',
      });
    });

    it('should return an error message when password change is successful', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        error: { message: 'something went wrong' },
      });

      const result = await authService.changePassword({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        newPassword: 'newPassword123!',
      });

      expect(result).toEqual({ success: false, message: 'Error updating password' });
    });
  });

  describe('verifyQRCode', () => {
    const ownerId = 'user-123';
    const customerData = {
      user: {
        id: 'cust-456',
        email: 'test@example.com',
        user_metadata: {
          display_name: 'Test User',
          first_name: 'Test',
          last_name: 'User',
        },
      },
      session: {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      },
    };

    it('should return success: true when QR code verification is successful', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: ownerId });
      (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
        data: customerData,
        error: null,
      });

      const result = await authService.verifyQRCode({ id: ownerId });

      expect(result).toEqual({
        success: true,
        accessToken: customerData.session.access_token,
        refreshToken: customerData.session.refresh_token,
        user: {
          id: customerData.user.id,
          email: customerData.user.email,
          displayName: customerData.user.user_metadata.display_name,
          firstName: customerData.user.user_metadata.first_name,
          lastName: customerData.user.user_metadata.last_name,
          assignedOwner: ownerId,
          role: Role.Customer,
        },
      });
    });

    it('should return an error message when QR code verification fails', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await authService.verifyQRCode({ id: ownerId });

      expect(result).toEqual({
        success: false,
        message: 'Invalid QR code',
      });
    });

    it('should return an error message when signin anonymously fails', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: ownerId });
      (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'something went wrong' },
      });

      const result = await authService.verifyQRCode({ id: ownerId });

      expect(result).toEqual({
        success: false,
        message: 'Error signing in anonymously',
      });
    });
  });

  describe('fetchMembership', () => {
    const mockUserInput: fetchMembershipInputDto = {
      id: 'user-123',
      email: 'test@example.com',
    };

    it('should successfully fetch membership for an existing customer with active subscription', async () => {
      const mockStripeCustomer = {
        id: 'cust_123',
        email: 'test@example.com',
        metadata: { userId: 'user-123' },
      };
      const mockStripeSubscription = {
        data: [
          {
            id: 'sub_123',
            status: 'active',
            current_period_start: 1678886400,
            current_period_end: 1710422400,
            items: {
              data: [
                {
                  price: {
                    unit_amount: 1000,
                  },
                },
              ],
            },
          },
        ],
      };
      const mockPrismaSubscription = {
        id: 1,
        user_id: 'user-123',
        membership_status: false,
      };
      const mockPrismaUpdatedSubscription = {
        ...mockPrismaSubscription,
        membership_status: true,
        start_date: new Date(
          mockStripeSubscription.data[0].current_period_start * 1000,
        ).toISOString(),
        renewal_date: new Date(
          mockStripeSubscription.data[0].current_period_end * 1000,
        ).toISOString(),
        billing_rate: mockStripeSubscription.data[0].items.data[0].price.unit_amount,
        stripe_customer_id: mockStripeCustomer.id,
        stripe_subscription_id: mockStripeSubscription.data[0].id,
        stripe_subscription_status: 'active',
      };

      (stripe.customers.list as jest.Mock).mockResolvedValue({ data: [mockStripeCustomer] });
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(mockStripeSubscription);
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockPrismaSubscription);
      (prisma.subscription.update as jest.Mock).mockResolvedValue(mockPrismaUpdatedSubscription);

      const result = await authService.fetchMembership(mockUserInput);

      expect(result).toEqual({ success: true, message: mockPrismaUpdatedSubscription });
      expect(stripe.customers.list).toHaveBeenCalledWith({ email: 'test@example.com', limit: 10 });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: mockStripeCustomer.id,
        status: 'active',
        limit: 1,
      });
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
        data: expect.objectContaining({
          membership_status: true,
          billing_rate: 1000,
          stripe_customer_id: 'cust_123',
          stripe_subscription_id: 'sub_123',
          stripe_subscription_status: 'active',
        }),
      });
    });

    it('should successfully fetch membership for a new customer with active subscription', async () => {
      const mockStripeCustomerListEmpty = { data: [] };
      const mockNewStripeCustomer = {
        id: 'new_cust_456',
        email: 'test@example.com',
        metadata: { userId: 'user-123' },
      };
      const mockStripeSubscription = {
        data: [
          {
            id: 'sub_456',
            status: 'active',
            current_period_start: 1678886400,
            current_period_end: 1710422400,
            items: {
              data: [
                {
                  price: {
                    unit_amount: 1500,
                  },
                },
              ],
            },
          },
        ],
      };
      const mockPrismaSubscription = {
        id: 1,
        user_id: 'user-123',
        membership_status: false,
      };
      const mockPrismaUpdatedSubscription = {
        ...mockPrismaSubscription,
        membership_status: true,
        start_date: new Date(
          mockStripeSubscription.data[0].current_period_start * 1000,
        ).toISOString(),
        renewal_date: new Date(
          mockStripeSubscription.data[0].current_period_end * 1000,
        ).toISOString(),
        billing_rate: mockStripeSubscription.data[0].items.data[0].price.unit_amount,
        stripe_customer_id: 'new_cust_456',
        stripe_subscription_id: 'sub_456',
        stripe_subscription_status: 'active',
      };

      (stripe.customers.list as jest.Mock).mockResolvedValue(mockStripeCustomerListEmpty);
      (stripe.customers.create as jest.Mock).mockResolvedValue(mockNewStripeCustomer);
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(mockStripeSubscription);
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockPrismaSubscription);
      (prisma.subscription.update as jest.Mock).mockResolvedValue(mockPrismaUpdatedSubscription);

      const result = await authService.fetchMembership(mockUserInput);

      expect(result).toEqual({ success: true, message: mockPrismaUpdatedSubscription });
      expect(stripe.customers.list).toHaveBeenCalledWith({ email: 'test@example.com', limit: 10 });
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { userId: 'user-123' },
      });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'new_cust_456',
        status: 'active',
        limit: 1,
      });
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
        data: expect.objectContaining({
          membership_status: true,
          billing_rate: 1500,
          stripe_customer_id: 'new_cust_456',
          stripe_subscription_id: 'sub_456',
          stripe_subscription_status: 'active',
        }),
      });
    });

    it('should successfully fetch membership when no active subscription is found', async () => {
      const mockStripeCustomer = {
        id: 'cust_123',
        email: 'test@example.com',
        metadata: { userId: 'user-123' },
      };
      const mockStripeSubscriptionEmpty = { data: [] };
      const mockPrismaSubscription = {
        id: 1,
        user_id: 'user-123',
        membership_status: true,
      };
      const mockPrismaUpdatedSubscription = {
        ...mockPrismaSubscription,
        membership_status: false,
        start_date: null,
        renewal_date: null,
        billing_rate: 0.0,
        stripe_customer_id: mockStripeCustomer.id,
        stripe_subscription_id: null,
        stripe_subscription_status: 'inactive',
      };

      (stripe.customers.list as jest.Mock).mockResolvedValue({ data: [mockStripeCustomer] });
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(mockStripeSubscriptionEmpty);
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockPrismaSubscription);
      (prisma.subscription.update as jest.Mock).mockResolvedValue(mockPrismaUpdatedSubscription);

      const result = await authService.fetchMembership(mockUserInput);

      expect(result).toEqual({ success: true, message: mockPrismaUpdatedSubscription });
      expect(stripe.customers.list).toHaveBeenCalledWith({ email: 'test@example.com', limit: 10 });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: mockStripeCustomer.id,
        status: 'active',
        limit: 1,
      });
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
        data: expect.objectContaining({
          membership_status: false,
          billing_rate: 0.0,
          stripe_customer_id: 'cust_123',
          stripe_subscription_id: null,
          stripe_subscription_status: 'inactive',
        }),
      });
    });

    it('should return success: false and "Nothing found" message when prisma update fails (simulated)', async () => {
      const mockStripeCustomer = {
        id: 'cust_123',
        email: 'test@example.com',
        metadata: { userId: 'user-123' },
      };
      const mockStripeSubscription = {
        data: [
          {
            id: 'sub_123',
            status: 'active',
            current_period_start: 1678886400,
            current_period_end: 1710422400,
            items: {
              data: [
                {
                  price: {
                    unit_amount: 1000,
                  },
                },
              ],
            },
          },
        ],
      };
      const mockPrismaSubscription = {
        id: 1,
        user_id: 'user-123',
        membership_status: false,
      };

      (stripe.customers.list as jest.Mock).mockResolvedValue({ data: [mockStripeCustomer] });
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(mockStripeSubscription);
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockPrismaSubscription);
      (prisma.subscription.update as jest.Mock).mockResolvedValue(null);

      const result = await authService.fetchMembership(mockUserInput);

      expect(result).toEqual({ success: false, message: 'Nothing found' });
      expect(stripe.customers.list).toHaveBeenCalled();
      expect(stripe.subscriptions.list).toHaveBeenCalled();
      expect(prisma.subscription.update).toHaveBeenCalled();
    });

    it('should handle null user input gracefully and not proceed with Stripe/Prisma calls', async () => {
      const result = await authService.fetchMembership(null as any);

      expect(result).toEqual({ success: false, message: 'Nothing found' });
      expect(stripe.customers.list).not.toHaveBeenCalled();
      expect(stripe.subscriptions.list).not.toHaveBeenCalled();
      expect(prisma.subscription.update).not.toHaveBeenCalled();
    });
  });

  describe('cancelMembership', () => {
    const mockUserInput: cancelMembershipInputDto = {
      id: 'user-123',
      email: 'test@example.com',
    };

    it('should successfully cancel an active membership', async () => {
      const mockUserSubscription = {
        id: 1,
        user_id: 'user-123',
        stripe_customer_id: 'cust_123',
      };
      const mockActiveStripeSubscriptionList = {
        data: [
          {
            id: 'sub_123',
            status: 'active',
          },
        ],
      };
      const mockUpdatedStripeSubscription = {
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: true,
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockUserSubscription);
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(mockActiveStripeSubscriptionList);
      (stripe.subscriptions.update as jest.Mock).mockResolvedValue(mockUpdatedStripeSubscription);

      const result = await authService.cancelMembership(mockUserInput);

      expect(result).toEqual({
        success: true,
        message:
          'Your subscription has been successfully canceled. However, you will continue to have access until the end of the period. No further payments will be charged. Thank you for being a member!',
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cust_123',
        status: 'active',
        limit: 1,
      });
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
      });
    });

    it('should return success: true with "Subscription is already canceled" message if subscription is not active', async () => {
      const mockUserSubscription = {
        id: 1,
        user_id: 'user-123',
        stripe_customer_id: 'cust_123',
      };
      const mockInactiveStripeSubscriptionList = {
        data: [
          {
            id: 'sub_123',
            status: 'canceled',
          },
        ],
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockUserSubscription);
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(
        mockInactiveStripeSubscriptionList,
      );

      const result = await authService.cancelMembership(mockUserInput);

      expect(result).toEqual({
        success: true,
        message: 'Subscription is already canceled or in a non-active state.',
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cust_123',
        status: 'active',
        limit: 1,
      });
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('should return success: false and "Could not find subscription" message if user subscription is not found in Prisma', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await authService.cancelMembership(mockUserInput);

      expect(result).toEqual({
        success: false,
        message: 'Could not find subscription',
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.subscriptions.list).not.toHaveBeenCalled();
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('should return success: false and error message when Stripe subscriptions.list fails', async () => {
      const mockUserSubscription = {
        id: 1,
        user_id: 'user-123',
        stripe_customer_id: 'cust_123',
      };
      const mockStripeError = new Error('Stripe API error');
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockUserSubscription);
      (stripe.subscriptions.list as jest.Mock).mockRejectedValue(mockStripeError);

      const result = await authService.cancelMembership(mockUserInput);

      expect(result).toEqual({
        success: false,
        message: mockStripeError,
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cust_123',
        status: 'active',
        limit: 1,
      });
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('should return success: false and error message when Stripe subscriptions.update fails', async () => {
      const mockUserSubscription = {
        id: 1,
        user_id: 'user-123',
        stripe_customer_id: 'cust_123',
      };
      const mockActiveStripeSubscriptionList = {
        data: [
          {
            id: 'sub_123',
            status: 'active',
          },
        ],
      };
      const mockStripeUpdateError = new Error('Stripe Update API error');

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockUserSubscription);
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(mockActiveStripeSubscriptionList);
      (stripe.subscriptions.update as jest.Mock).mockRejectedValue(mockStripeUpdateError);

      const result = await authService.cancelMembership(mockUserInput);

      expect(result).toEqual({
        success: false,
        message: mockStripeUpdateError,
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cust_123',
        status: 'active',
        limit: 1,
      });
      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
      });
    });

    it('should return success: false and "user not found." message when user input is null', async () => {
      const result = await authService.cancelMembership(null as any);

      expect(result).toEqual({
        success: false,
        message: 'user not found.',
      });
      expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
      expect(stripe.subscriptions.list).not.toHaveBeenCalled();
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });
  });

  describe('manageMembership', () => {
    const mockUserInput: manageMembershipInputDto = {
      id: 'user-123',
      email: 'test@example.com',
    };

    it('should successfully return a billing portal URL when subscription and customer are found', async () => {
      const mockUserSubscription = {
        id: 1,
        user_id: 'user-123',
        stripe_customer_id: 'cust_123',
      };
      const mockBillingPortalSession = {
        url: 'https://billing.stripe.com/session/test_session_url',
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockUserSubscription);
      (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(
        mockBillingPortalSession,
      );

      const result = await authService.manageMembership(mockUserInput);

      expect(result).toEqual({
        success: true,
        message: 'https://billing.stripe.com/session/test_session_url',
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cust_123',
      });
    });

    it('should return success: false and "Could not find subscription" message if user subscription is not found', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await authService.manageMembership(mockUserInput);

      expect(result).toEqual({
        success: false,
        message: 'Could not find subscription',
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
    });

    it('should return success: false and error message when stripe.billingPortal.sessions.create fails', async () => {
      const mockUserSubscription = {
        id: 1,
        user_id: 'user-123',
        stripe_customer_id: 'cust_123',
      };
      const mockStripeError = new Error('Stripe Billing Portal Session creation failed');

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockUserSubscription);
      (stripe.billingPortal.sessions.create as jest.Mock).mockRejectedValue(mockStripeError);

      const result = await authService.manageMembership(mockUserInput);

      expect(result).toEqual({
        success: false,
        message: mockStripeError,
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cust_123',
      });
    });

    it('should return success: false and "user not found." message when user input is null', async () => {
      const result = await authService.manageMembership(null as any);

      expect(result).toEqual({
        success: false,
        message: 'user not found.',
      });
      expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
      expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
    });
  });

  describe('createCheckoutSession', () => {
    const mockUserInput: createCheckoutSessionInputDto = {
      id: 'user-123',
      email: 'test@example.com',
    };

    it('should return success: true and existing subscription if user already has an active subscription', async () => {
      const mockUserSubscription = {
        id: 1,
        user_id: 'user-123',
        stripe_customer_id: 'cust_123',
      };
      const mockActiveStripeSubscriptionList = {
        data: [
          {
            id: 'sub_123',
            status: 'active',
          },
        ],
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockUserSubscription);
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(mockActiveStripeSubscriptionList);

      const result = await authService.createCheckoutSession(mockUserInput);

      expect(result).toEqual({
        success: true,
        message: mockUserSubscription,
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cust_123',
        status: 'active',
        limit: 1,
      });
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it('should return success: true and client secret when user does not have an active subscription', async () => {
      const mockUserSubscription = {
        id: 1,
        user_id: 'user-123',
        stripe_customer_id: 'cust_123',
      };
      const mockEmptyStripeSubscriptionList = { data: [] };
      const mockCheckoutSession = {
        client_secret: 'test_client_secret_123',
      };

      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockUserSubscription);
      (stripe.subscriptions.list as jest.Mock).mockResolvedValue(mockEmptyStripeSubscriptionList);
      (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockCheckoutSession);

      const result = await authService.createCheckoutSession(mockUserInput);

      expect(result).toEqual({
        success: true,
        message: 'test_client_secret_123',
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cust_123',
        status: 'active',
        limit: 1,
      });
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        ui_mode: 'embedded',
        customer: 'cust_123',
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price: 'price_1QnQ61Rq5kC7KLJPpqupQ8Cs',
            quantity: 1,
          }),
        ]),
        mode: 'subscription',
        redirect_on_completion: 'never',
      });
    });

    it('should return success: false and "Could not find subscription" message if user subscription is not found', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await authService.createCheckoutSession(mockUserInput);

      expect(result).toEqual({
        success: false,
        message: 'Could not find subscription',
      });
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      });
      expect(stripe.subscriptions.list).not.toHaveBeenCalled();
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });
  });

  describe('signInWithGoogle', () => {
    it('should return success: true and the authentication URL on successful Google sign-in initiation', async () => {
      const mockAuthUrl = 'https://supabase.google.auth.url';
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: mockAuthUrl },
        error: null,
      });

      const result = await authService.signInWithGoogle();

      expect(result).toEqual({
        success: true,
        url: mockAuthUrl,
      });
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${CLIENT_URL}/verify-oauth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });

    it('should return success: false and "Error signing in with Google" message if Supabase sign-in fails', async () => {
      const mockSupabaseError = new Error('Supabase OAuth error');
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: '' },
        error: mockSupabaseError,
      });

      const result = await authService.signInWithGoogle();

      expect(result).toEqual({
        success: false,
        message: 'Error signing in with Google',
      });
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${CLIENT_URL}/verify-oauth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    });
  });

  describe('googleCallback', () => {
    const mockSession = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      user: {
        id: 'google-user-id-123',
        email: 'google-user@example.com',
        user_metadata: {
          display_name: 'Google User Display Name',
          name: 'Google User Name',
          first_name: 'Google',
          last_name: 'User',
          full_name: 'Google User',
        },
      },
    };

    it('should return success: true with tokens and existing user data if user already exists', async () => {
      const mockExistingUser = {
        id: 'db-user-id-456',
        email: 'google-user@example.com',
      };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockExistingUser);

      const result = await authService.googleCallback(mockSession);

      expect(result).toEqual({
        success: true,
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: 'google-user-id-123',
          email: 'google-user@example.com',
          displayName: 'Google User Display Name',
          firstName: 'Google',
          lastName: 'User',
          role: Role.Admin,
        },
      });
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'google-user@example.com' },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should return success: true with tokens and newly created user data if user does not exist', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      const mockCreatedUser = {
        id: 'google-user-id-123',
        email: 'google-user@example.com',
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await authService.googleCallback(mockSession);

      expect(result).toEqual({
        success: true,
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: 'google-user-id-123',
          email: 'google-user@example.com',
          displayName: 'Google User Display Name',
          firstName: 'Google',
          lastName: 'User',
          role: Role.Admin,
        },
      });
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'google-user@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'google-user-id-123',
          email: 'google-user@example.com',
        },
      });
    });

    it('should return success: false and "Error creating user" message if prisma.user.create fails', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(null);

      const result = await authService.googleCallback(mockSession);

      expect(result).toEqual({
        success: false,
        message: 'Error creating user',
      });
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'google-user@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'google-user-id-123',
          email: 'google-user@example.com',
        },
      });
    });

    it('should handle missing displayName and firstName/lastName in user metadata gracefully', async () => {
      const mockSessionWithoutOptionalMetadata = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        user: {
          id: 'google-user-id-123',
          email: 'google-user@example.com',
          user_metadata: {
            name: 'Google User NameOnly',
            full_name: 'Google User NameOnly',
          },
        },
      };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      const mockCreatedUser = {
        id: 'google-user-id-123',
        email: 'google-user@example.com',
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await authService.googleCallback(mockSessionWithoutOptionalMetadata);

      expect(result).toEqual({
        success: true,
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: {
          id: 'google-user-id-123',
          email: 'google-user@example.com',
          displayName: 'Google User NameOnly',
          firstName: 'Google',
          lastName: 'User',
          role: Role.Admin,
        },
      });
      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('spotifyLogin', () => {
    it('should return the correct Spotify authorization URL', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'mock_spotify_client_id';
      const mockState = 'mock_random_state_string';
      const mockGenerateRandomString = jest.fn().mockReturnValue(mockState);
      (authService as any).generateRandomString = mockGenerateRandomString;

      const expectedScope =
        'streaming user-read-email user-read-private user-read-currently-playing user-read-playback-state user-modify-playback-state';
      const expectedRedirectUri = `${BASE_URL}/auth/spotify-callback`;

      const resultUrl = await authService.spotifyLogin();

      const url = new URL(resultUrl);
      const queryParams = new URLSearchParams(url.search);

      expect(url.origin + url.pathname).toEqual('https://accounts.spotify.com/authorize/');
      expect(queryParams.get('response_type')).toEqual('code');
      expect(queryParams.get('client_id')).toEqual('mock_spotify_client_id');
      expect(queryParams.get('scope')).toEqual(expectedScope);
      expect(queryParams.get('redirect_uri')).toEqual(expectedRedirectUri);
      expect(queryParams.get('state')).toEqual(mockState);
      expect(mockGenerateRandomString).toHaveBeenCalledTimes(1);
    });
  });

  describe('spotifyCallback', () => {
    it('should successfully exchange authorization code for access and refresh tokens', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'mock_spotify_client_id';
      process.env.SPOTIFY_CLIENT_SECRET = 'mock_spotify_client_secret';
      const mockAuthCode = 'mock_authorization_code';
      const mockAccessToken = 'mock_spotify_access_token';
      const mockRefreshToken = 'mock_spotify_refresh_token';
      const mockExpiresIn = 3600;

      const mockAuthorizationCodeGrantResponse = {
        body: {
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          expires_in: mockExpiresIn,
        },
      };

      (mockSpotifyWebApiInstance.authorizationCodeGrant as jest.Mock).mockResolvedValue(
        mockAuthorizationCodeGrantResponse,
      );

      const result = await authService.spotifyCallback(mockAuthCode);

      expect(SpotifyWebApi).toHaveBeenCalledWith({
        redirectUri: `${BASE_URL}/auth/spotify-callback`,
        clientId: 'mock_spotify_client_id',
        clientSecret: 'mock_spotify_client_secret',
      });
      expect(mockSpotifyWebApiInstance.authorizationCodeGrant).toHaveBeenCalledWith(mockAuthCode);
      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        expires_in: mockExpiresIn,
      });
    });
  });

  describe('spotifyRefreshToken', () => {
    it('should successfully refresh access token using refresh token', async () => {
      process.env.SPOTIFY_CLIENT_ID = 'mock_spotify_client_id';
      process.env.SPOTIFY_CLIENT_SECRET = 'mock_spotify_client_secret';
      const mockRefreshToken = 'mock_user_refresh_token';
      const mockNewAccessToken = 'mock_new_spotify_access_token';
      const mockExpiresIn = 3600;

      const mockRefreshAccessTokenResponse = {
        body: {
          access_token: mockNewAccessToken,
          expires_in: mockExpiresIn,
        },
      };

      (mockSpotifyWebApiInstance.refreshAccessToken as jest.Mock).mockResolvedValue(
        mockRefreshAccessTokenResponse,
      );

      const result = await authService.spotifyRefreshToken(mockRefreshToken);

      expect(SpotifyWebApi).toHaveBeenCalledWith({
        redirectUri: `${BASE_URL}/auth/spotify-callback`,
        clientId: 'mock_spotify_client_id',
        clientSecret: 'mock_spotify_client_secret',
        refreshToken: mockRefreshToken, // Refresh token should be passed to constructor
      });
      expect(mockSpotifyWebApiInstance.refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        access_token: mockNewAccessToken,
        expires_in: mockExpiresIn,
      });
    });
  });
});
