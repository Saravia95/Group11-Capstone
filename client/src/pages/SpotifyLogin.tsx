import React, { useEffect } from 'react';
import { spotifyLogin } from '../utils/authUtils';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const SpotifyLogin: React.FC = () => {
  useEffect(() => {
    spotifyLogin();
  }, []);

  return (
    <div className="container">
      <Helmet title="Login with Spotify | JukeVibes" />
      <h2 className="title">
        <FontAwesomeIcon icon={faSpinner} spin />
        &nbsp; Loading...
      </h2>
    </div>
  );
};

export default SpotifyLogin;
