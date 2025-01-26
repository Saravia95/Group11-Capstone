import React from 'react';

const NowPlaying: React.FC = () => {
  return (
    <div className="grid gap-4 border w-full p-4 lg:p-8">
      {/* possible to create a gradient background that matches the color of the cover image, similar to YouTube Music? */}
      <div className="border max-w-full aspect-square mx-auto p-40">Cover Image</div>
      <p className="text-center text-3xl lg:text-5xl">Song Title</p>
      <p className="text-center text-xl lg:text-4xl">Artist Name</p>
      {/* TODO: Play Time? */}
    </div>
  );
};

export default NowPlaying;
