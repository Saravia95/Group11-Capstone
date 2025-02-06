import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRequestSongStore } from '../stores/requestSongStore';
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
  const { requestSongs } = useRequestSongStore();
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const approvedSongs = useMemo(
    () =>
      requestSongs
        .filter((song) => song.status === 'approved')
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [requestSongs],
  );

  // 플레이어 초기화
  const initializePlayer = useCallback(() => {
    const newPlayer = new window.Spotify.Player({
      name: 'JukeVibes Player',
      getOAuthToken: (cb) => cb(spotifyAccessToken!),
      volume: 0.5,
    });

    const handleStateChange = (state: PlayerState | null) => {
      if (!state) {
        setIsPlaying(false);
        return;
      }

      setIsPlaying(!state.paused);
      const progress = (state.position / state.duration) * 100;
      if (progress >= 99.5 && !state.paused) {
        setCurrentTrackIndex((prev) => (prev + 1) % approvedSongs.length);
      }
    };

    newPlayer.addListener('ready', ({ device_id }) => {
      console.log('Device Ready:', device_id);
      setDeviceId(device_id);
    });

    newPlayer.addListener('player_state_changed', handleStateChange);
    newPlayer.addListener('authentication_error', ({ message }) => {
      console.error('Auth Error:', message);
      // refreshToken();
    });

    newPlayer.addListener('initialization_error', ({ message }) =>
      console.error('Init Error:', message),
    );

    return newPlayer;
  }, [spotifyAccessToken, approvedSongs.length]);

  // 재생 관련 함수
  const transferPlayback = useCallback(async () => {
    const response = await fetch(`https://api.spotify.com/v1/me/player`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    });

    if (!response.ok) throw new Error('Device transfer failed');
  }, [deviceId, spotifyAccessToken]);

  const startPlayback = useCallback(async () => {
    const trackId = approvedSongs[currentTrackIndex].song_id.replace(/.*track[/:]/g, '');
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
    });
  }, [deviceId, spotifyAccessToken, approvedSongs, currentTrackIndex]);

  // 재생 관리
  const handlePlayback = useCallback(
    async (retryCount = 0) => {
      try {
        setIsLoading(true);
        await transferPlayback();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await startPlayback();
      } catch (error) {
        console.error(error);
        if (retryCount < 3) {
          setTimeout(() => handlePlayback(retryCount + 1), 2000);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [transferPlayback, startPlayback],
  );

  // 플레이어 설정
  useEffect(() => {
    if (!spotifyAccessToken) {
      window.open('http://localhost:5173/spotify-login', '_blank', 'width=600,height=800');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = initializePlayer();
      newPlayer.connect();
      setPlayer(newPlayer);
    };

    return () => {
      if (player) {
        player.disconnect();
        setPlayer(null);
      }
      document.body.removeChild(script);
      window.onSpotifyWebPlaybackSDKReady = () => {};
    };
  }, [spotifyAccessToken, initializePlayer]);

  // 트랙 변경 감지
  useEffect(() => {
    if (deviceId && approvedSongs[currentTrackIndex]) {
      handlePlayback();
    }
  }, [currentTrackIndex, deviceId, approvedSongs, handlePlayback]);

  // 컨트롤 핸들러
  const handlePrevious = () => {
    setCurrentTrackIndex((prev) => (prev > 0 ? prev - 1 : approvedSongs.length - 1));
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % approvedSongs.length);
  };

  const handlePlayPause = () => {
    player?.togglePlay();
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="container">
      {isLoading && <div className="loading">Loading...</div>}

      {approvedSongs[currentTrackIndex] && (
        <div className="flex flex-col items-center gap-10">
          <img
            src={approvedSongs[currentTrackIndex].cover_image}
            alt="Album Art"
            className="album-art"
          />

          <div className="text-center">
            <h3 className="text-3xl font-medium">{approvedSongs[currentTrackIndex].song_title}</h3>
            <p className="mt-3">{approvedSongs[currentTrackIndex].artist_name}</p>
          </div>

          <div className="flex gap-20 text-6xl">
            <button onClick={handlePrevious} disabled={isLoading}>
              <FontAwesomeIcon icon={faBackwardStep} fixedWidth />
            </button>

            <button onClick={handlePlayPause} disabled={isLoading}>
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} fixedWidth />
            </button>

            <button onClick={handleNext} disabled={isLoading}>
              <FontAwesomeIcon icon={faForwardStep} fixedWidth />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
