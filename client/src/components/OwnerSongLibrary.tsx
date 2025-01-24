import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router';

interface Song {
    id: number;
    title: string;
    artist: string;
    album: string;
}

const OwnerSongLibrary: React.FC = () => {
    const navigate = useNavigate();
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigateToOwnerMain = () => {
        navigate('/owner-main');
    };
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
            <button onClick={navigateToOwnerMain} style={{ margin: '10px', padding: '10px 20px' }}>Back</button>

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