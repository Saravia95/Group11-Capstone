import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormErrorMsg } from '../../components/FormErrorMsg';
import { SubmitBtn } from '../../components/SubmitBtn';
import { resetPassword } from '../../utils/authUtils';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router';

interface IChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const OwnerChangePassword: React.FC = () => {
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
  } = useForm<IChangePasswordForm>();

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
      const params = new URLSearchParams(window.location.hash);

      const accessTokenParam = params.get('access_token');
      const refreshTokenParam = params.get('refresh_token');

      if (accessTokenParam && refreshTokenParam) {
        setAccessToken(accessTokenParam);
        setRefreshToken(refreshTokenParam);
      }
    }
  }, [passwordRecoveryActive]);

  const navigateToOwnerSettings = () => {
    navigate('/owner-settings');
  };

  const handleChangePassword = () => {
    const { newPassword } = getValues();

    resetPassword(accessToken, refreshToken, newPassword).then(() => {
      navigateToOwnerSettings();
    });
  };

  return (
    <div className="container-sm">
      <h2 className="title mb-10">Change Password</h2>

      <form className="form" onSubmit={handleSubmit(handleChangePassword)}>
        <input
          {...register('currentPassword', { required: 'Current Password is required' })}
          className="input"
          type="password"
          placeholder="Current Password"
        />
        {errors.currentPassword?.message && (
          <FormErrorMsg errorMessage={errors.currentPassword.message} />
        )}
        <input
          {...register('newPassword', { required: 'New Password is required', minLength: 6 })}
          className="input"
          type="password"
          placeholder="New Password"
        />
        {errors.newPassword?.message && <FormErrorMsg errorMessage={errors.newPassword.message} />}
        {errors.newPassword?.type === 'minLength' && (
          <FormErrorMsg errorMessage="Password must be at least 6 characters" />
        )}
        <input
          {...register('confirmPassword', {
            validate: (value: string) => value === watch('newPassword') || 'Passwords do not match',
          })}
          className="input"
          type="password"
          placeholder="Confirm Password"
        />
        {errors.confirmPassword?.type === 'validate' && (
          <FormErrorMsg errorMessage="Passwords do not match" />
        )}
        <SubmitBtn disable={!isValid} loading={false} actionText="Change Password" />
      </form>
    </div>
  );
};

export default OwnerChangePassword;
