import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

interface Song {
    id: number;
    title: string;
    artist: string;
    album: string;
}

const OwnerSongLibrary: React.FC = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Fetch songs from external API using axiosInstance
        const fetchSongs = async () => {
            try {
                const response = await axiosInstance.get('/songs');
                setSongs(response.data);
            } catch (error) {
                console.error('Error fetching songs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Owner Song Library</h1>
            <ul>
                {songs.map((song) => (
                    <li key={song.id}>
                        <h2>{song.title}</h2>
                        <p>{song.artist}</p>
                        <p>{song.album}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OwnerSongLibrary;