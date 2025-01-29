import { faCheckCircle, faSort, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Role, useAuthStore } from '../stores/authStore';

const dummyList = Array.from({ length: 10 }, (_, i) => ({
  coverImage: 'coverImage',
  songTitle: `Song Title${i}`,
  artistName: 'Artist Name',
  playTime: 'Play Time',
}));

const Playlist: React.FC = () => {
  const { user } = useAuthStore();

  return (
    // is there a way to style scroll bar?
    <div className="container border lg:overflow-y-scroll">
      {/* TODO: Highlight the current song */}
      {/* <ul>{dummyList().map((item) => item)}</ul> */}
      <ul>
        {dummyList.map((item) => (
          <li key={item.songTitle} className="border-b last:border-none">
            <div className="flex items-center w-full border p-3">
              <div className="border aspect-square">{item.coverImage}</div>
              <div className="w-full flex justify-between items-center">
                <div className="p-3">
                  <p className="text-2xl">{item.songTitle}</p>
                  <p className="mt-2">
                    {item.artistName} · {item.playTime}
                  </p>
                </div>
                {user?.role === Role.Admin && (
                  <div className="text-3xl">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500/60 hover:text-green-500/90"
                    />
                    <FontAwesomeIcon
                      icon={faXmarkCircle}
                      className="ml-3 text-red-500/60 hover:text-red-500/90"
                    />
                    <FontAwesomeIcon
                      icon={faSort}
                      className="ml-3 text-slate-300 hover:text-slate-100"
                    />
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
