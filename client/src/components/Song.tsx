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
  isPlyaing?: boolean;
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
  isPlyaing = false,
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
      className={`
      flex items-center w-full px-2 rounded hover:bg-black transition-colors peer group
      ${status === 'pending' ? 'animate-slide-up' : 'hover:cursor-pointer'}
    `}
      {...(status === 'approved' && { onClick })}
    >
      {status === 'approved' && (
        <FontAwesomeIcon
          icon={faSort}
          className="mr-3 text-slate-300 hover:text-slate-100 cursor-grab active:cursor-grabbing"
        />
      )}
      <div
        className="w-16 aspect-square bg-cover bg-center rounded"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className={`relative w-full h-full rounded ${isPlyaing ? 'bg-black/50' : ''}`}>
          {isPlyaing && (
            <div className="absolute right-1 bottom-1 w-1/2 aspect-square flex justify-center">
              <div className="absolute bottom-0 left-1 w-1 h-1 bar-animation1 bg-white"></div>
              <div className="absolute bottom-0 w-1 h-1 bar-animation2 delay-150 bg-white"></div>
              <div className="absolute bottom-0 right-1 w-1 h-1 bar-animation3 delay-300 bg-white"></div>
            </div>
          )}
        </div>
      </div>
      {/* <img src={coverImage} alt={songTitle} className="w-16 h-16 object-cover" /> */}
      <div className="w-full flex justify-between items-center min-w-0">
        <div className="p-3 overflow-hidden">
          <p className="text-2xl overflow-hidden overflow-ellipsis whitespace-nowrap">
            <span className="hover-slide inline-block min-w-full group-hover:animate-slideText">
              {songTitle}
            </span>
          </p>
          <p className="mt-2">
            {artistName} · {playTime}
          </p>
        </div>
        {isAdmin && (
          <div className="text-2xl shrink-0 pl-4">
            {status === 'pending' && (
              <FontAwesomeIcon
                icon={faCheck}
                className="text-slate-200 hover:text-green-500/90 cursor-pointer"
                onClick={() => handleReviewSong(true)}
              />
            )}

            <FontAwesomeIcon
              icon={faXmark}
              className="ml-3 text-red-500/60 hover:text-red-500/90 cursor-pointer"
              onClick={() =>
                status === 'pending' ? handleReviewSong(false) : handleResetRejectedSong(id)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Song;
