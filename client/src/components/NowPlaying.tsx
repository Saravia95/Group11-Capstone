import React, { useEffect, useState } from 'react';
import { RequestSong, useRequestSongStore } from '../stores/requestSongStore';
import { Helmet } from 'react-helmet-async';

const NowPlaying: React.FC = () => {
  const { approvedSongs } = useRequestSongStore();
  const [currentTrack, setCurrentTrack] = useState<RequestSong>(
    approvedSongs.find((song) => song.is_playing) || approvedSongs[0],
  );

  useEffect(() => {
    setCurrentTrack(approvedSongs.find((song) => song.is_playing) || approvedSongs[0]);
  }, [approvedSongs]);

  return (
    <div className="laptop:h-[90vh] laptop:items-center laptop:justify-center laptop:p-16 w-full rounded-lg p-4">
      {currentTrack?.song_title && <Helmet title={`🎵 ${currentTrack.song_title} | JukeVibes`} />}
      {currentTrack && (
        <div className="laptop:w-[90%] flex flex-col gap-3">
          <h3 className="heading-2 laptop:hidden place-self-start">Now Playing</h3>
          <div className="laptop:flex-col laptop:bg-transparent flex flex-row items-center gap-5 rounded-lg bg-black/50 p-3">
            <div
              className="laptop:size-full mobile:size-20 tablet:size-24 aspect-square rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${currentTrack.cover_image})` }}
            ></div>
            <div className="laptop:text-center overflow-hidden">
              <h3 className="heading-3 overflow-hidden text-left text-ellipsis whitespace-nowrap">
                {currentTrack.song_title}
              </h3>
              <p className="laptop:mt-3 body-2 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {currentTrack.artist_name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NowPlaying;
