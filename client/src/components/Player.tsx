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
import { Helmet } from 'react-helmet-async';

const Player: React.FC = () => {
  // --- Auth and Song Store ---
  const { spotifyAccessToken, spotifyRefreshToken, setSpotifyTokens } = useAuthStore();
  const { currentTrackIndex, setCurrentTrackIndex, approvedSongs } = useRequestSongStore();

  // --- Local State ---
  const [deviceId, setDeviceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);

  // --- Refs ---
  const approvedSongsRef = useRef<RequestSong[]>([]);
  const currentTrackIndexRef = useRef(currentTrackIndex);
  const playerRef = useRef<Spotify.Player | null>(null);
  const trackEndTriggered = useRef(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // --- Update Refs when State Changes ---
  useEffect(() => {
    approvedSongsRef.current = approvedSongs;
  }, [approvedSongs]);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  // --- Initialize Spotify Player ---
  const handlePlayerInit = useCallback(
    (accessToken?: string) => {
      const config: PlayerConfig = {
        name: 'JukeVibes Player',
        accessToken: accessToken || spotifyAccessToken!,
        onReady: (deviceId: string) => {
          console.log('Device Ready:', deviceId);
          setIsPlaying(false);
          setDeviceId(deviceId);
        },
        onStateChange: (state: Spotify.PlaybackState | null) => {
          console.log('State Change:', state);
          setIsPlaying(state ? !state.paused : false);
        },
        onAuthError: (message: string) => {
          console.error('Auth Error:', message);

          handleTokenRefresh(spotifyRefreshToken, setSpotifyTokens).then((token) =>
            handlePlayerInit(token!),
          );
          setIsPlaying(false);
          window.location.reload();
        },
      };

      const newPlayer = initializePlayer(config);
      newPlayer.connect();
      playerRef.current = newPlayer;

      // Cleanup on unmount
      return () => {
        newPlayer.disconnect();
        playerRef.current = null;
      };
    },
    [spotifyAccessToken, spotifyRefreshToken, setSpotifyTokens],
  );

  // --- Playback Management ---
  const handlePlayback = useCallback(
    async (retryCount = 0, index?: number) => {
      try {
        setIsLoading(true);
        // Transfer playback to the current device
        await transferPlayback(deviceId, spotifyAccessToken!);
        // Start playback for the provided track index (or currentTrackIndex by default)
        await startPlayback({
          deviceId,
          accessToken: spotifyAccessToken || '',
          trackIndex: typeof index !== 'undefined' ? index : currentTrackIndex,
          approvedSongs: approvedSongsRef.current,
        });
      } catch (error) {
        console.error(error);
        if (retryCount < 3) {
          setTimeout(() => handlePlayback(retryCount + 1, index), 1000);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [deviceId, spotifyAccessToken, currentTrackIndex],
  );

  // Use a ref to always access the latest handlePlayback function
  const handlePlaybackRef = useRef(handlePlayback);
  useEffect(() => {
    handlePlaybackRef.current = handlePlayback;
  }, [handlePlayback]);

  // --- Load Spotify SDK Script and Initialize Player ---
  useEffect(() => {
    let script = document.getElementById('spotify-player-script') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'spotify-player-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = handlePlayerInit;

    return () => {
      window.onSpotifyWebPlaybackSDKReady = () => {};
      playerRef.current?.disconnect();
    };
  }, [spotifyAccessToken, handlePlayerInit]);

  // --- Periodically Refresh Access Token (every 30 minutes) ---
  useEffect(() => {
    // Set an interval to refresh the token every 30 minutes
    const refreshInterval = setInterval(
      () => {
        if (spotifyRefreshToken) {
          handleTokenRefresh(spotifyRefreshToken, setSpotifyTokens)
            .then((token) => handlePlayerInit(token!))
            .catch((error) => console.error('Token refresh failed:', error));
        }
      },
      30 * 60 * 1000,
    ); // 30 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, [setSpotifyTokens]);

  // --- Utility: Format Time as mm:ss ---
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- Calculate Progress Percentage ---
  const progressPercentage = currentDuration > 0 ? (currentPosition / currentDuration) * 100 : 0;

  // --- Seek Handler (for click and drag) ---
  const handleSeek = async (clientX: number) => {
    if (!progressBarRef.current || !playerRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = clientX - rect.left;
    const totalWidth = rect.width;
    const seekPercentage = Math.max(0, Math.min(1, clickPosition / totalWidth));
    const newPosition = currentDuration * seekPercentage;

    try {
      await playerRef.current.seek(newPosition);
      setCurrentPosition(newPosition); // Update UI immediately
    } catch (error) {
      console.error('Seek failed:', error);
    }
  };

  // --- Mouse Event Handlers for Dragging the Progress Bar ---
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

  // --- Poll Playback State and Auto-Advance Track ---
  useEffect(() => {
    const pollingInterval = setInterval(async () => {
      if (playerRef.current) {
        const state = await playerRef.current.getCurrentState();
        if (state) {
          setCurrentPosition(state.position);
          setCurrentDuration(state.duration);

          // If track is nearly finished, trigger the next track
          const trackEndThreshold = 0.995; // 99.5% progress
          const progress = state.duration > 0 ? state.position / state.duration : 0;

          if (progress >= trackEndThreshold && !trackEndTriggered.current) {
            trackEndTriggered.current = true;
            const nextIndex = (currentTrackIndexRef.current + 1) % approvedSongsRef.current.length;
            setCurrentTrackIndex(nextIndex);
          } else if (progress < trackEndThreshold) {
            trackEndTriggered.current = false;
          }
        }
      }
    }, 1000); // Poll every second

    return () => {
      clearInterval(pollingInterval);
    };
  }, []);

  // --- Control Handlers for Previous, Next, and Play/Pause ---
  const handlePrevious = async () => {
    const prevIndex =
      currentTrackIndex > 0
        ? currentTrackIndexRef.current - 1
        : approvedSongsRef.current.length - 1;
    setCurrentTrackIndex(prevIndex);
    if (isPlaying) {
      await handlePlayback(0, prevIndex);
    }
  };

  const handleNext = async () => {
    const nextIndex = (currentTrackIndexRef.current + 1) % approvedSongsRef.current.length;
    setCurrentTrackIndex(nextIndex);
    if (isPlaying) {
      await handlePlayback(0, nextIndex);
    }
  };

  const handlePlayPause = async () => {
    if (!playerRef.current) return;
    // If playback has not started, start the current track
    if (!isPlaying && currentPosition === 0) {
      await handlePlayback();
      return;
    }
    return isPlaying ? playerRef.current.pause() : playerRef.current.resume();
  };

  // --- Trigger Playback When Current Track Index Changes ---
  useEffect(() => {
    if (playerRef.current && approvedSongsRef.current.length > 0) {
      handlePlaybackRef.current(0, currentTrackIndex);
    }
  }, [currentTrackIndex]);

  // --- Select the Current Track ---
  const currentTrack = approvedSongsRef.current[currentTrackIndex];

  return (
    <div className="container">
      {currentTrack?.song_title && (
        <Helmet title={`${isPlaying ? '▶️' : '⏸️'} ${currentTrack.song_title} | JukeVibes`} />
      )}
      {currentTrack && (
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-full aspect-square bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${currentTrack.cover_image})` }}
          >
            {isLoading && (
              <div className="text-center text-xl content-center bg-slate-500/30 w-full h-full">
                Loading...
              </div>
            )}
          </div>

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
                className="absolute h-3 w-3 -ml-1.5 -mt-1.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
