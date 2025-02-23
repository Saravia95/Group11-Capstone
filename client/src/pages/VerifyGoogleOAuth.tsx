import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { logoutUser, verifySession } from '../utils/authUtils';
import { Helmet } from 'react-helmet-async';

const SPOTIFY_LOGIN_POPUP_URL = 'http://localhost:5173/spotify-login';
const APP_ORIGIN = 'http://localhost:5173';

const VerifyGoogleOAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  useEffect(() => {
    setIsVerifying(true);

    verifySession()
      .then((response) => {
        if (response.success) {
          window.open(SPOTIFY_LOGIN_POPUP_URL, '_blank');
        }
      })
      .finally(() => {
        setIsVerifying(false);
      });

    const messageListener = (event: MessageEvent) => {
      if (event.origin === APP_ORIGIN && event.data === 'spotify-login-success') {
        return navigate('/main');
      } else if (event.origin === APP_ORIGIN && event.data === 'spotify-login-failed') {
        logoutUser().then((res) => {
          if (res.success) {
            return navigate('/login', { replace: true });
          }
        });
      }
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [navigate]);

  return (
    <div className="container">
      <Helmet title="Loading... | JukeVibes" />
      <h2 className="title">
        {isVerifying ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            &nbsp; Loading...
          </>
        ) : (
          'Oops, something went wrong :/'
        )}
      </h2>
    </div>
  );
};

export default VerifyGoogleOAuth;
