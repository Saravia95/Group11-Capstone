import { spotifyApi, refreshSpotifyAccessToken } from '../config/spotify';
import { prisma } from '../config/prisma';
import type { RequestSongResponse, Song } from '../types/song';
import { getRandomIndex } from '../utils/utils';

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

  private async ensureValidToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpirationTime) {
      await refreshSpotifyAccessToken();
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

  async requestSong(
    songId: string,
    customerId: string,
    ownerId: string,
  ): Promise<RequestSongResponse> {
    try {
      await this.ensureValidToken();

      const isSongRequested = await prisma.requestSong.findFirst({
        where: {
          song_id: songId,
          customer_id: customerId,
        },
      });

      if (isSongRequested) {
        return { success: false, message: 'Song already requested' };
      }

      const songData = await spotifyApi.getTrack(songId);

      const requestSong = await prisma.requestSong.create({
        data: {
          song_id: songId,
          song_title: songData.body.name,
          artist_name: songData.body.artists[0].name,
          cover_image: songData.body.album.images[0].url,
          play_time: this.msToMinutesAndSeconds(songData.body.duration_ms),
          customer_id: customerId,
          owner_id: ownerId,
          status: customerId === ownerId ? 'approved' : 'pending',
        },
      });

      const formattedSong = {
        id: requestSong.id.toString(),
        coverImage: requestSong.cover_image,
        songTitle: requestSong.song_title,
        artistName: requestSong.artist_name,
        playTime: requestSong.play_time,
      };

      return { success: true, data: formattedSong as Song };
    } catch (error) {
      console.error('fail to request song:', error);
      throw error;
    }
  }

  async reviewSong(id: string, approved: boolean): Promise<void> {
    try {
      await prisma.requestSong.update({
        where: { id: +id },
        data: { status: approved ? 'approved' : 'rejected' },
      });
    } catch (error) {
      console.error('fail to review song:', error);
      throw error;
    }
  }

  async resetRejectedSong(id: string): Promise<void> {
    try {
      await prisma.requestSong.delete({
        where: { id: +id },
      });
    } catch (error) {
      console.error('fail to reset rejected song:', error);
      throw error;
    }
  }

  async setPlaying(id: string): Promise<void> {
    try {
      await prisma.requestSong.updateMany({
        where: { is_playing: true },
        data: { is_playing: false },
      });

      await prisma.requestSong.update({
        where: { id: +id },
        data: { is_playing: true },
      });
    } catch (error) {
      console.error('fail to set playing:', error);
      throw error;
    }
  }

  async getRecommendedSongs(): Promise<Song[]> {
    await this.ensureValidToken();
    try {
      const options = {
        seed_genres: ['rock', 'pop'], // Array of genres (at least one required)
        limit: 10, // Optional: number of tracks to return
      };

      const data = await spotifyApi.getNewReleases(options);

      const recommendedSongs = await spotifyApi.getArtistTopTracks(
        data.body.albums.items[getRandomIndex(data.body.albums.items.length)].artists[0].id,
        'US',
      );

      return (
        recommendedSongs.body.tracks?.map((track) => ({
          id: track.id,
          coverImage: track.album.images[0]?.url || '',
          songTitle: track.name,
          artistName: track.artists[0].name,
          playTime: this.msToMinutesAndSeconds(track.duration_ms),
        })) || []
      );
    } catch (error) {
      console.error('fail to get recommended songs!:', error);

      throw error;
    }
  }
}
