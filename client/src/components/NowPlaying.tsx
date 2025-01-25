import React from 'react';

const NowPlaying: React.FC = () => {
  return (
    <div className="player-container">
      <div className="player-header">
        <h3>Now Playing</h3>
      </div>
      <div className="player-body">
        <div className="song-info">
          <p>Song Title</p>
          <p>Artist Name</p>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
