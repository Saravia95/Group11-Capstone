import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { verifySession } from '../utils/authUtils';
import { Helmet } from 'react-helmet-async';

const VerifyGoogleOAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  useEffect(() => {
    setIsVerifying(true);

    verifySession()
      .then((response) => {
        if (response.success) {
          // navigate('/main');
        }
      })
      .finally(() => {
        setIsVerifying(false);
      });
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
