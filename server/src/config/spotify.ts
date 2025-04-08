import dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';
import { BASE_URL } from '../constants/baseUrl';

dotenv.config();

export const spotifyApi = new SpotifyWebApi({
  redirectUri: `${BASE_URL}/auth/spotify-callback`,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  spotifyApi.setAccessToken(access);
  spotifyApi.setRefreshToken(refresh);
};

export const getSpotifyApi = () => {
  if (accessToken && refreshToken) {
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);
  }
  return spotifyApi;
};

export const refreshSpotifyAccessToken = async () => {
  if (!refreshToken) throw new Error('No refresh token available');

  try {
    const data = await spotifyApi.refreshAccessToken();
    const newAccessToken = data.body['access_token'];

    console.log('🔄 Refreshed Access Token:', newAccessToken);

    // Update stored tokens
    accessToken = newAccessToken;
    spotifyApi.setAccessToken(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('❌ Failed to refresh access token:', error);
    throw error;
  }
};
