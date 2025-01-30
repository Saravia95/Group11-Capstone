import { spotifyApi } from '../config/spotify';
import { Song } from '../types/song';

export class SongService {
  private static instance: SongService;
  private accessToken: string | null = null;
  private tokenExpirationTime: number = 0;

  private constructor() {}

  static getInstance(): SongService {
    if (!SongService.instance) {
      SongService.instance = new SongService();
    }
    return SongService.instance;
  }

  private async refreshAccessToken() {
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      this.accessToken = data.body.access_token;
      spotifyApi.setAccessToken(this.accessToken);
      this.tokenExpirationTime = Date.now() + data.body.expires_in * 1000;
    } catch (error) {
      console.error('fail to refresh access token:', error);
      throw error;
    }
  }

  private async ensureValidToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpirationTime) {
      await this.refreshAccessToken();
    }
  }

  private msToMinutesAndSeconds(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  }

  async searchSongs(filter: string, searchTerm: string): Promise<Song[]> {
    try {
      await this.ensureValidToken();

      const searchQuery = filter === 'artist' ? `artist:${searchTerm}` : searchTerm;

      const data = await spotifyApi.searchTracks(searchQuery);

      return (
        data.body.tracks?.items.map((track) => ({
          id: track.id,
          coverImage: track.album.images[0]?.url || '',
          songTitle: track.name,
          artistName: track.artists[0].name,
          playTime: this.msToMinutesAndSeconds(track.duration_ms),
        })) || []
      );
    } catch (error) {
      console.error('fail to search songs:', error);
      throw error;
    }
  }
}
