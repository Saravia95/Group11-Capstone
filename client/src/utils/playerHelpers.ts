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

/**
 * Initializes the Spotify Web Playback SDK player.
 */
export const initializePlayer = (config: PlayerConfig): Spotify.Player => {
  const player = new window.Spotify.Player({
    name: config.name,
    getOAuthToken: (cb) => cb(config.accessToken),
    volume: config.volume ?? 0.5,
  });

  // Listener for when the player is ready
  player.addListener('ready', ({ device_id }) => {
    config.onReady?.(device_id);
  });

  // Listener for state changes
  player.addListener('player_state_changed', (state) => {
    config.onStateChange?.(state);
  });

  // Listener for authentication errors
  player.addListener('authentication_error', ({ message }) => {
    config.onAuthError?.(message);
  });

  // Listener for initialization errors
  player.addListener('initialization_error', ({ message }) => {
    console.error('Initialization Error:', message);
  });

  return player;
};

/**
 * Transfers playback to the specified device.
 */
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
    console.log('Device transfer failed');
  }
};

/**
 * Starts playback of a track based on the provided index.
 */
export const startPlayback = async ({
  deviceId,
  accessToken,
  trackIndex,
  approvedSongs,
}: PlaybackOptions): Promise<void> => {
  if (approvedSongs.length === 0) return;

  const currentSong = approvedSongs[trackIndex];
  // Extract the track ID from the song_id string
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

/**
 * Handles token refresh using the provided refresh token.
 */
export const handleTokenRefresh = async (
  refreshToken: string | null,
  setTokens: (tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => void,
): Promise<string | void> => {
  if (!refreshToken) return;

  try {
    console.log('Refreshing token...');

    const { data } = await axiosInstance.post('/auth/spotify-refresh-token', { refreshToken });
    console.log('Token refresh response:', data);

    if (data.success) {
      setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      });
    }
    return data.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return;
  }
};
