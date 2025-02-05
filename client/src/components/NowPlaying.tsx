import React, { useEffect, useState } from 'react';
import { getSpotifyToken } from '../utils/authUtils';

const NowPlaying: React.FC = () => {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    getSpotifyToken().then(({ access_token }) => {
      setToken(access_token);
    });
  }, []);

  useEffect(() => {
    if (!token) {
      window.open('http://localhost:5173/spotify-login', '_blank', 'width=600,height=800');
    }
  }, [token]);

  return (
    // <div className="flex flex-col justify-center w-full p-4 lg:p-8 lg:border-r border-slate-500">
    //   {/* possible to create a gradient background that matches the color of the cover image, similar to YouTube Music? */}
    //   <div className="border w-full max-w-screen-sm max-h-60 lg:max-h-96 aspect-square mx-auto">
    //     Cover Image
    //   </div>
    //   <p className="text-center text-3xl lg:text-5xl mt-5">Song Title</p>
    //   <p className="text-center text-xl lg:text-4xl mt-3">Artist Name</p>
    //   {/* TODO: Play Time? */}
    // </div>
    <>{token && <div>Player</div>}</>
  );
};

export default NowPlaying;
