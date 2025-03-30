import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRequestSongStore } from '../stores/requestSongStore';
import { Role } from '../types/auth';
import Song from './Song';
import { setPlaying } from '../utils/songUtils';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Playlist: React.FC = () => {
  const { user } = useAuthStore();
  const { pendingSongs, approvedSongs, rejectedSongs, subscribeToChanges, fetchRequestSongs } =
    useRequestSongStore();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPendingOpen, setIsPendingOpen] = useState(true);
  const [isRejectedOpen, setIsRejectedOpen] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const idToFetch = user?.role === Role.ADMIN ? user.id : user?.assignedOwner;
    fetchRequestSongs(idToFetch!);
    unsubscribe = subscribeToChanges(idToFetch!);

    setCurrentIndex(approvedSongs.findIndex((song) => song.is_playing) || 0);

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up subscription');
        unsubscribe();
      }
    };
  }, [user, subscribeToChanges, fetchRequestSongs]);

  const AccordionHeader = ({
    title,
    count,
    isOpen,
    toggle,
    colorClass = 'text-[var(--primary)]',
  }: {
    title: string;
    count: number;
    isOpen: boolean;
    toggle: () => void;
    colorClass?: string;
  }) => (
    <button
      className={`flex w-full items-center justify-between ${colorClass} transition-opacity hover:opacity-80`}
      onClick={toggle}
      aria-expanded={isOpen}
    >
      <h3 className="heading-3 tablet:px-3 tablet:pb-3 px-2 pb-2">
        {title} ({count})
      </h3>
      <FontAwesomeIcon
        icon={isOpen ? faChevronUp : faChevronDown}
        className="tablet:mr-4 mr-2 text-sm"
      />
    </button>
  );

  return (
    <div className="scrollbar-hide tablet:p-3 relative size-full overflow-y-scroll p-2">
      {/* Approved Songs Section */}
      <div className="tablet:mb-8 mb-6">
        <h3 className="heading-3 tablet:px-3 tablet:pb-3 px-2 pb-2">
          Playlist ({approvedSongs.length})
        </h3>
        {approvedSongs.length === 0 ? (
          <p className="tablet:p-3 p-2 text-center text-[var(--secondary)]">No songs in playlist</p>
        ) : (
          <div className="grid gap-2">
            {approvedSongs
              .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
              .map(
                (
                  { id, cover_image, song_title, artist_name, play_time, status, is_playing },
                  index,
                ) => (
                  <Song
                    key={index}
                    id={id}
                    coverImage={cover_image}
                    songTitle={song_title}
                    artistName={artist_name}
                    playTime={play_time}
                    status={status}
                    isAdmin={user?.role === Role.ADMIN}
                    isPlaying={is_playing}
                    onClick={() => {
                      if (index !== currentIndex && user?.role === Role.ADMIN) {
                        setCurrentIndex(index);
                        setPlaying(id);
                      }
                    }}
                  />
                ),
              )}
          </div>
        )}
      </div>

      {/* Pending Requests Accordion */}
      {pendingSongs.length > 0 && (
        <div className="tablet:mb-8 mb-6">
          <AccordionHeader
            title="Pending Requests"
            count={pendingSongs.length}
            isOpen={isPendingOpen}
            toggle={() => setIsPendingOpen(!isPendingOpen)}
          />
          {isPendingOpen && (
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
          )}
        </div>
      )}

      {/* Rejected Requests Accordion */}
      {rejectedSongs.length > 0 && user?.role === Role.ADMIN && (
        <div className="tablet:mb-8 mb-6">
          <AccordionHeader
            title="Rejected Requests"
            count={rejectedSongs.length}
            isOpen={isRejectedOpen}
            toggle={() => setIsRejectedOpen(!isRejectedOpen)}
            colorClass="text-red-500"
          />
          {isRejectedOpen && (
            <div className="animate-glow-pulse tablet:p-4 grid gap-2 rounded-lg border border-red-900/30 bg-red-950/20 p-3">
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
          )}
        </div>
      )}
    </div>
  );
};

export default Playlist;
