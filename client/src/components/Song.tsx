import { faCheckCircle, faSort, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
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
  const handleReivewSong = async (approved: boolean) => {
    await reviewSong(id, approved);
  };

  return (
    <li key={id} className="border-b last:border-none">
      <div className="flex items-center w-full border p-3">
        <img src={coverImage} alt={songTitle} className="w-16 h-16 object-cover" />
        <div className="w-full flex justify-between items-center">
          <div className="p-3">
            <p className="text-2xl">{songTitle}</p>
            <p className="mt-2">
              {artistName} · {playTime}
            </p>
          </div>
          {isAdmin && (
            <div className="text-3xl">
              {status === 'pending' && (
                <>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500/60 hover:text-green-500/90"
                    onClick={() => handleReivewSong(true)}
                  />
                  <FontAwesomeIcon
                    icon={faXmarkCircle}
                    className="ml-3 text-red-500/60 hover:text-red-500/90"
                    onClick={() => handleReivewSong(false)}
                  />
                </>
              )}
              {status === 'approved' && (
                <FontAwesomeIcon
                  icon={faSort}
                  className="ml-3 text-slate-300 hover:text-slate-100"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default React.memo(Song);
