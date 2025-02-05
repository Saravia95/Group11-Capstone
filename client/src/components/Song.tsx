import { faCheck, faSort, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { reviewSong } from '../utils/songUtils';

interface ISongProps {
  id: string;
  coverImage: string;
  songTitle: string;
  artistName: string;
  playTime: string;
  status: string;
  isAdmin: boolean;
}

const Song: React.FC<ISongProps> = ({
  id,
  coverImage,
  songTitle,
  artistName,
  playTime,
  status,
  isAdmin,
}) => {
  const handleReviewSong = async (approved: boolean) => {
    await reviewSong(id, approved);
  };

  return (
    <div
      className={`
      flex items-center w-full px-2 rounded hover:bg-black peer group
      ${status === 'pending' ? 'animate-slide-up' : ''}
    `}
    >
      {status === 'approved' && (
        <FontAwesomeIcon
          icon={faSort}
          className="mr-3 text-slate-300 hover:text-slate-100 cursor-grab active:cursor-grabbing"
        />
      )}
      <img src={coverImage} alt={songTitle} className="w-16 h-16 object-cover" />
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
              onClick={() => handleReviewSong(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Song;
