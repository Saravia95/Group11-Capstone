import React from 'react';
import { Link, useNavigate } from 'react-router';
import { logoutUser } from '../utils/authUtils.ts';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser().then((result) => {
      if (!result.success) {
        alert(result.message);
      }
      navigate('/login');
    });
  };

  return (
    <div className="container-sm">
      <h2 className="title">Settings</h2>
      <div className="list">
        <Link to="/auth-request-password-change" className="list-item">
          Change Password
        </Link>
        <Link to="/subscription" className="list-item">
          Manage Subscription
        </Link>
        <Link to="/preferences" className="list-item">
          Preferences
        </Link>
        <Link to="/qr-code" className="list-item">
          QR Code
        </Link>
        <button className="list-item w-full cursor-pointer text-red-600/80" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
