import React from 'react';
import { Link, useNavigate } from 'react-router';
import { logoutUser } from '../utils/authUtils.ts';
import Back from '../components/Back.tsx';
import { Helmet } from 'react-helmet-async';

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
      <Helmet title="Setting | JukeVibes" />
      <Back to="/main" />
      <h2 className="heading-2 mt-10 text-center">Settings</h2>
      <div className="list">
        <Link to="/request-password-reset" className="list-item">
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
