import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { authenticateUser } from '../../utils/authUtils.ts';
import { useAuthStore } from '../../stores/authStore.ts';

interface ILoginForm {
  email: string;
  password: string;
}

const OwnerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { register, getValues, handleSubmit } = useForm<ILoginForm>();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/owner-main');
    }
  });

  const navigateToOwnerRegister = () => {
    navigate('/owner-register');
  };

  const handleLogin = () => {
    const { email, password } = getValues();

    authenticateUser(email, password).then((result) => {
      if (!result.success) {
        alert('Invalid email or password');
      }
    });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(handleLogin)}>
        <input
          {...register('email', { required: 'Email is required' })}
          type="email"
          placeholder="Email"
        />

        <input
          {...register('password', { required: 'Password is required' })}
          type="password"
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      <button
        type="submit"
        onClick={navigateToOwnerRegister}
        style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}
      >
        Register
      </button>
    </div>
  );
};

export default OwnerLogin;
