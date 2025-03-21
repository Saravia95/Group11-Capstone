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

  //   function buildQueryString(params: RecommendationParams): string {
  //     const searchParams = new URLSearchParams();
  //     Object.entries(params).forEach(([key, value]) => {
  //       if (value !== undefined) {
  //         searchParams.append(key, value.toString());
  //       }
  //     });
  //     return searchParams.toString();
  //   }

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
      <h2 className="items-center">Recommended Songs</h2>
      <ul>
        {recommendedSongs.map((song) => (
          <li key={song.id} className="border-b last:border-none">
            <div className="flex w-full items-center border p-3">
              <img src={song.coverImage} alt={song.songTitle} className="h-16 w-16 object-cover" />
              <div className="flex w-full items-center justify-between">
                <div className="p-3">
                  <p className="text-2xl">{song.songTitle}</p>
                  <p className="mt-2">
                    {song.artistName} · {song.playTime}
                  </p>
                </div>
                {user?.id ? (
                  <button
                    onClick={() => handleRequest(song)}
                    disabled={isSongRequested(song)}
                    className={`px-4 py-2 ${isSongRequested(song) ? 'bg-red-500' : 'bg-green-500'} rounded-full text-slate-300 ${isSongRequested(song) ? 'hover:bg-red-500' : 'hover:bg-green-800'}`}
                  >
                    {isSongRequested(song) ? <span>Requested</span> : <span>Request</span>}
                  </button>
                ) : (
                  <div className="px-4 py-2 text-slate-500">QR Authorization is needed</div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendedSongs;
