import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { authenticateUser } from '../../utils/authUtils.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { FormErrorMsg } from '../../components/FormErrorMsg.tsx';

interface ILoginForm {
  email: string;
  password: string;
}

const OwnerLogin: React.FC = () => {
  const navigate = useNavigate();
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
    const { email, password } = getValues();

    authenticateUser(email, password).then((result) => {
      if (!result.success) {
        alert('Invalid email or password');
      }
    });
  };

  return (
    <div className="container">
      <h4 className="w-full font-medium text-lg lg:text-3xl">Weclom Back!</h4>
      <form className="w-full grid gap-3 mt-5" onSubmit={handleSubmit(handleLogin)}>
        <input
          {...register('email', { required: 'Email is required' })}
          className="input"
          type="email"
          placeholder="Email"
        />
        {errors.email?.message && <FormErrorMsg errorMessage={errors.email?.message} />}
        <input
          {...register('password', { required: 'Password is required' })}
          className="input"
          type="password"
          placeholder="Password"
        />
        {errors.password?.message && <FormErrorMsg errorMessage={errors.password?.message} />}
        <button className="button" type="submit">
          Login
        </button>
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
