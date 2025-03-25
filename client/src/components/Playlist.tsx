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
    <div className="scrollbar-hide tablet:p-3 relative size-full overflow-y-scroll p-2">
      {/* Pending Songs Section */}
      {pendingSongs.length > 0 && (
        <div className="tablet:mb-8 mb-6">
          <h3 className="heading-3 tablet:px-3 tablet:pb-3 px-2 pb-2 text-[var(--primary)]">
            Pending Requests ({pendingSongs.length})
          </h3>
          <div className="animate-glow-pulse tablet:p-4 grid gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/20 p-3">
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
      <div className="tablet:mb-8 mb-6">
        <h3 className="heading-3 tablet:px-3 tablet:pb-3 px-2 pb-2">
          Playlist ({approvedSongs.length})
        </h3>
        {approvedSongs.length === 0 ? (
          <p className="tablet:p-3 p-2 text-center text-[var(--secondary)]">No songs in playlist</p>
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
        <div className="tablet:mb-8 mb-6">
          {/* Responsive margin-bottom */}
          <h3 className="heading-3 tablet:px-3 tablet:pb-3 px-2 pb-2 text-red-500">
            {/* Responsive padding */}
            Rejected Requests ({rejectedSongs.length})
          </h3>
          <div className="animate-glow-pulse tablet:p-4 grid gap-2 rounded-lg border border-red-900/30 bg-red-950/20 p-3">
            {/* Responsive padding */}
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
    </div>
  );
};

export default Playlist;
