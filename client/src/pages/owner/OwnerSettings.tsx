import React from 'react';
import { useNavigate } from 'react-router';
import { logoutUser } from '../../utils/authUtils.ts';

const OwnerSettings: React.FC = () => {
  const navigate = useNavigate();

  const navigateToOwnerRequestPasswordChange = () => {
    navigate('/owner-auth-request-password-change');
  }
  const navigateToOwnerSubscription = () => {
    navigate('/owner-subscription');
  };

  const navigateToOwnerPreferences = () => {
    navigate('/owner-preferences');
  };

  const navigateToOwnerQRCode = () => {
    navigate('/owner-qr-code');
  };

  const navigateToOwnerMain = () => {
    navigate('/owner-main');
  };

  const handleLogout = () => {
      logoutUser().then((result) => {
        if (!result.success) {
          alert('Error logging out');
        }
        navigate('/owner-login'); 
      });
  };

  return (
    <div>
      <h1>Owner Settings</h1>
      <button onClick={navigateToOwnerMain} style={{ margin: '10px', padding: '10px 20px' }}>
        Back
      </button>
      <button
        onClick={navigateToOwnerRequestPasswordChange}
        style={{ margin: '10px', padding: '10px 20px' }}
      >
        Change Password
      </button>
      <button
        onClick={navigateToOwnerSubscription}
        style={{ margin: '10px', padding: '10px 20px' }}
      >
        Manage Subscription
      </button>
      <button onClick={navigateToOwnerPreferences} style={{ margin: '10px', padding: '10px 20px' }}>
        Preferences
      </button>
      <button onClick={navigateToOwnerQRCode} style={{ margin: '10px', padding: '10px 20px' }}>
        QR Code
      </button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default OwnerSettings;
