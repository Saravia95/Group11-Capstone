import React from 'react';
// import { useNavigate } from 'react-router';
import NowPlaying from '../components/NowPlaying';
import Playlist from '../components/Playlist';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../stores/authStore';
import Player from '../components/Player';
import { Role } from '../types/auth';
import RequireMembership from '../components/RequireMembership';

const Main: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="laptop:flex-row container flex h-[95vh] w-full flex-col">
      <Helmet title="JukeVibes" />
      <RequireMembership />
      {user?.role === Role.ADMIN ? <Player /> : <NowPlaying />}
      <Playlist />
    </div>
  );
};

export default Main;
