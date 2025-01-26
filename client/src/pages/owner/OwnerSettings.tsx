import React from 'react';
import { Link, useNavigate } from 'react-router';
import { logoutUser } from '../../utils/authUtils.ts';

const OwnerSettings: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser().then((result) => {
      if (!result.success) {
        alert('Error logging out');
      }
      navigate('/owner-login');
    });
  };

  return (
    <div className="container-sm">
      <h2 className="title">Settings</h2>
      <div className="setting-list">
        <Link to="/owner-change-password" className="setting-list-item">
          Change Password
        </Link>
        <Link to="/owner-subscription" className="setting-list-item">
          Manage Subscription
        </Link>
        <Link to="/owner-preferences" className="setting-list-item">
          Preferences
        </Link>
        <Link to="/owner-qr-code" className="setting-list-item">
          QR Code
        </Link>
        <button
          className="setting-list-item w-full cursor-pointer text-red-600/80"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default OwnerSettings;
