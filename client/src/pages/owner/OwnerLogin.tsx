import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { handleLogin } from '../../utils/authUtils';

interface ILoginForm {
  email: string;
  password: string;
}

const OwnerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { register, getValues, handleSubmit } = useForm<ILoginForm>();

  const navigateToOwnerRegister = () => {
    navigate('/owner-register');
  };

  const onLogin = () => {
    const { email, password } = getValues();
    handleLogin(email, password);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onLogin)}>
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
