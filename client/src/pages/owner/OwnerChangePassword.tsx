import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../config/supabase';
import { resetPassword } from '../../utils/authUtils.ts';


const OwnerChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [passwordRecoveryActive, setPasswordRecoveryActive] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigateToOwnerSettings = () => {
    navigate('/owner-settings');
  };




useEffect(() => { 
  const checkAuthState = async () => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('event', event);
      if (event === 'PASSWORD_RECOVERY') {
        

        setPasswordRecoveryActive(true);
        if (session?.access_token) {
          

          //supabase.auth.getUser()
          console.log(session.access_token, "session.access_token");
          //setAccessToken(session.access_token);
        }
      }   
    });
    return () => {
      // Cleanup subscription
      data.subscription.unsubscribe();

    }
  }
    checkAuthState();
},[]);



  useEffect(() => {

    if(!passwordRecoveryActive)
    {
        const url = window.location.hash.substring(1);
        const params = new URLSearchParams(url);
        const token = params.get('access_token');
        if (token) {
      //    console.log(token, "token");
          setAccessToken(token);
        }
    }

  }, [passwordRecoveryActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    // Add logic to handle password change

    resetPassword(accessToken , newPassword).then(() => {
      //alert('Password changed successfully');
      navigateToOwnerSettings();
    });


    //console.log('Password changed successfully');
  };

  return (
    <>
 { !passwordRecoveryActive && <div><button onClick={navigateToOwnerSettings}>Back</button></div>
}



    { passwordRecoveryActive &&
    <div>
      <button onClick={navigateToOwnerSettings}>Back</button>

      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
    </div>
    }
    </>
  );
};

export default OwnerChangePassword;
