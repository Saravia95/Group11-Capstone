import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormErrorMsg } from '../components/FormErrorMsg';
import { Button } from '../components/Button';
import { resetPassword } from '../utils/authUtils';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router';

interface IResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [passwordRecoveryActive, setPasswordRecoveryActive] = useState(false);
  const {
    register,
    getValues,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<IResetPasswordForm>();

  useEffect(() => {
    const checkAuthState = async () => {
      const { data } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecoveryActive(true);
        }
      });
      return () => {
        // Cleanup subscription
        data.subscription.unsubscribe();
      };
    };
    checkAuthState();
  }, []);

  useEffect(() => {
    if (!passwordRecoveryActive) {
      const params = new URLSearchParams(window.location.hash.substring(1));

      const accessTokenParam = params.get('access_token');
      const refreshTokenParam = params.get('refresh_token');

      if (accessTokenParam && refreshTokenParam) {
        setAccessToken(accessTokenParam);
        setRefreshToken(refreshTokenParam);
      }
    }
  }, [passwordRecoveryActive]);

  const navigateToOwnerSettings = () => {
    navigate('/settings');
  };

  const handleResetPassword = () => {
    const { newPassword } = getValues();

    resetPassword(accessToken, refreshToken, newPassword).then(() => {
      navigateToOwnerSettings();
    });
  };

  return (
    <div className="container-sm">
      <h2 className="title">
        {passwordRecoveryActive ? 'Change Password' : 'Oops! Something went wrong'}
      </h2>

      {passwordRecoveryActive && (
        <form className="form mt-10" onSubmit={handleSubmit(handleResetPassword)}>
          <input
            {...register('newPassword', { required: 'New Password is required', minLength: 6 })}
            className="input"
            type="password"
            placeholder="New Password"
          />
          {errors.newPassword?.message && (
            <FormErrorMsg errorMessage={errors.newPassword.message} />
          )}
          {errors.newPassword?.type === 'minLength' && (
            <FormErrorMsg errorMessage="Password must be at least 6 characters" />
          )}
          <input
            {...register('confirmPassword', {
              validate: (value: string) =>
                value === watch('newPassword') || 'Passwords do not match',
            })}
            className="input"
            type="password"
            placeholder="Confirm Password"
          />
          {errors.confirmPassword?.type === 'validate' && (
            <FormErrorMsg errorMessage="Passwords do not match" />
          )}
          <Button disable={!isValid} actionText="Reset Password" />
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
