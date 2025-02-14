import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';

const RegisterConfirmation: React.FC = () => {
  const navigate = useNavigate();

  const navigateToOwnerLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container-sm flex flex-col items-center">
      <Helmet title="Signup Confirmation | JukeVibes" />
      <h2 className="title">Verification Successful</h2>
      <p className="text-sm font-medium mt-10">
        Your email has been successfully verified. You can now log in to your account.
      </p>
      <button className="button" onClick={navigateToOwnerLogin}>
        Login
      </button>
    </div>
  );
};

export default RegisterConfirmation;
