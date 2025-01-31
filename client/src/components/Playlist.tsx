import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRequestSongStore } from '../stores/requestSongStore';
import { Role } from '../types/auth';
import Song from './Song';

const Playlist: React.FC = () => {
  const { user } = useAuthStore();
  const { requestSongs, subscribeToChanges, fetchRequestSongs } = useRequestSongStore();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const isAdmin = user?.role === Role.ADMIN;
    const idToFetch = user?.role === Role.ADMIN ? user.id : user?.assignedOwner;
    fetchRequestSongs(idToFetch!, isAdmin);
    unsubscribe = subscribeToChanges(idToFetch!, isAdmin);

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up subscription');
        unsubscribe();
      }
    };
  }, [user, subscribeToChanges, fetchRequestSongs]);

  return (
    // is there a way to style scroll bar?
    <div className="container p-3! h-full lg:overflow-y-scroll">
      <h2 className="text-4xl px-3 pb-5 font-medium">Playlist</h2>
      {/* TODO: Highlight the current song */}
      {requestSongs.length === 0 ? (
        <p className="text-center p-3">No songs requested</p>
      ) : (
        <div className="grid">
          {requestSongs.map(({ id, cover_image, song_title, artist_name, play_time, status }) => (
            <Song
              key={id}
              id={id}
              coverImage={cover_image}
              songTitle={song_title}
              artistName={artist_name}
              playTime={play_time}
              status={status}
              isAdmin={user?.role === Role.ADMIN}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlist;
