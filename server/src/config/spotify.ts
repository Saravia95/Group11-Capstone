import dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';

dotenv.config();

export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});
