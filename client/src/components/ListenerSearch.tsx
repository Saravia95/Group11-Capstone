import React, { useState } from 'react';

interface Song {
    title: string;
    artist: string;
    genre: string;
}

const songLibrary: Song[] = [
    { title: 'Song 1', artist: 'Artist 1', genre: 'Genre 1' },
    { title: 'Song 2', artist: 'Artist 2', genre: 'Genre 2' },
];

const ListenerSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);

        if (term.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = songLibrary.filter(song =>
            song.title.toLowerCase().includes(term.toLowerCase()) ||
            song.artist.toLowerCase().includes(term.toLowerCase()) ||
            song.genre.toLowerCase().includes(term.toLowerCase())
        );

        setSearchResults(results);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search by title, artist, genre..."
                value={searchTerm}
                onChange={handleSearch}
            />
            <ul>
                {searchResults.map((song, index) => (
                    <li key={index}>
                        {song.title} by {song.artist} - {song.genre}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListenerSearch;