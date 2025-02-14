import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { authenticateUser, authenticateUserWithGoogle } from '../utils/authUtils.ts';
import { Role } from '../types/auth';
import { useAuthStore } from '../stores/authStore.ts';
import { FormErrorMsg } from '../components/FormErrorMsg.tsx';
import { Button } from '../components/Button.tsx';
import { Helmet } from 'react-helmet-async';

interface ILoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ILoginForm>();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === Role.ADMIN) {
      navigate('/main');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    const { email, password } = getValues();

    await authenticateUser(email, password).then((res) => {
      setLoading(false);
      return res.success ? navigate('/main') : setErrorMsg(res.message);
    });

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    console.log('Google Login');
    await authenticateUserWithGoogle().then((res) => {
      if (!res?.success) {
        // navigate('/login');
      }
    });
  };

  return (
    <div className="container-sm">
      <Helmet title="Login | JukeVibes" />
      <h2 className="title">JukeVibes</h2>
      <h3 className="w-full font-medium text-2xl lg:text-3xl mt-10">Welcome Back!</h3>
      <form className="form" onSubmit={handleSubmit(handleLogin)}>
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
          {...register('password', { required: 'Password is required', minLength: 6 })}
          className="input"
          type="password"
          placeholder="Password"
        />
        {errors.password?.message && <FormErrorMsg errorMessage={errors.password?.message} />}
        {errorMsg && <FormErrorMsg errorMessage={errorMsg} />}
        <Button disable={!isValid} loading={loading} actionText="Login" />
      </form>
      <div className="mt-5 text-center">
        <Link to="/request-password-reset" className="link">
          Forgot Password?
        </Link>
      </div>
      <div className="mt-2 text-center">
        New to JukeVibes? &nbsp;
        <Link to="/register" className="link">
          Create an Account
        </Link>
      </div>
      <div className="py-3 flex items-center text-sm text-gray-300 before:border-neutral-600 after:border-neutral-600 before:flex-1 before:border-t before:me-6 after:flex-1 after:border-t after:ms-6">
        or
      </div>
      <button
        className="px-4 py-3 text-lg text-black rounded bg-slate-100 hover:bg-slate-300 disabled:opacity-50 transition-colors cursor-pointer w-full flex items-center justify-center"
        onClick={handleGoogleLogin}
      >
        <img
          src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
          className="w-5"
        />
        <span className="ms-2">Login with Google</span>
      </button>
    </div>
  );
};

export default Login;
