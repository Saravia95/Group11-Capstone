import React, { useEffect, useState } from 'react';
import { getRecommendedSongs, requestSong, Song } from '../utils/songUtils';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types/auth';
import { useRequestSongStore } from '../stores/requestSongStore';
import { RecommendationParams } from '../types/recommendation';
const RecommendedSongs: React.FC = () => {
  const { user } = useAuthStore();

  //These params are temp for now. I want to add this table to the database.
  const [recommendationParams, setRecommendationParams] = useState<RecommendationParams>({});
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { pendingSongs, approvedSongs, rejectedSongs, subscribeToChanges, fetchRequestSongs } =
    useRequestSongStore();
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
      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('Failed to request song:', error);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const idToFetch = user?.role === Role.ADMIN ? user.id : user?.assignedOwner;
    fetchRequestSongs(idToFetch!);
    fetchRecommendedSongs();
    unsubscribe = subscribeToChanges(idToFetch!);

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up subscription');
        unsubscribe();
      }
    };
  }, [user, subscribeToChanges, fetchRequestSongs]);

  const isSongRequested = (item: Song) => {
    return pendingSongs.some((song) => song.song_id === item.id) ||
      approvedSongs.some((song) => song.song_id === item.id) ||
      rejectedSongs.some((song) => song.song_id === item.id)
      ? true
      : false;
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Recommended Songs</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {recommendedSongs.map((song) => (
          <div key={song.id} className="overflow-hidden rounded-lg border shadow-md">
            <img src={song.coverImage} alt={song.songTitle} className="h-36 w-full object-cover" />
            <div className="p-3">
              <h3 className="text-md font-medium">{song.songTitle}</h3>
              <p className="text-sm text-gray-500">
                {song.artistName} · {song.playTime}
              </p>

              {user?.id ? (
                <button
                  onClick={() => handleRequest(song)}
                  disabled={isSongRequested(song)}
                  className={`mt-3 w-full px-3 py-1.5 text-sm ${
                    isSongRequested(song) ? 'bg-red-500' : 'bg-green-500'
                  } rounded-full text-white transition ${
                    isSongRequested(song) ? 'hover:bg-red-600' : 'hover:bg-green-700'
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
    </div>
  );
};

export default RecommendedSongs;
