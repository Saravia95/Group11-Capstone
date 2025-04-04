import dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';

dotenv.config();

export const spotifyApi = new SpotifyWebApi({
  redirectUri: 'http://localhost:3000/auth/spotify-callback',
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
    const newRefreshToken = data.body['refresh_token']; // Get the new refresh token if available
    console.log('🔄 Refreshed Access Token:', newAccessToken);

    // Update stored tokens
    accessToken = newAccessToken;
    //refreshToken = newRefreshToken;
    spotifyApi.setAccessToken(newAccessToken);
    spotifyApi.setRefreshToken(newRefreshToken || refreshToken); // Use the new refresh token if available
    return newAccessToken;
  } catch (error) {
    console.error('❌ Failed to refresh access token:', error);
    throw error;
  }
};
