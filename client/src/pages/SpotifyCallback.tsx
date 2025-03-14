import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { logoutUser } from '../utils/authUtils';

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSpotifyTokens } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = searchParams.get('access_token') as string;
    const refreshToken = searchParams.get('refresh_token') as string;
    const ExpiresIn = searchParams.get('expires_in');

    setIsLoading(false);

    if (!accessToken || !refreshToken || !ExpiresIn) {
      logoutUser().then(() => {
        navigate('/login');
      });
    }

    setSpotifyTokens({
      accessToken,
      refreshToken,
      expiresIn: parseInt(ExpiresIn || '0', 10),
    });

    navigate('/main');
  }, []);

  return (
    <>
      <Helmet title="Redirecting... | JukeVibes" />
      <h2 className="heading-2 mt-10 text-center">
        {isLoading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            &nbsp; Loading...
          </>
        ) : (
          'Oops, something went wrong :/'
        )}
      </h2>
    </>
  );
};

export default SpotifyCallback;
