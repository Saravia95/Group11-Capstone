import { SongService } from './songService';
import { spotifyApi } from '../config/spotify';

jest.mock('../config/spotify', () => ({
  spotifyApi: {
    clientCredentialsGrant: jest.fn(),
    setAccessToken: jest.fn(),
    searchTracks: jest.fn(),
    getTrack: jest.fn(),
  },
}));

describe('SongService', () => {
  let songService: SongService;

  beforeEach(() => {
    songService = SongService.getInstance();
    jest.clearAllMocks();
  });

  describe('searchSongs', () => {
    it('should successfully search songs and return formatted song array', async () => {
      const mockSearchTerm = 'test song';
      const mockSpotifyResponse = {
        body: {
          tracks: {
            items: [
              {
                id: 'song-id-1',
                name: 'Test Song 1',
                duration_ms: 180000,
                artists: [{ name: 'Artist 1' }],
                album: { images: [{ url: 'cover-url-1' }] },
              },
              {
                id: 'song-id-2',
                name: 'Test Song 2',
                duration_ms: 240000,
                artists: [{ name: 'Artist 2' }],
                album: { images: [{ url: 'cover-url-2' }] },
              },
            ],
          },
        },
      };
      (spotifyApi.searchTracks as jest.Mock).mockResolvedValue(mockSpotifyResponse);
      (spotifyApi.clientCredentialsGrant as jest.Mock).mockResolvedValue({
        body: { access_token: 'mock-token', expires_in: 3600 },
      });

      const result = await songService.searchSongs('title', mockSearchTerm);

      expect(spotifyApi.searchTracks).toHaveBeenCalledWith(mockSearchTerm);
      expect(result).toEqual([
        {
          id: 'song-id-1',
          coverImage: 'cover-url-1',
          songTitle: 'Test Song 1',
          artistName: 'Artist 1',
          playTime: '3:00',
        },
        {
          id: 'song-id-2',
          coverImage: 'cover-url-2',
          songTitle: 'Test Song 2',
          artistName: 'Artist 2',
          playTime: '4:00',
        },
      ]);
    });

    it('should search songs by artist filter', async () => {
      const mockSearchTerm = 'test artist';
      (spotifyApi.searchTracks as jest.Mock).mockResolvedValue({ body: { tracks: { items: [] } } });
      (spotifyApi.clientCredentialsGrant as jest.Mock).mockResolvedValue({
        body: { access_token: 'mock-token', expires_in: 3600 },
      });

      await songService.searchSongs('artist', mockSearchTerm);

      expect(spotifyApi.searchTracks).toHaveBeenCalledWith(`artist:${mockSearchTerm}`);
    });

    it('should handle searchTracks error', async () => {
      const mockSearchTerm = 'error term';
      const mockError = new Error('Spotify Search Error');
      (spotifyApi.searchTracks as jest.Mock).mockRejectedValue(mockError);
      (spotifyApi.clientCredentialsGrant as jest.Mock).mockResolvedValue({
        body: { access_token: 'mock-token', expires_in: 3600 },
      });

      await expect(songService.searchSongs('title', mockSearchTerm)).rejects.toThrowError(
        mockError,
      );
      expect(spotifyApi.searchTracks).toHaveBeenCalledWith(mockSearchTerm);
    });
  });
});
