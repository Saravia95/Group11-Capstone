import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRequestSongStore } from '../stores/requestSongStore';
import { Role } from '../types/auth';
import Song from './Song';

const Playlist: React.FC = () => {
  const { user } = useAuthStore();
  const {
    pendingSongs,
    approvedSongs,
    rejectedSongs,
    subscribeToChanges,
    fetchRequestSongs,
    currentTrackIndex,
    setCurrentTrackIndex,
  } = useRequestSongStore();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const idToFetch = user?.role === Role.ADMIN ? user.id : user?.assignedOwner;
    fetchRequestSongs(idToFetch!);
    unsubscribe = subscribeToChanges(idToFetch!);

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up subscription');
        unsubscribe();
      }
    };
  }, [user, subscribeToChanges, fetchRequestSongs]);

  return (
    <div className="scrollbar-hide relative container h-full overflow-y-scroll p-3">
      <h2 className="px-3 pb-5 text-4xl font-medium">Playlist</h2>

      {/* Pending Songs Section */}
      {pendingSongs.length > 0 && (
        <div className="mb-8">
          <h3 className="px-3 pb-3 text-2xl font-medium text-yellow-500">
            Pending Requests ({pendingSongs.length})
          </h3>
          <div className="animate-glow-pulse grid gap-2 rounded-lg border border-yellow-900/30 bg-yellow-950/20 p-4">
            {pendingSongs.map(
              ({ id, cover_image, song_title, artist_name, play_time, status }, index) => (
                <Song
                  key={index}
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
        </div>
      )}

      {/* Approved Songs Section */}
      <div>
        <h3 className="px-3 pb-3 text-2xl font-medium text-slate-300">
          Playlist ({approvedSongs.length})
        </h3>
        {approvedSongs.length === 0 ? (
          <p className="p-3 text-center text-slate-500">No songs in playlist</p>
        ) : (
          <div className="grid gap-2">
            {approvedSongs.map(
              ({ id, cover_image, song_title, artist_name, play_time, status }, index) => (
                <Song
                  key={index}
                  id={id}
                  coverImage={cover_image}
                  songTitle={song_title}
                  artistName={artist_name}
                  playTime={play_time}
                  status={status}
                  isAdmin={user?.role === Role.ADMIN}
                  isPlyaing={index === currentTrackIndex}
                  onClick={() => {
                    if (index !== currentTrackIndex) {
                      setCurrentTrackIndex(index);
                    }
                  }}
                />
              ),
            )}
          </div>
        )}
      </div>

      {rejectedSongs.length > 0 && (
        <div className="mb-8">
          <h3 className="px-3 pb-3 text-2xl font-medium text-red-500">
            Rejected Requests ({rejectedSongs.length})
          </h3>
          <div className="animate-glow-pulse grid gap-2 rounded-lg border border-red-900/30 bg-red-950/20 p-4">
            {rejectedSongs.map(
              ({ id, cover_image, song_title, artist_name, play_time, status }, index) => (
                <Song
                  key={index}
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
        </div>
      )}
      <div className="fixed bottom-0 h-20 w-full -translate-x-10 bg-linear-to-b from-transparent via-slate-900/80 to-slate-900/90"></div>
    </div>
  );
};

export default Playlist;
