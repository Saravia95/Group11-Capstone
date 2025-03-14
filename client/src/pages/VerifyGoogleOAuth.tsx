import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { logoutUser, verifySession } from '../utils/authUtils';
import { Helmet } from 'react-helmet-async';
import { BASE_URL } from '../constants/baseUrl';

const VerifyGoogleOAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  useEffect(() => {
    setIsVerifying(true);

    verifySession()
      .then((response) => {
        if (response.success) {
          navigate('/spotify-login');
        }
      })
      .finally(() => {
        setIsVerifying(false);
      });

    const messageListener = (event: MessageEvent) => {
      if (event.origin === BASE_URL && event.data === 'spotify-login-success') {
        return navigate('/main');
      } else if (event.origin === BASE_URL && event.data === 'spotify-login-failed') {
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
      <h2 className="heading-2 mt-10 text-center">
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
