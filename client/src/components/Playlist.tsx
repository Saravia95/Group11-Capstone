import { faCheckCircle, faSort, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRequestSongStore } from '../stores/requestSongStore';
import { Role } from '../types/auth';

const Playlist: React.FC = () => {
  const { user } = useAuthStore();
  const { requestSongs, subscribeToChanges, fetchRequestSongs } = useRequestSongStore();

  useEffect(() => {
    console.log('Playlist component - Current user:', user);

    let unsubscribe: (() => void) | null = null;

    if (user?.role === Role.ADMIN && user?.id) {
      console.log('Setting up subscription for admin id:', user.id);

      fetchRequestSongs(user.id);

      unsubscribe = subscribeToChanges(user.id);
    } else {
      console.log('Not an admin or no user id found');
    }

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up subscription');
        unsubscribe();
      }
    };
  }, [user, subscribeToChanges, fetchRequestSongs]);

  console.log('Current request songs:', requestSongs);

  return (
    // is there a way to style scroll bar?
    <div className="container border lg:overflow-y-scroll">
      {/* TODO: Highlight the current song */}
      {/* <ul>{dummyList().map((item) => item)}</ul> */}
      <ul>
        {requestSongs.map((item) => (
          <li key={item.id} className="border-b last:border-none">
            <div className="flex items-center w-full border p-3">
              <img
                src={item.cover_image}
                alt={item.song_title}
                className="w-16 h-16 object-cover"
              />
              <div className="w-full flex justify-between items-center">
                <div className="p-3">
                  <p className="text-2xl">{item.song_title}</p>
                  <p className="mt-2">
                    {item.artist_name} · {item.play_time}
                  </p>
                </div>
                {user?.role === Role.ADMIN && (
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
