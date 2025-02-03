import React, { useState } from 'react';
import { requestPasswordChange } from '../utils/authUtils';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import Back from '../components/Back';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types/auth';
import { Button } from '../components/Button';
import { FormErrorMsg } from '../components/FormErrorMsg';

interface IRequestPasswordChangeForm {
  email: string;
}

const RequestPasswordChange: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<IRequestPasswordChangeForm>({
    defaultValues: { email: user?.email || '' },
  });

  const handleRequestPasswordReset = async () => {
    setIsLoading(true);
    const { email } = getValues();

    await requestPasswordChange(email).then((result) => {
      setIsLoading(false);
      return !result.success ? setErrorMsg(result.message) : setIsRequestSent(true);
    });
    setIsLoading(false);
  };

  return (
    <div className="container-sm items-center">
      <Back to={`${isAuthenticated && user?.role === Role.ADMIN ? '/settings' : '/login'}`} />
      <h2 className="title">Change Password</h2>

      {isRequestSent ? (
        <div className="mt-10">
          <h3 className="text-lg font-medium text-center">
            Password Change Email Sent Successfully
          </h3>
          <div className="text-center mt-5">
            <Link to="/login" className="link">
              Go back to login
            </Link>
          </div>
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit(handleRequestPasswordReset)}>
          <input
            {...register('email', { required: 'Email is required' })}
            className="input disabled:opacity-50 text-center"
            type="email"
            placeholder="Enter your email"
          />
          {errors.email?.message && <FormErrorMsg errorMessage={errors.email.message} />}
          {errorMsg && <FormErrorMsg errorMessage={errorMsg} />}
          <Button disable={!isValid} loading={isLoading} actionText="Send change password email" />
        </form>
      )}
    </div>
  );
};

export default RequestPasswordChange;
