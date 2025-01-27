import { faCircleXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface Song {
  coverImage: string;
  songTitle: string;
  artistName: string;
  playTime: string;
}

const dummyList = Array.from({ length: 10 }, (_, i) => ({
  coverImage: 'coverImage',
  songTitle: `Song Title${i}`,
  artistName: 'Artist Name',
  playTime: 'Play Time',
}));

const Search: React.FC = () => {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const { register, getValues, setValue, watch, handleSubmit } = useForm();

  const handleSearch = () => {
    const { searchTerm } = getValues();

    const results = dummyList.filter(
      (song) =>
        song.songTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.playTime.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setSearchResults(results);
  };

  const onClear = () => {
    setValue('searchTerm', '');
  };

  return (
    <div className="container-sm flex flex-col">
      <h2 className="title">Search</h2>
      <form className="form mt-10" onSubmit={handleSubmit(handleSearch)}>
        <div className="relative flex items-center">
          <input
            {...register('searchTerm', { required: true, min: 2 })}
            type="search"
            className="w-full pl-12 py-2 rounded-full bg-slate-950 border-2 border-slate-300 font-light focus:outline-none focus:border-white transition-colors"
            placeholder="Search songs"
          />
          <span className="absolute left-4">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          {watch('searchTerm') && (
            <span className="absolute right-4">
              <button
                type="button"
                className="text-md text-slate-300 hover:text-slate-500 rounded-full cursor-pointer"
                onClick={onClear}
              >
                <FontAwesomeIcon icon={faCircleXmark} />
              </button>
            </span>
          )}
        </div>
      </form>
      {/* Same UI with Playlist component */}
      <ul className="mt-8 overflow-y-scroll">
        {searchResults.length > 0 &&
          searchResults.map((item) => (
            <li key={item.songTitle} className="border-b last:border-none">
              <div className="flex items-center w-full border p-3">
                <div className="border aspect-square">{item.coverImage}</div>
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
