import React from 'react';
// import { useNavigate } from 'react-router';
import NowPlaying from '../components/NowPlaying';
import Playlist from '../components/Playlist';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../stores/authStore';
import Player from '../components/Player';
import { Role } from '../types/auth';

const Main: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="container w-full flex flex-col lg:flex-row h-[95vh]">
      <Helmet title="JukeVibes" />
      {user?.role === Role.ADMIN ? <Player /> : <NowPlaying />}
      <Playlist />
    </div>
  );
};

export default Main;
