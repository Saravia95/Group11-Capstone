import React, { useEffect, useState, useRef } from 'react';
import { getRecommendedSongs, requestSong, Song } from '../utils/songUtils';
import { useAuthStore } from '../stores/authStore';
import { useRequestSongStore } from '../stores/requestSongStore';

const RecommendedSongs: React.FC = () => {
  const { user } = useAuthStore();
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { pendingSongs, approvedSongs, rejectedSongs, subscribeToChanges, fetchRequestSongs } =
    useRequestSongStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchRecommendedSongs = async () => {
    setIsLoading(true);
    try {
      const results = await getRecommendedSongs();
      setRecommendedSongs(results);
    } catch (error) {
      console.error('failed to get recommended songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (song: Song) => {
    const { user } = useAuthStore.getState();
    if (!user?.assignedOwner) {
      console.error('QR Authorization is needed');
      return;
    }

    try {
      const response = await requestSong(song);
      if (!response.success) {
        alert(response.message);
      }
    } catch (error) {
      console.error('Failed to request song:', error);
    }
  };

  useEffect(() => {
    fetchRecommendedSongs();
  }, [user, subscribeToChanges, fetchRequestSongs]);

  const isSongRequested = (item: Song) => {
    return (
      pendingSongs.some((song) => song.song_id === item.id) ||
      approvedSongs.some((song) => song.song_id === item.id) ||
      rejectedSongs.some((song) => song.song_id === item.id)
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 400;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="relative container">
      <h2 className="mb-4 text-2xl font-bold">Recommended Songs</h2>

      <button
        onClick={() => scroll('left')}
        className="tablet:block absolute top-1/2 left-0 hidden -translate-y-1/2 rounded-full bg-gray-800 p-2 text-white shadow-md hover:bg-gray-700"
      >
        &#10094;
      </button>

      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex touch-pan-x gap-4 overflow-x-auto scroll-smooth"
      >
        {recommendedSongs.map((song) => (
          <div key={song.id} className="w-40 min-w-[160px] rounded-lg border shadow-md">
            <img
              src={song.coverImage}
              alt={song.songTitle}
              className="h-20 w-full rounded-t-lg object-cover"
            />
            <div className="p-3">
              <h3 className="overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
                {song.songTitle}
              </h3>
              <p className="overflow-hidden text-xs text-ellipsis whitespace-nowrap text-gray-500">
                {song.artistName} · {song.playTime}
              </p>
              {user?.id ? (
                <button
                  onClick={() => handleRequest(song)}
                  disabled={isSongRequested(song)}
                  className={`mt-3 w-full px-3 py-1.5 text-sm ${
                    isSongRequested(song) ? 'bg-red-500' : 'bg-[var(--primary)]'
                  } rounded-full text-white transition ${
                    isSongRequested(song) ? 'hover:bg-red-600' : 'hover:bg-[var(--primary)]/80'
                  }`}
                >
                  {isSongRequested(song) ? 'Requested' : 'Request'}
                </button>
              ) : (
                <div className="mt-3 text-center text-sm text-gray-500">
                  QR Authorization is needed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="tablet:block absolute top-1/2 right-0 hidden -translate-y-1/2 rounded-full bg-gray-800 p-2 text-white shadow-md hover:bg-gray-700"
      >
        &#10095;
      </button>
    </div>
  );
};

export default RecommendedSongs;
