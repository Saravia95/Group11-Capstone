import React, { useState } from 'react';

const NowPlaying: React.FC = () => {
    const [isMinimized, setIsMinimized] = useState(false);

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <div className={`now-playing ${isMinimized ? 'minimized' : ''}`}>
            <div className="player-header">
                <h3>Now Playing</h3>
                <button onClick={toggleMinimize}>
                    {isMinimized ? 'Expand' : 'Minimize'}
                </button>
            </div>
            {!isMinimized && (
                <div className="player-body">
                    <div className="song-info">
                        <p>Song Title</p>
                        <p>Artist Name</p>
                    </div>
                    <div className="player-controls">
                        <button>Previous</button>
                        <button>Play/Pause</button>
                        <button>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NowPlaying;