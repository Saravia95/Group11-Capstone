import React from 'react';
import { useNavigate } from 'react-router';

const OwnerRegisterConfirmation: React.FC = () => {
  const navigate = useNavigate();

  const navigateToOwnerLogin = () => {
    navigate('/owner-login');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Verification Successful</h1>
      <p>Your email/phone has been successfully verified. You can now log in to your account.</p>
      <button onClick={navigateToOwnerLogin}>Login</button>
    </div>
  );
};

export default OwnerRegisterConfirmation;
