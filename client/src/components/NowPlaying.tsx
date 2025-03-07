import React, { useEffect } from 'react';
import { useRequestSongStore } from '../stores/requestSongStore';
import { Helmet } from 'react-helmet-async';

const NowPlaying: React.FC = () => {
  const { approvedSongs, currentTrackIndex } = useRequestSongStore();
  const [currentTrack, setCurrentTrack] = React.useState(approvedSongs[currentTrackIndex]);

  useEffect(() => {
    setCurrentTrack(approvedSongs[currentTrackIndex]);
  }, [currentTrackIndex, approvedSongs]);

  return (
    <div className="container">
      {currentTrack?.song_title && <Helmet title={`🎵 ${currentTrack.song_title} | JukeVibes`} />}
      {currentTrack && (
        <div className="flex flex-col items-center gap-5">
          <h3 className="text-4xl px-3 pb-5 font-medium place-self-start">Now Playing</h3>
          <div
            className="w-1/2 lg:w-full aspect-square bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${currentTrack.cover_image})` }}
          ></div>

          <div className="text-center">
            <h3 className="text-3xl font-medium">{currentTrack.song_title}</h3>
            <p className="mt-3">{currentTrack.artist_name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NowPlaying;
