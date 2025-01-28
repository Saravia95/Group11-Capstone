import React from 'react';

const NowPlaying: React.FC = () => {
  return (
    <div className="flex flex-col justify-center border w-full p-4 lg:p-8">
      {/* possible to create a gradient background that matches the color of the cover image, similar to YouTube Music? */}
      <div className="border w-full max-w-screen-sm max-h-60 lg:max-h-96 aspect-square mx-auto">
        Cover Image
      </div>
      <p className="text-center text-3xl lg:text-5xl mt-5">Song Title</p>
      <p className="text-center text-xl lg:text-4xl mt-3">Artist Name</p>
      {/* TODO: Play Time? */}
    </div>
  );
};

export default NowPlaying;
