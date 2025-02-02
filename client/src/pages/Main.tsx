import React from 'react';
// import { useNavigate } from 'react-router';
import NowPlaying from '../components/NowPlaying';
import Playlist from '../components/Playlist';

const Main: React.FC = () => {
  return (
    <div className="container w-full flex flex-col lg:flex-row h-[95vh]">
      {/* Now Playing */}
      <NowPlaying />
      {/* Toggle playist? */}
      <Playlist />
    </div>
  );
};

export default Main;
