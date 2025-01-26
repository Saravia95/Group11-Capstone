import React from 'react';
// import { useNavigate } from 'react-router';
import NowPlaying from '../components/NowPlaying';
import Playlist from '../components/Playlist';

const Main: React.FC = () => {
  return (
    <div className="container flex flex-col items-center">
      {/* Now Playing */}
      <NowPlaying />
      <Playlist />

      {/* <div style={{ marginTop: '20px' }}>
        <button onClick={navigateToSongLibrary} style={{ margin: '10px', padding: '10px 20px' }}>
          Song Library
        </button>
        <button style={{ margin: '10px', padding: '10px 20px' }}>View Request Line Up</button>
      </div> */}
    </div>
  );
};

export default Main;
