import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestSong, searchSong } from '../utils/songUtils';
import { useAuthStore } from '../stores/authStore';
import type { Song } from '../utils/songUtils';

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
        console.error('Failed to request song:', response.message);
      }
    } catch (error) {
      console.error('Failed to request song:', error);
    }
  };

  return (
    <div className="container-sm flex flex-col">
      <h2 className="title">Search</h2>
      <form
        className="w-full p-4 text-slate-300 focus:outline-none mt-10"
        onSubmit={handleSubmit(handleSearch)}
      >
        <div className="relative flex">
          <select
            {...register('filter', { required: true })}
            className="bg-slate-950 h-12 px-5 rounded-l-full text-sm focus:outline-none border-2 border-slate-300 border-r-1 cursor-pointer overflow-y-hidden"
          >
            <option className="font-medium cursor-pointer" value="title">
              Title
            </option>
            <option className="font-medium cursor-pointer" value="artist">
              Artist
            </option>
          </select>
          <div className="relative flex-1">
            <input
              {...register('searchTerm', { required: true, min: 2 })}
              type="search"
              placeholder="Search"
              className="w-full bg-slate-950 h-12 px-5 pr-12 rounded-r-full text-sm focus:outline-none border-2 border-l-0 border-slate-300"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-0 inset-y-0 flex items-center px-4"
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
              <div className="flex items-center w-full border p-3">
                <img
                  src={item.coverImage}
                  alt={item.songTitle}
                  className="w-16 h-16 object-cover"
                />
                <div className="w-full flex justify-between items-center">
                  <div className="p-3">
                    <p className="text-2xl">{item.songTitle}</p>
                    <p className="mt-2">
                      {item.artistName} · {item.playTime}
                    </p>
                  </div>
                  {user?.id ? (
                    <button
                      onClick={() => handleRequest(item)}
                      className="px-4 py-2 bg-slate-950 text-slate-300 rounded-full hover:bg-slate-800"
                    >
                      Request
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
        <div className="mt-4 p-4 bg-green-900 text-green-300 rounded-full">
          Song requested successfully!
        </div>
      )}
    </div>
  );
};

export default Search;
