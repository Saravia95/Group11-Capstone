import React from 'react';
import { useNavigate } from 'react-router';
import NowPlaying from '../../components/NowPlaying';
import axiosInstance from '../../axiosInstance';

const OwnerMain: React.FC = () => {
  const navigate = useNavigate(); // Use the navigate function to navigate to a different route

  const navigateToSongLibrary = () => {
    navigate('/owner-song-library');
  };
  const navigateToOwnerSettings = () => {
    navigate('/owner-settings');
  };

  axiosInstance
    .get('/validate-database')
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Owner Main</h1>
      <p>Manage your playlists and control the music experience for your guests.</p>

      <div style={{ marginTop: '20px' }}>
        <NowPlaying />
        <button onClick={navigateToSongLibrary} style={{ margin: '10px', padding: '10px 20px' }}>
          Song Library
        </button>
        <button style={{ margin: '10px', padding: '10px 20px' }}>View Request Line Up</button>
        <button onClick={navigateToOwnerSettings} style={{ margin: '10px', padding: '10px 20px' }}>
          Settings
        </button>
      </div>
    </div>
  );
};

export default OwnerMain;
