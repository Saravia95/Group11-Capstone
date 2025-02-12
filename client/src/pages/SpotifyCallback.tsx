import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useAuthStore } from '../stores/authStore';

const SpotifyCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setSpotifyTokens } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const ExpiresIn = searchParams.get('expires_in');

    if (accessToken && refreshToken && ExpiresIn) {
      setSpotifyTokens({
        accessToken,
        refreshToken,
        expiresIn: parseInt(ExpiresIn || '0', 10),
      });
    }

    window.close();
  }, [searchParams, setSpotifyTokens]);

  return <></>;
};

export default SpotifyCallback;
