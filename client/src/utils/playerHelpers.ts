import axiosInstance from '../config/axiosInstance';
import { RequestSong } from '../stores/requestSongStore';

export interface PlayerConfig {
  name: string;
  accessToken: string;
  volume?: number;
  onReady?: (deviceId: string) => void;
  onStateChange?: (state: Spotify.PlaybackState | null) => void;
  onAuthError?: (message: string) => void;
}

interface PlaybackOptions {
  deviceId: string;
  accessToken: string;
  trackIndex: number;
  approvedSongs: RequestSong[];
}

// Player initialization
export const initializePlayer = (config: PlayerConfig): Spotify.Player => {
  const player = new window.Spotify.Player({
    name: config.name,
    getOAuthToken: (cb) => cb(config.accessToken),
    volume: config.volume || 0.5,
  });

  player.addListener('ready', ({ device_id }) => {
    config.onReady?.(device_id);
  });

  player.addListener('player_state_changed', (state) => {
    config.onStateChange?.(state);
  });

  player.addListener('authentication_error', ({ message }) => {
    config.onAuthError?.(message);
  });

  player.addListener('initialization_error', ({ message }) => {
    console.error('Initialization Error:', message);
  });

  return player;
};

// Device transfer handling
export const transferPlayback = async (deviceId: string, accessToken: string): Promise<void> => {
  const response = await fetch(`https://api.spotify.com/v1/me/player`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ device_ids: [deviceId], play: true }),
  });

  if (!response.ok) {
    throw new Error('Device transfer failed');
  }
};

// Track playback handling
export const startPlayback = async ({
  deviceId,
  accessToken,
  trackIndex,
  approvedSongs,
}: PlaybackOptions): Promise<void> => {
  if (approvedSongs.length === 0) return;

  const currentSong = approvedSongs[trackIndex];
  const trackId = currentSong.song_id.replace(/.*track[/:]/g, '');

  const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
  });

  if (!response.ok) {
    throw new Error('Start playback failed');
  }
};

// Token refresh handling
export const handleTokenRefresh = async (
  refreshToken: string | null,
  setTokens: (tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => void,
): Promise<void> => {
  if (!refreshToken) return;

  try {
    const { data } = await axiosInstance.post('/spotify-refresh-token', {
      refreshToken,
    });

    if (data.success) {
      setTokens({
        accessToken: data.access_token,
        refreshToken: refreshToken,
        expiresIn: data.expires_in,
      });
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
};
