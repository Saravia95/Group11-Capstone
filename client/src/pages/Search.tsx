import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestSong, searchSong } from '../utils/songUtils';
import { useAuthStore } from '../stores/authStore';
import type { Song } from '../utils/songUtils';
import { Helmet } from 'react-helmet-async';
import { useRequestSongStore } from '../stores/requestSongStore';
import { Role } from '../types/auth';
import RecommendedSongs from '../components/RecommendedSongs';

interface ISearchForm {
  filter: string;
  searchTerm: string;
}

const Search: React.FC = () => {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, getValues, handleSubmit } = useForm<ISearchForm>();
  const { user } = useAuthStore();
  const { pendingSongs, approvedSongs, rejectedSongs, subscribeToChanges, fetchRequestSongs } =
    useRequestSongStore();

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

  const handleSearch = async () => {
    const { filter, searchTerm } = getValues();
    setIsLoading(true);

    try {
      const results = await searchSong(filter, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('fail to search songs:', error);
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

  const isSongRequested = (item: Song) => {
    return pendingSongs.some((song) => song.song_id === item.id) ||
      approvedSongs.some((song) => song.song_id === item.id) ||
      rejectedSongs.some((song) => song.song_id === item.id)
      ? true
      : false;
  };

  return (
    <>
      <div className="container-sm flex flex-col">
        <Helmet title="Search | JukeVibes" />
        <h2 className="heading-2 mt-10 text-center">Search</h2>
        <form
          className="mt-10 w-full p-4 text-slate-300 focus:outline-none"
          onSubmit={handleSubmit(handleSearch)}
        >
          <div className="relative flex">
            <select
              {...register('filter', { required: true })}
              className="h-12 cursor-pointer overflow-y-hidden rounded-l-full border-2 border-r-1 border-slate-300 bg-slate-950 px-5 text-sm focus:outline-none"
            >
              <option className="cursor-pointer font-medium" value="title">
                Title
              </option>
              <option className="cursor-pointer font-medium" value="artist">
                Artist
              </option>
            </select>
            <div className="relative flex-1">
              <input
                {...register('searchTerm', { required: true, min: 2 })}
                type="search"
                placeholder="Search"
                className="h-12 w-full rounded-r-full border-2 border-l-0 border-slate-300 bg-slate-950 px-5 pr-12 text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute inset-y-0 right-0 flex items-center px-4"
              >
                {isLoading ? (
                  <span>Searching...</span>
                ) : (
                  <svg
                    className="h-4 w-4 fill-current dark:text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 56.966 56.966"
                  >
                    <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>

        <ul className="mt-8 overflow-y-scroll">
          {searchResults.length > 0 &&
            searchResults.map((item) => (
              <li key={item.id} className="border-b last:border-none">
                <div className="flex w-full items-center border p-3">
                  <img
                    src={item.coverImage}
                    alt={item.songTitle}
                    className="h-16 w-16 object-cover"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="p-3">
                      <p className="text-2xl">{item.songTitle}</p>
                      <p className="mt-2">
                        {item.artistName} · {item.playTime}
                      </p>
                    </div>
                    {user?.id ? (
                      <button
                        onClick={() => handleRequest(item)}
                        disabled={isSongRequested(item)}
                        className={`px-4 py-2 ${isSongRequested(item) ? 'bg-red-500' : 'bg-green-500'} rounded-full text-slate-300 ${isSongRequested(item) ? 'hover:bg-red-500' : 'hover:bg-green-800'}`}
                      >
                        {isSongRequested(item) ? <span>Requested</span> : <span>Request</span>}
                      </button>
                    ) : (
                      <div className="px-4 py-2 text-slate-500">QR Authorization is needed</div>
                    )}
                  </div>
                </div>
              </li>
            ))}
        </ul>

        {showSuccess && (
          <div className="mt-4 rounded-full bg-green-900 p-4 text-green-300">
            Song requested successfully!
          </div>
        )}
      </div>
      <RecommendedSongs />
    </>
  );
};

export default Search;
