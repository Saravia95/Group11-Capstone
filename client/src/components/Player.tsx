import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { RequestSong, useRequestSongStore } from '../stores/requestSongStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackwardStep, faForwardStep, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

interface PlayerState {
  position: number;
  duration: number;
  paused: boolean;
  track_window: {
    current_track: {
      uri: string;
    };
  };
}

const Player: React.FC = () => {
  const { spotifyAccessToken } = useAuthStore();

  // Store approved songs in a ref to avoid re-rendering when the store updates
  const approvedSongsRef = useRef<RequestSong[]>([]);
  useEffect(() => {
    // Subscribe to approvedSongs changes without triggering component re-renders
    const unsub = useRequestSongStore.subscribe((state) => {
      approvedSongsRef.current = state.approvedSongs;
    });
    // Set the initial value
    approvedSongsRef.current = useRequestSongStore.getState().approvedSongs;
    return unsub;
  }, []);

  // Manage the Spotify player instance with a ref
  const playerRef = useRef<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize the Spotify Web Playback SDK player
  const initializePlayer = useCallback(() => {
    if (!spotifyAccessToken) return null;
    const newPlayer = new window.Spotify.Player({
      name: 'JukeVibes Player',
      getOAuthToken: (cb) => cb(spotifyAccessToken),
      volume: 0.5,
    });

    // Handle state changes from the player
    const handleStateChange = (state: PlayerState | null) => {
      if (!state) {
        setIsPlaying(false);
        return;
      }
      // Update the playing state based on the paused property
      setIsPlaying(!state.paused);
      const { position, duration, paused } = state;
      const progress = (position / duration) * 100;
      // Automatically advance the track when progress exceeds 99.5% (if desired)
      if (!paused && progress >= 99.5 && approvedSongsRef.current.length > 0) {
        setCurrentTrackIndex((prev) => (prev + 1) % approvedSongsRef.current.length);
      }
    };

    newPlayer.addListener('ready', ({ device_id }) => {
      console.log('Device Ready:', device_id);
      setDeviceId(device_id);
    });

    newPlayer.addListener('player_state_changed', handleStateChange);

    newPlayer.addListener('authentication_error', ({ message }) => {
      console.error('Auth Error:', message);
      // Add token refresh logic if needed
    });

    newPlayer.addListener('initialization_error', ({ message }) =>
      console.error('Init Error:', message),
    );

    return newPlayer;
  }, [spotifyAccessToken]);

  // Transfer playback to the Spotify Web Playback SDK device
  const transferPlayback = useCallback(async () => {
    const response = await fetch(`https://api.spotify.com/v1/me/player`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    });
    if (!response.ok) {
      throw new Error('Device transfer failed');
    }
  }, [deviceId, spotifyAccessToken]);

  // Start playback for a given track index (if provided) or use currentTrackIndex by default
  const startPlayback = useCallback(
    async (index?: number) => {
      const trackIndex = index !== undefined ? index : currentTrackIndex;
      if (approvedSongsRef.current.length === 0) return;
      const currentSong = approvedSongsRef.current[trackIndex];
      const trackId = currentSong.song_id.replace(/.*track[/:]/g, '');
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
        },
      );
      if (!response.ok) {
        throw new Error('Start playback failed');
      }
    },
    [deviceId, spotifyAccessToken, currentTrackIndex],
  );

  // Handle playback by transferring and starting playback, with retry logic.
  // Optionally, a specific track index can be provided.
  const handlePlayback = useCallback(
    async (retryCount = 0, index?: number) => {
      try {
        setIsLoading(true);
        await transferPlayback();
        // Add a slight delay to allow the device transfer to take effect
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await startPlayback(index);
      } catch (error) {
        console.error(error);
        if (retryCount < 3) {
          setTimeout(() => handlePlayback(retryCount + 1, index), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [transferPlayback, startPlayback],
  );

  // Load the Spotify SDK script and initialize the player when ready
  useEffect(() => {
    if (!spotifyAccessToken) {
      window.open('http://localhost:5173/spotify-login', '_blank', 'width=600,height=800');
      return;
    }

    // Prevent multiple SDK script loads
    let script = document.getElementById('spotify-player-script') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'spotify-player-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Handler for when the Spotify Web Playback SDK is ready
    const onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = initializePlayer();
      if (newPlayer) {
        newPlayer.connect();
        playerRef.current = newPlayer;
      }
    };

    window.onSpotifyWebPlaybackSDKReady = onSpotifyWebPlaybackSDKReady;

    return () => {
      // Disconnect the player when the component unmounts
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
      // Reset the global SDK ready handler
      window.onSpotifyWebPlaybackSDKReady = () => {};
      // Do not remove the SDK script as it may be shared with other components
    };
  }, [spotifyAccessToken, initializePlayer]);

  // Next/Previous handlers update the track index and, if the player is playing,
  // trigger playback of the newly selected track.
  const handlePrevious = async () => {
    if (approvedSongsRef.current.length === 0) return;
    const prevIndex =
      currentTrackIndex > 0 ? currentTrackIndex - 1 : approvedSongsRef.current.length - 1;
    setCurrentTrackIndex(prevIndex);
    if (isPlaying) {
      await handlePlayback(0, prevIndex);
    }
  };

  const handleNext = async () => {
    if (approvedSongsRef.current.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % approvedSongsRef.current.length;
    setCurrentTrackIndex(nextIndex);
    if (isPlaying) {
      await handlePlayback(0, nextIndex);
    }
  };

  // Toggle play/pause: if not currently playing, start playback;
  // otherwise, toggle the play state via the player.
  const handlePlayPause = async () => {
    if (!playerRef.current) return;
    try {
      if (!isPlaying) {
        await handlePlayback();
      } else {
        await playerRef.current.togglePlay();
      }
      // No manual state toggle here since the player state event updates isPlaying
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  };

  // Get the current track from the approved songs using the current track index
  const currentTrack = approvedSongsRef.current[currentTrackIndex];

  return (
    <div className="container">
      {isLoading && <div className="text-center text-xl">Loading...</div>}

      {currentTrack && (
        <div className="flex flex-col items-center gap-10">
          <img src={currentTrack.cover_image} alt="Album Art" className="album-art" />

          <div className="text-center">
            <h3 className="text-3xl font-medium">{currentTrack.song_title}</h3>
            <p className="mt-3">{currentTrack.artist_name}</p>
          </div>

          <div className="flex gap-20 text-6xl">
            <button className="cursor-pointer" onClick={handlePrevious} disabled={isLoading}>
              <FontAwesomeIcon icon={faBackwardStep} fixedWidth />
            </button>

            <button className="cursor-pointer" onClick={handlePlayPause} disabled={isLoading}>
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} fixedWidth />
            </button>

            <button className="cursor-pointer" onClick={handleNext} disabled={isLoading}>
              <FontAwesomeIcon icon={faForwardStep} fixedWidth />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
