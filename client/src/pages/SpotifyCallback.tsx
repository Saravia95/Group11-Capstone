import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { Helmet } from 'react-helmet-async';

const SpotifyCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setSpotifyTokens } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('access_token') as string;
    const refreshToken = searchParams.get('refresh_token') as string;
    const ExpiresIn = searchParams.get('expires_in');

    if (!accessToken || !refreshToken || !ExpiresIn) {
      return postMessage('spotify-login-failed');
    }

    setSpotifyTokens({
      accessToken,
      refreshToken,
      expiresIn: parseInt(ExpiresIn || '0', 10),
    });

    return postMessage('spotify-login-success');
  }, [searchParams, setSpotifyTokens]);

  const postMessage = (message: string) => {
    window.opener?.postMessage(message, window.location.origin);
    window.close();
  };

  return (
    <>
      <Helmet title="Redirecting... | JukeVibes" />
    </>
  );
};

export default SpotifyCallback;
