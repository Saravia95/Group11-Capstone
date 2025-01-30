import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { searchSong } from '../utils/songUtils';

interface Song {
  id: string;
  coverImage: string;
  songTitle: string;
  artistName: string;
  playTime: string;
}

interface ISearchForm {
  filter: string;
  searchTerm: string;
}

const Search: React.FC = () => {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { register, getValues, handleSubmit } = useForm<ISearchForm>();

  const handleSearch = async () => {
    const { filter, searchTerm } = getValues();
    setIsLoading(true);

    try {
      const results = await searchSong(filter, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-sm flex flex-col">
      <h2 className="title">검색</h2>
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
          <input
            {...register('searchTerm', { required: true, min: 2 })}
            type="search"
            placeholder="Search"
            className="w-full bg-slate-950 h-12 flex px-5 rounded-r-full text-sm focus:outline-none border-2 border-l-0 border-slate-300"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute inset-y-0 right-0 mr-2 flex items-center px-2"
          >
            {isLoading ? (
              <span>검색중...</span>
            ) : (
              <svg
                className="h-4 w-4 fill-current dark:text-white"
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                id="Capa_1"
                x="0px"
                y="0px"
                viewBox="0 0 56.966 56.966"
                width="512px"
                height="512px"
              >
                <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
              </svg>
            )}
          </button>
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
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Search;
