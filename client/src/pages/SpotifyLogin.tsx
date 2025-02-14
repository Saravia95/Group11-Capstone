import React from 'react';
import { spotifyLogin } from '../utils/authUtils';
import { Helmet } from 'react-helmet-async';

const SpotifyLogin: React.FC = () => {
  const handleSpotifyLogin = async () => {
    // Redirect to Spotify login
    await spotifyLogin();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Helmet title="Login with Spotify | JukeVibes" />
      <h2 className="m-5">To use the Spotify player SDK, you need to log in to Spotify</h2>
      <span className="button" onClick={handleSpotifyLogin}>
        Login with Spotify
      </span>
    </div>
  );
};

export default SpotifyLogin;
