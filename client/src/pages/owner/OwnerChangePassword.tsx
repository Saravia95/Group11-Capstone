import React from 'react';
import { useForm } from 'react-hook-form';
import { FormErrorMsg } from '../../components/FormErrorMsg';
import { SubmitBtn } from '../../components/SubmitBtn';

interface IChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const OwnerChangePassword: React.FC = () => {
  const {
    register,
    getValues,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<IChangePasswordForm>();

  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = getValues();
    console.log(currentPassword, newPassword, confirmPassword);
    // if (newPassword !== confirmPassword) {
    //   alert('New password and confirm password do not match');
    //   return;
    // }
    // // Add logic to handle password change
    // console.log('Password changed successfully');
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
