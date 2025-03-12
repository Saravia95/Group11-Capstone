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
      script?.remove();
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
    <div className="laptop:h-[90vh] laptop:flex laptop:items-center laptop:justify-center laptop:p-16 desktop:p-32 w-full p-4">
      {currentTrack?.song_title && (
        <Helmet title={`${isPlaying ? '▶️' : '⏸️'} ${currentTrack.song_title} | JukeVibes`} />
      )}
      {currentTrack && (
        <div className="laptop:items-start tablet:gap-5 laptop:gap-5 flex w-full flex-col items-center gap-4">
          {/* Mobile Layout: Cover Image, Song Info, Controls in Row */}
          <div className="laptop:hidden flex w-full items-center">
            <div
              className="mr-4 aspect-square w-24 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${currentTrack.cover_image})` }}
            >
              {isLoading && (
                <div className="heading-2 size-full content-center bg-slate-500/30 text-center">
                  Loading...
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center">
              {/* flex-1 to take remaining space */}
              <h3 className="heading-2">{currentTrack.song_title}</h3>
              <p className="body-1 mt-1">{currentTrack.artist_name}</p>
            </div>
            <div className="flex text-3xl">
              {/* Controls on the right, aligned in row */}
              <button className="cursor-pointer" onClick={handlePrevious} disabled={isLoading}>
                <FontAwesomeIcon icon={faBackwardStep} fixedWidth />
              </button>
              <button
                className="mx-4 cursor-pointer"
                onClick={handlePlayPause}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} fixedWidth />
              </button>
              <button className="cursor-pointer" onClick={handleNext} disabled={isLoading}>
                <FontAwesomeIcon icon={faForwardStep} fixedWidth />
              </button>
            </div>
          </div>
          {/* Mobile Progress Bar - Below Cover Image */}
          <div
            className="laptop:hidden mt-4 w-full cursor-pointer px-2"
            ref={progressBarRef}
            onClick={(e) => handleSeek(e.clientX)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
          >
            <div className="group relative h-2 rounded-full bg-gray-300">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
              {/* Hover thumb indicator */}
              <div
                className="absolute -mt-1.5 -ml-1.5 h-3 w-3 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                style={{
                  left: `${progressPercentage}%`,
                  top: '50%',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm text-gray-400">
              <span className="caption">{formatTime(currentPosition)}</span>
              <span className="caption">-{formatTime(currentDuration - currentPosition)}</span>
            </div>
          </div>
          {/* Laptop and Desktop Layout: Cover Image Above Song Info */}
          <div className="laptop:block laptop:w-full mx-auto hidden">
            {' '}
            {/* laptop:w-full */}
            <div
              className="aspect-square w-full rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${currentTrack.cover_image})` }}
            >
              {isLoading && (
                <div className="heading-2 size-full content-center bg-slate-500/30 text-center">
                  Loading...
                </div>
              )}
            </div>
          </div>
          {/* Laptop and Desktop Song Info */}
          <div className="laptop:block laptop:text-left laptop:w-full mx-auto hidden">
            {' '}
            {/* laptop:w-full */}
            <h3 className="heading-2">{currentTrack.song_title}</h3>
            <p className="body-1 laptop:mt-3 mt-2">{currentTrack.artist_name}</p>
          </div>
          {/* Controls - Always Below (Laptop and Desktop) */}
          <div className="laptop:flex hidden w-full flex-col items-center">
            {' '}
            {/* w-full */}
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
              className="mt-5 w-full max-w-2xl cursor-pointer px-4"
              ref={progressBarRef}
              onClick={(e) => handleSeek(e.clientX)}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp}
            >
              <div className="group relative h-2 rounded-full bg-gray-300">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
                {/* Hover thumb indicator */}
                <div
                  className="absolute -mt-1.5 -ml-1.5 h-3 w-3 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                  style={{
                    left: `${progressPercentage}%`,
                    top: '50%',
                    pointerEvents: 'none',
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-400">
                <span className="caption">{formatTime(currentPosition)}</span>
                <span className="caption">-{formatTime(currentDuration - currentPosition)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
