import { SongService } from '../src/services/songService';
import { spotifyApi } from '../src/config/spotify';
import { prisma } from '../src/config/prisma';
import type { RequestSongResponse, Song } from '../src/types/song';

// Mock spotifyApi and prisma modules
jest.mock('../src/config/spotify', () => ({
  spotifyApi: {
    clientCredentialsGrant: jest.fn(),
    setAccessToken: jest.fn(),
    searchTracks: jest.fn(),
    getTrack: jest.fn(),
  },
}));

jest.mock('../src/config/prisma', () => ({
  prisma: {
    requestSong: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('SongService e2e Tests', () => {
  let songService: SongService;
  let mockSpotifyApi: jest.Mocked<typeof spotifyApi>;
  let mockPrismaRequestSong: jest.Mocked<typeof prisma.requestSong>;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    songService = SongService.getInstance();
    mockSpotifyApi = spotifyApi as jest.Mocked<typeof spotifyApi>;
    mockPrismaRequestSong = prisma.requestSong as jest.Mocked<typeof prisma.requestSong>;
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.clearAllMocks(); // Clear mocks before each test
    mockSpotifyApi.clientCredentialsGrant.mockResolvedValueOnce({
      body: { access_token: 'mock-access-token', expires_in: 3600 },
    } as any);
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  describe('searchSongs', () => {
    it('should successfully search songs from Spotify and return formatted song list', async () => {
      const mockSpotifyResponse = {
        body: {
          tracks: {
            items: [
              {
                id: 'song-id-1',
                name: 'Song Title 1',
                artists: [{ name: 'Artist 1' }],
                album: { images: [{ url: 'cover-image-url-1' }] },
                duration_ms: 180000, // 3 minutes
              },
              {
                id: 'song-id-2',
                name: 'Song Title 2',
                artists: [{ name: 'Artist 2' }],
                album: { images: [{ url: 'cover-image-url-2' }] },
                duration_ms: 240000, // 4 minutes
              },
            ],
          },
        },
      };
      mockSpotifyApi.clientCredentialsGrant.mockResolvedValueOnce({
        body: { access_token: 'mock-access-token', expires_in: 3600 },
      } as any);
      mockSpotifyApi.searchTracks.mockResolvedValueOnce(mockSpotifyResponse as any);

      const filter = 'title';
      const searchTerm = 'test song';
      const songs = await songService.searchSongs(filter, searchTerm);

      expect(mockSpotifyApi.clientCredentialsGrant).toHaveBeenCalledTimes(1);
      expect(mockSpotifyApi.setAccessToken).toHaveBeenCalledTimes(1);
      expect(mockSpotifyApi.searchTracks).toHaveBeenCalledWith(searchTerm);
      expect(songs).toEqual([
        {
          id: 'song-id-1',
          coverImage: 'cover-image-url-1',
          songTitle: 'Song Title 1',
          artistName: 'Artist 1',
          playTime: '3:00',
        },
        {
          id: 'song-id-2',
          coverImage: 'cover-image-url-2',
          songTitle: 'Song Title 2',
          artistName: 'Artist 2',
          playTime: '4:00',
        },
      ]);
    });

    it('should search songs by artist filter', async () => {
      mockSpotifyApi.clientCredentialsGrant.mockResolvedValueOnce({
        body: { access_token: 'mock-access-token', expires_in: 3600 },
      } as any);
      mockSpotifyApi.searchTracks.mockResolvedValueOnce({ body: { tracks: { items: [] } } } as any);

      const filter = 'artist';
      const searchTerm = 'test artist';
      await songService.searchSongs(filter, searchTerm);

      expect(mockSpotifyApi.searchTracks).toHaveBeenCalledWith(`artist:${searchTerm}`);
    });

    it('should throw error if spotifyApi.searchTracks fails', async () => {
      mockSpotifyApi.clientCredentialsGrant.mockResolvedValueOnce({
        body: { access_token: 'mock-access-token', expires_in: 3600 },
      } as any);
      mockSpotifyApi.searchTracks.mockRejectedValueOnce(new Error('Spotify Search Error'));

      const filter = 'title';
      const searchTerm = 'error song';

      await expect(songService.searchSongs(filter, searchTerm)).rejects.toThrowError(
        'Spotify Search Error',
      );
    });
  });

  describe('requestSong', () => {
    it('should successfully request a song and return formatted song data', async () => {
      const mockSpotifyGetTrackResponse = {
        body: {
          id: 'requested-song-id',
          name: 'Requested Song Title',
          artists: [{ name: 'Requested Artist' }],
          album: { images: [{ url: 'requested-cover-image-url' }] },
          duration_ms: 210000, // 3:30 minutes
        },
      };
      const mockPrismaCreateResponse = {
        id: 1,
        song_id: 'requested-song-id',
        song_title: 'Requested Song Title',
        artist_name: 'Requested Artist',
        cover_image: 'requested-cover-image-url',
        play_time: '3:30',
        customer_id: 'customer-id-1',
        owner_id: 'owner-id-1',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSpotifyApi.clientCredentialsGrant.mockResolvedValueOnce({
        body: { access_token: 'mock-access-token', expires_in: 3600 },
      } as any);
      mockPrismaRequestSong.findFirst.mockResolvedValueOnce(null); // Simulate song not already requested
      mockSpotifyApi.getTrack.mockResolvedValueOnce(mockSpotifyGetTrackResponse as any);
      mockPrismaRequestSong.create.mockResolvedValueOnce(mockPrismaCreateResponse);

      const songId = 'requested-song-id';
      const customerId = 'customer-id-1';
      const ownerId = 'owner-id-1';
      const result = await songService.requestSong(songId, customerId, ownerId);

      expect(mockPrismaRequestSong.findFirst).toHaveBeenCalledWith({
        where: { song_id: songId, customer_id: customerId },
      });
      expect(mockSpotifyApi.getTrack).toHaveBeenCalledWith(songId);
      expect(mockPrismaRequestSong.create).toHaveBeenCalledWith({
        data: {
          song_id: songId,
          song_title: mockSpotifyGetTrackResponse.body.name,
          artist_name: mockSpotifyGetTrackResponse.body.artists[0].name,
          cover_image: mockSpotifyGetTrackResponse.body.album.images[0].url,
          play_time: '3:30',
          customer_id: customerId,
          owner_id: ownerId,
          status: 'pending',
        },
      });
      expect(result).toEqual({
        success: true,
        data: {
          id: '1',
          coverImage: 'requested-cover-image-url',
          songTitle: 'Requested Song Title',
          artistName: 'Requested Artist',
          playTime: '3:30',
        },
      });
    });

    it('should return success: false if song is already requested', async () => {
      mockSpotifyApi.clientCredentialsGrant.mockResolvedValueOnce({
        body: { access_token: 'mock-access-token', expires_in: 3600 },
      } as any);
      mockPrismaRequestSong.findFirst.mockResolvedValueOnce({
        id: 1,
        customer_id: 'customer-id-1',
        song_id: 'requested-song-id',
        song_title: 'Requested Song Title',
        artist_name: 'Requested Artist',
        cover_image: 'requested-cover-image-url',
        play_time: '3:30',
        owner_id: 'owner-id-1',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const songId = 'requested-song-id';
      const customerId = 'customer-id-1';
      const ownerId = 'owner-id-1';
      const result = await songService.requestSong(songId, customerId, ownerId);

      expect(mockPrismaRequestSong.findFirst).toHaveBeenCalledTimes(1);
      expect(mockSpotifyApi.getTrack).not.toHaveBeenCalled();
      expect(mockPrismaRequestSong.create).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, message: 'Song already requested' });
    });

    it('should throw error if spotifyApi.getTrack fails', async () => {
      mockSpotifyApi.clientCredentialsGrant.mockResolvedValueOnce({
        body: { access_token: 'mock-access-token', expires_in: 3600 },
      } as any);
      mockPrismaRequestSong.findFirst.mockResolvedValueOnce(null);
      mockSpotifyApi.getTrack.mockRejectedValueOnce(new Error('Spotify Get Track Error'));

      const songId = 'requested-song-id';
      const customerId = 'customer-id-1';
      const ownerId = 'owner-id-1';

      await expect(songService.requestSong(songId, customerId, ownerId)).rejects.toThrowError(
        'Spotify Get Track Error',
      );
    });

    it('should throw error if prisma.requestSong.create fails', async () => {
      const mockSpotifyGetTrackResponse = {
        body: {
          id: 'requested-song-id',
          name: 'Requested Song Title',
          artists: [{ name: 'Requested Artist' }],
          album: { images: [{ url: 'requested-cover-image-url' }] },
          duration_ms: 210000,
        },
      };
      mockSpotifyApi.clientCredentialsGrant.mockResolvedValueOnce({
        body: { access_token: 'mock-access-token', expires_in: 3600 },
      } as any);
      mockPrismaRequestSong.findFirst.mockResolvedValueOnce(null);
      mockSpotifyApi.getTrack.mockResolvedValueOnce(mockSpotifyGetTrackResponse as any);
      mockPrismaRequestSong.create.mockRejectedValueOnce(new Error('Prisma Create Error'));

      const songId = 'requested-song-id';
      const customerId = 'customer-id-1';
      const ownerId = 'owner-id-1';

      await expect(songService.requestSong(songId, customerId, ownerId)).rejects.toThrowError(
        'Prisma Create Error',
      );
    });
  });

  describe('reviewSong', () => {
    it('should successfully update song status to approved', async () => {
      mockPrismaRequestSong.update.mockResolvedValueOnce({
        id: 1,
        customer_id: 'customer-id-1',
        song_id: 'requested-song-id',
        song_title: 'Requested Song Title',
        artist_name: 'Requested Artist',
        cover_image: 'requested-cover-image-url',
        play_time: '3:30',
        owner_id: 'owner-id-1',
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const songId = '1';
      const approved = true;
      await songService.reviewSong(songId, approved);

      expect(mockPrismaRequestSong.update).toHaveBeenCalledWith({
        where: { id: +songId },
        data: { status: 'approved' },
      });
    });

    it('should successfully update song status to rejected', async () => {
      mockPrismaRequestSong.update.mockResolvedValueOnce({
        id: 1,
        customer_id: 'customer-id-1',
        song_id: 'requested-song-id',
        song_title: 'Requested Song Title',
        artist_name: 'Requested Artist',
        cover_image: 'requested-cover-image-url',
        play_time: '3:30',
        owner_id: 'owner-id-1',
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const songId = '1';
      const approved = false;
      await songService.reviewSong(songId, approved);

      expect(mockPrismaRequestSong.update).toHaveBeenCalledWith({
        where: { id: +songId },
        data: { status: 'rejected' },
      });
    });

    it('should throw error if prisma.requestSong.update fails', async () => {
      mockPrismaRequestSong.update.mockRejectedValueOnce(new Error('Prisma Update Error'));

      const songId = '1';
      const approved = true;

      await expect(songService.reviewSong(songId, approved)).rejects.toThrowError(
        'Prisma Update Error',
      );
    });
  });

  describe('resetRejectedSong', () => {
    it('should successfully delete a rejected song by id', async () => {
      mockPrismaRequestSong.delete.mockResolvedValueOnce({
        id: 1,
        customer_id: 'customer-id-1',
        song_id: 'requested-song-id',
        song_title: 'Requested Song Title',
        artist_name: 'Requested Artist',
        cover_image: 'requested-cover-image-url',
        play_time: '3:30',
        owner_id: 'owner-id-1',
        status: 'rejected',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const songId = '1';
      await songService.resetRejectedSong(songId);

      expect(mockPrismaRequestSong.delete).toHaveBeenCalledWith({
        where: { id: +songId },
      });
    });

    it('should throw error if prisma.requestSong.delete fails', async () => {
      mockPrismaRequestSong.delete.mockRejectedValueOnce(new Error('Prisma Delete Error'));

      const songId = '1';

      await expect(songService.resetRejectedSong(songId)).rejects.toThrowError(
        'Prisma Delete Error',
      );
    });
  });
});
