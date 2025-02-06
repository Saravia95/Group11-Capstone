import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRequestSongStore } from '../stores/requestSongStore';
import { Role } from '../types/auth';
import Song from './Song';

const Playlist: React.FC = () => {
  const { user } = useAuthStore();
  const { pendingSongs, approvedSongs, subscribeToChanges, fetchRequestSongs } =
    useRequestSongStore();

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
    <div className="container p-3 h-full lg:overflow-y-scroll">
      <h2 className="text-4xl px-3 pb-5 font-medium">Playlist</h2>

      {/* Pending Songs Section */}
      {pendingSongs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl px-3 pb-3 text-yellow-500 font-medium">
            Pending Requests ({pendingSongs.length})
          </h3>
          <div className="grid gap-2 bg-yellow-950/20 p-4 rounded-lg border border-yellow-900/30 animate-glow-pulse">
            {pendingSongs.map(({ id, cover_image, song_title, artist_name, play_time, status }) => (
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
        </div>
      )}

      {/* Approved Songs Section */}
      <div>
        <h3 className="text-2xl px-3 pb-3 text-slate-300 font-medium">
          Playlist ({approvedSongs.length})
        </h3>
        {approvedSongs.length === 0 ? (
          <p className="text-center p-3 text-slate-500">No songs in playlist</p>
        ) : (
          <div className="grid gap-2">
            {approvedSongs.map(
              ({ id, cover_image, song_title, artist_name, play_time, status }) => (
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
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist;
