import React from 'react';
import { useNavigate } from 'react-router';

const OwnerMain: React.FC = () => {
    const navigate = useNavigate(); // Use the navigate function to navigate to a different route

 const navigateToSongLibrary = () => {
        navigate('/owner-song-library');
    };


    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Welcome to the Jukebox App</h1>
            <p>Manage your playlists and control the music experience for your guests.</p>
            
            <div style={{ marginTop: '20px' }}>
            <button onClick={navigateToSongLibrary}  style={{ margin: '10px', padding: '10px 20px' }}>Song Library</button>
                <button disabled style={{ margin: '10px', padding: '10px 20px' }}>Now Playing: Song Name</button>
                <button disabled style={{ margin: '10px', padding: '10px 20px' }}>View Playlists</button>
                <button disabled style={{ margin: '10px', padding: '10px 20px' }}>Settings</button>
            </div>
        </div>
    );
};

export default OwnerMain;