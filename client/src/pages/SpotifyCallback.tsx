import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router';

const SpotifyCallback: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('spotify_token', token);
    }

    window.close();
  }, [searchParams]);

  return <></>;
};

export default SpotifyCallback;
