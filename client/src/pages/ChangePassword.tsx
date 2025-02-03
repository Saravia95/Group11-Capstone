import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormErrorMsg } from '../components/FormErrorMsg';
import { Button } from '../components/Button';
import { changePassword as changePassword } from '../utils/authUtils';
import { useNavigate } from 'react-router';
import { useTokensFromURL } from '../hooks/useTokensFromURL';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';

interface IResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const passwordRecoveryActive = usePasswordRecovery();
  const { accessToken, refreshToken } = useTokensFromURL(!passwordRecoveryActive);

  const {
    register,
    getValues,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<IResetPasswordForm>();

  const handleChangePassword = async () => {
    setIsLoading(true);
    const { newPassword } = getValues();

    await changePassword(accessToken, refreshToken, newPassword).then((res) => {
      setIsLoading(false);
      return res.success ? navigate('/login') : setErrorMsg(res.message);
    });
    setIsLoading(false);
  };

  return (
    <div className="container-sm">
      <h2 className="title">
        {passwordRecoveryActive ? 'Change Password' : 'Oops! Something went wrong'}
      </h2>

      {passwordRecoveryActive && (
        <form className="form mt-10" onSubmit={handleSubmit(handleChangePassword)}>
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
          {errorMsg && <FormErrorMsg errorMessage={errorMsg} />}
          <Button disable={!isValid} loading={isLoading} actionText="Reset Password" />
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
