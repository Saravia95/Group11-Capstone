import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { RequestSong, useRequestSongStore } from '../stores/requestSongStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackwardStep, faForwardStep, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import {
  initializePlayer,
  transferPlayback,
  startPlayback,
  handleTokenRefresh,
  PlayerConfig,
} from '../utils/playerHelpers';

// TODO: Implement Refresh token handling

const Player: React.FC = () => {
  // State and refs
  const { spotifyAccessToken, spotifyRefreshToken, setSpotifyTokens } = useAuthStore();
  const approvedSongsRef = useRef<RequestSong[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const playerRef = useRef<Spotify.Player | null>(null);
  const trackEndTriggered = useRef(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Subscribe to approved songs changes
  useEffect(() => {
    const unsub = useRequestSongStore.subscribe((state) => {
      approvedSongsRef.current = state.approvedSongs;
    });
    approvedSongsRef.current = useRequestSongStore.getState().approvedSongs;
    return unsub;
  }, []);

  // Player configuration and initialization
  const handlePlayerInit = useCallback(() => {
    const config: PlayerConfig = {
      name: 'JukeVibes Player',
      accessToken: spotifyAccessToken || '',
      onReady: (deviceId: string) => {
        console.log('Device Ready:', deviceId);
        setDeviceId(deviceId);
      },
      onStateChange: (state: Spotify.PlaybackState | null) => {
        console.log('State Change:', state);
        setIsPlaying(state ? !state.paused : false);
      },
      onAuthError: (message: string) => {
        console.error('Auth Error:', message);
        handleTokenRefresh(spotifyRefreshToken, setSpotifyTokens);
      },
    };

    const newPlayer = initializePlayer(config);
    newPlayer.connect();
    playerRef.current = newPlayer;

    return () => {
      newPlayer.disconnect();
      playerRef.current = null;
    };
  }, [spotifyAccessToken, spotifyRefreshToken, setSpotifyTokens]);

  // Playback management
  const handlePlayback = useCallback(
    async (retryCount = 0, index?: number) => {
      try {
        setIsLoading(true);
        await transferPlayback(deviceId, spotifyAccessToken || '');
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        await startPlayback({
          deviceId,
          accessToken: spotifyAccessToken || '',
          trackIndex: index ?? currentTrackIndex,
          approvedSongs: approvedSongsRef.current,
        });
      } catch (error) {
        console.error(error);
        if (retryCount < 3) {
          setTimeout(() => handlePlayback(retryCount + 1, index), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [deviceId, spotifyAccessToken, currentTrackIndex],
  );

  const handlePlaybackRef = useRef(handlePlayback);
  useEffect(() => {
    handlePlaybackRef.current = handlePlayback;
  }, [handlePlayback]);

  // Player lifecycle management
  useEffect(() => {
    if (!spotifyAccessToken) {
      const popup = window.open(
        'http://localhost:5173/spotify-login',
        '_blank',
        'width=600,height=800',
      );

      // Check if the popup is closed and reload the page
      const interval = setInterval(() => {
        if (popup?.closed) {
          clearInterval(interval);
          if (spotifyAccessToken) {
            window.location.reload();
          }
        }
      }, 1000);
      return;
    }

    let script = document.getElementById('spotify-player-script') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'spotify-player-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // script.addEventListener('load', handlePlayerInit);
    window.onSpotifyWebPlaybackSDKReady = handlePlayerInit;

    return () => {
      script?.removeEventListener('load', handlePlayerInit);
      window.onSpotifyWebPlaybackSDKReady = () => {};
      playerRef.current?.disconnect();
    };
  }, [spotifyAccessToken, handlePlayerInit]);

  // Time formatting helper
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Progress calculation
  const progressPercentage = currentDuration > 0 ? (currentPosition / currentDuration) * 100 : 0;

  // Seek handler for both click and drag
  const handleSeek = async (clientX: number) => {
    if (!progressBarRef.current || !playerRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = clientX - rect.left;
    const totalWidth = rect.width;
    const seekPercentage = Math.max(0, Math.min(1, clickPosition / totalWidth));
    const newPosition = currentDuration * seekPercentage;

    try {
      await playerRef.current.seek(newPosition);
      setCurrentPosition(newPosition); // Immediate UI update
    } catch (error) {
      console.error('Seek failed:', error);
      // Add token refresh logic here if needed
    }
  };

  // Mouse event handlers for dragging
  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleSeek(e.clientX);
    }
  };

  // Current track change handling
  useEffect(() => {
    const pollingInterval = setInterval(async () => {
      if (playerRef.current) {
        const state = await playerRef.current.getCurrentState();
        if (state) {
          setCurrentPosition(state.position);
          setCurrentDuration(state.duration);

          const trackEndThreshold = 0.995; // 99.5% of the track
          const progress = state.duration > 0 ? state.position / state.duration : 0;

          // if the track is near the end, trigger the next track
          if (progress >= trackEndThreshold && !trackEndTriggered.current) {
            trackEndTriggered.current = true;
            setCurrentTrackIndex((prev) => {
              const nextIndex = (prev + 1) % approvedSongsRef.current.length;
              handlePlaybackRef.current(0, nextIndex);
              return nextIndex;
            });
          } else if (progress < trackEndThreshold) {
            // reset the trigger if the track is not near the end
            trackEndTriggered.current = false;
          }
        }
      }
    }, 1000); // 1 second interval

    return () => {
      clearInterval(pollingInterval);
    };
  }, []);

  // Control handlers
  const handlePrevious = async () => {
    const prevIndex =
      currentTrackIndex > 0 ? currentTrackIndex - 1 : approvedSongsRef.current.length - 1;
    setCurrentTrackIndex(prevIndex);
    if (isPlaying) {
      await handlePlayback(0, prevIndex);
    }
  };

  const handleNext = async () => {
    const nextIndex = (currentTrackIndex + 1) % approvedSongsRef.current.length;
    setCurrentTrackIndex(nextIndex);
    if (isPlaying) {
      await handlePlayback(0, nextIndex);
    }
  };

  const handlePlayPause = async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      await handlePlayback();
    }
  };

  // Current track selection
  const currentTrack = approvedSongsRef.current[currentTrackIndex];

  return (
    <div className="container">
      {isLoading && <div className="text-center text-xl">Loading...</div>}

      {currentTrack && (
        <div className="flex flex-col items-center gap-5">
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
          <div
            className="w-full max-w-2xl mt-5 px-4 cursor-pointer"
            ref={progressBarRef}
            onClick={(e) => handleSeek(e.clientX)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
          >
            <div className="h-2 bg-gray-300 rounded-full group relative">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />

              {/* Hover thumb indicator */}
              <div
                className="hidden group-hover:block absolute h-3 w-3 -ml-1.5 -mt-1.5 bg-white rounded-full shadow-lg transition-opacity"
                style={{
                  left: `${progressPercentage}%`,
                  top: '50%',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>{formatTime(currentPosition)}</span>
              <span>-{formatTime(currentDuration - currentPosition)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
