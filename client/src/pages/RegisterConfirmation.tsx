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
      <h2 className="heading-2 mt-10 text-center">Verification Successful</h2>
      <p className="mt-10 text-sm font-medium">
        Your email has been successfully verified. You can now log in to your account.
      </p>
      <button className="button" onClick={navigateToOwnerLogin}>
        Login
      </button>
    </div>
  );
};

export default RegisterConfirmation;
