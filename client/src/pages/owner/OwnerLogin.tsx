import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { authenticateUser } from '../../utils/authUtils.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { FormErrorMsg } from '../../components/FormErrorMsg.tsx';
import { SubmitBtn } from '../../components/SubmitBtn.tsx';

interface ILoginForm {
  email: string;
  password: string;
}

const OwnerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginForm>();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/owner-main');
    }
  });

  const handleLogin = () => {
    setLoading(true);
    const { email, password } = getValues();

    authenticateUser(email, password).then((result) => {
      if (!result.success) {
        alert('Invalid email or password');
      }
    });
    setLoading(false);
  };

  return (
    <div className="container">
      <h4 className="w-full font-medium text-lg lg:text-3xl">Welcome Back!</h4>
      <form className="w-full grid gap-3 mt-5" onSubmit={handleSubmit(handleLogin)}>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern:
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          })}
          className="input"
          type="text"
          placeholder="Email"
        />
        {errors.email?.message && <FormErrorMsg errorMessage={errors.email?.message} />}
        {errors.email?.type === 'pattern' && (
          <FormErrorMsg errorMessage="Please enter a valid email" />
        )}
        <input
          {...register('password', { required: 'Password is required' })}
          className="input"
          type="password"
          placeholder="Password"
        />
        <Link to="/owner-request-password-change" className="link">
         Forgot Password?
        </Link>
        {errors.password?.message && <FormErrorMsg errorMessage={errors.password?.message} />}
        <SubmitBtn disable={false} loading={loading} actionText="Login" />
      </form>
      <div className="mt-5">
        New to JukeVibes? &nbsp;
        <Link to="/owner-register" className="link">
          Create an Account
        </Link>
      </div>
    </div>
  );
};

export default OwnerLogin;
