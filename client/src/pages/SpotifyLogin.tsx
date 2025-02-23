import React, { useEffect } from 'react';
import { spotifyLogin } from '../utils/authUtils';
import { Helmet } from 'react-helmet-async';

const SpotifyLogin: React.FC = () => {
  useEffect(() => {
    spotifyLogin();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Helmet title="Login with Spotify | JukeVibes" />
    </div>
  );
};

export default SpotifyLogin;
