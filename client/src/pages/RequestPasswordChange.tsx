import React, { useState } from 'react';
import { requestPasswordReset } from '../utils/authUtils';
import { Role } from '../types/auth';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';

interface IRequestPasswordChangeForm {
  email: string;
}

const RequestPasswordChange: React.FC = () => {
  const { user } = useAuthStore();
  const [isRequestSent, setIsRequestSent] = useState(false);
  const { register, handleSubmit, getValues } = useForm<IRequestPasswordChangeForm>({
    defaultValues: { email: user ? user.email : '' },
  });

  const handleRequestPasswordReset = () => {
    const { email } = getValues();

    requestPasswordReset(email).then((result) =>
      !result.success ? alert(result.message) : setIsRequestSent(true),
    );
  };

  return (
    <div className="container-sm flex flex-col gap-10 items-center">
      <h2 className="title">Reset Password</h2>

      {isRequestSent ? (
        <div>
          <h3 className="text-lg font-medium text-center">
            Password Reset Email Sent Successfully
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
            {...register('email', { disabled: user?.role === Role.ADMIN })}
            className="input disabled:opacity-50 text-center"
            type="email"
            placeholder="Enter your email"
          />
          <button className="button">Send reset password email</button>
        </form>
      )}
    </div>
  );
};

export default RequestPasswordChange;
