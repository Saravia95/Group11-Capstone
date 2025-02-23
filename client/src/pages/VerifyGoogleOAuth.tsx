import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { logoutUser, verifySession } from '../utils/authUtils';
import { Helmet } from 'react-helmet-async';

const VerifyGoogleOAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  useEffect(() => {
    setIsVerifying(true);

    verifySession()
      .then((response) => {
        if (response.success) {
          window.open('http://localhost:5173/spotify-login', '_blank');
        }
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [navigate]);

  window.addEventListener('message', (event) => {
    if (event.origin === 'http://localhost:5173' && event.data === 'spotify-login-success') {
      return navigate('/main');
    } else if (event.origin === 'http://localhost:5173' && event.data === 'spotify-login-failed') {
      logoutUser().then((res) => {
        if (res.success) {
          navigate('/login', { replace: true });
        }
      });
    }
  });

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
