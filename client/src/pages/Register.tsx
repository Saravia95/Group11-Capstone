import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { FormErrorMsg } from '../components/FormErrorMsg';
import { registerUser } from '../utils/authUtils';
import { Role, useAuthStore } from '../stores/authStore';
import { Button } from '../components/Button';

interface IRegisterForm {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const {
    register,
    getValues,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<IRegisterForm>();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === Role.Admin) {
      navigate('/main');
    }
  });

  const handleSignUp = async () => {
    setLoading(true);
    const { displayName, firstName, lastName, email, password } = getValues();

    await registerUser(displayName, firstName, lastName, email, password).then((res) => {
      setLoading(false);
      return res.success ? navigate('/login') : setErrorMsg(res.message);
    });
    setLoading(false);
  };

  return (
    <div className="container-sm">
      <h2 className="w-full font-bold text-4xl lg:text-5xl text-center mt-24 lg:mt-32">
        JukeVibes
      </h2>
      <h3 className="w-full font-medium text-2xl lg:text-3xl mt-10">Let's get started</h3>
      <form className="form" onSubmit={handleSubmit(handleSignUp)}>
        <input
          {...register('displayName', { required: 'Display Name is required' })}
          className="input"
          type="text"
          placeholder="Display Name"
        />
        {errors.displayName?.message && <FormErrorMsg errorMessage={errors.displayName?.message} />}
        <div className="grid grid-cols-2 gap-x-3">
          <div>
            <input
              {...register('firstName', { required: 'First Name is required' })}
              className="input w-full"
              type="text"
              placeholder="First Name"
            />
            {errors.firstName?.message && (
              <div className="text-center pt-3">
                <FormErrorMsg errorMessage={errors.firstName?.message} />
              </div>
            )}
          </div>
          <div>
            <input
              {...register('lastName', { required: 'Last Name is required' })}
              className="input w-full"
              type="text"
              placeholder="Last Name"
            />
            {errors.lastName?.message && (
              <div className="text-center pt-3">
                <FormErrorMsg errorMessage={errors.lastName?.message} />
              </div>
            )}
          </div>
        </div>
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
        {errors.password?.type === 'minLength' && (
          <FormErrorMsg errorMessage="Password must be more than 6 chars" />
        )}
        <input
          {...register('confirmPassword', {
            validate: (value: string) => value === watch('password') || 'Passwords do not match',
          })}
          className="input"
          type="password"
          placeholder="Confirm Password"
        />
        {errors.confirmPassword?.type === 'validate' && (
          <FormErrorMsg errorMessage="Passwords do not match" />
        )}
        {errorMsg && <FormErrorMsg errorMessage={errorMsg} />}
        <Button disable={!isValid} loading={loading} actionText="Register" />
      </form>
      <div className="mt-5 text-center">
        Already have an account? &nbsp;
        <Link to="/login" className="link">
          Login
        </Link>{' '}
      </div>
    </div>
  );
};

export default Register;
