import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { authenticateUser } from '../utils/authUtils.ts';
import { Role, useAuthStore } from '../stores/authStore.ts';
import { FormErrorMsg } from '../components/FormErrorMsg.tsx';
import { Button } from '../components/Button.tsx';

interface ILoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ILoginForm>();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === Role.Admin) {
      navigate('/main');
    }
  }, [user, navigate]);

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
    <div className="container-sm">
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
        <Button disable={!isValid} loading={loading} actionText="Login" />
      </form>
      <div className="mt-5 text-center">
        <Link to="/request-password-change" className="link">
          Forgot Password?
        </Link>
      </div>
      <div className="mt-5 text-center">
        New to JukeVibes? &nbsp;
        <Link to="/register" className="link">
          Create an Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
