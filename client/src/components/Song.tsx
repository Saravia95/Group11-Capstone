import { faCheck, faSort, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { resetRejectedSong, reviewSong } from '../utils/songUtils';

interface ISongProps {
  id: string;
  coverImage: string;
  songTitle: string;
  artistName: string;
  playTime: string;
  status: string;
  isAdmin: boolean;
  isPlaying?: boolean;
  onClick?: () => void;
}

const Song: React.FC<ISongProps> = ({
  id,
  coverImage,
  songTitle,
  artistName,
  playTime,
  status,
  isAdmin,
  isPlaying = false,
  onClick,
}) => {
  const handleReviewSong = async (approved: boolean) => {
    await reviewSong(id, approved);
  };

  const handleResetRejectedSong = async (id: string) => {
    await resetRejectedSong(id);
  };

  return (
    <div
      className={`peer group flex w-full min-w-0 items-center rounded-lg transition-colors ${status === 'approved' ? 'hover:cursor-pointer' : 'animate-slide-up'} tablet:px-2 px-1 hover:bg-black`}
      {...(status === 'approved' && { onClick })}
    >
      {status === 'approved' && (
        <FontAwesomeIcon
          icon={faSort}
          className="tablet:mr-3 mr-2 cursor-grab text-slate-300 hover:text-slate-100 active:cursor-grabbing"
        />
      )}
      <div
        className="tablet:w-16 aspect-square w-12 rounded bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className={`relative h-full w-full rounded ${isPlaying ? 'bg-black/50' : ''}`}>
          {isPlaying && (
            <div className="absolute right-1 bottom-1 flex aspect-square w-1/2 justify-center">
              <div className="bar-animation1 absolute bottom-0 left-1 h-1 w-1 bg-white"></div>
              <div className="bar-animation2 absolute bottom-0 h-1 w-1 bg-white delay-150"></div>
              <div className="bar-animation3 absolute right-1 bottom-0 h-1 w-1 bg-white delay-300"></div>
            </div>
          )}
        </div>
      </div>
      <div className="flex w-full min-w-0 items-center justify-between">
        <div className="tablet:p-3 overflow-hidden p-2">
          <p className="tablet:text-2xl overflow-hidden text-lg overflow-ellipsis whitespace-nowrap">
            <span className="hover-slide group-hover:animate-slideText inline-block min-w-full">
              {songTitle}
            </span>
          </p>
          <p className="tablet:mt-2 tablet:text-base mt-1 text-sm">
            {artistName} · {playTime}
          </p>
        </div>
        {isAdmin && (
          <div className="tablet:text-2xl tablet:pl-4 shrink-0 pl-2 text-xl">
            {status === 'pending' && (
              <button
                className="border-none bg-transparent p-0 hover:text-green-500/90"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReviewSong(true);
                }}
              >
                <FontAwesomeIcon icon={faCheck} className="cursor-pointer" />
              </button>
            )}

            <button
              className="mx-2 border-none bg-transparent p-0 hover:text-red-500/90"
              onClick={(e) => {
                e.stopPropagation();
                if (status === 'approved') {
                  handleReviewSong(false);
                } else {
                  handleResetRejectedSong(id);
                }
              }}
            >
              <FontAwesomeIcon icon={faXmark} className="cursor-pointer text-red-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Song;
