import React from 'react';
import Back from '../components/Back';
import { useForm } from 'react-hook-form';
import { FormErrorMsg } from '../components/FormErrorMsg';
import { Button } from '../components/Button';

interface IChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<IChangePasswordForm>();

  const handleChangePassword = () => {};

  return (
    <div className="container-sm">
      <Back to="/settings" />
      <h2 className="title">Change Password</h2>
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
        <Button disable={!isValid} actionText="Change Password" />
      </form>
    </div>
  );
};

export default ChangePassword;
