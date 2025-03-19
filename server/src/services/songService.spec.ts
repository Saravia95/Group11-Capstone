import { SongService } from './songService';
import { spotifyApi } from '../config/spotify';
import { prisma } from '../config/prisma';

jest.mock('../config/spotify', () => ({
  spotifyApi: {
    clientCredentialsGrant: jest.fn(),
    setAccessToken: jest.fn(),
    searchTracks: jest.fn(),
    getTrack: jest.fn(),
  },
}));

jest.mock('../config/prisma', () => ({
  prisma: {
    requestSong: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('SongService', () => {
  let songService: SongService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    songService = SongService.getInstance();
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
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

  describe('requestSong', () => {
    it('should successfully request a song and return formatted song data', async () => {
      const mockSongId = 'song-id-1';
      const mockCustomerId = 'customer-id-1';
      const mockOwnerId = 'owner-id-1';
      (prisma.requestSong.findFirst as jest.Mock).mockResolvedValue(null); // Song not already requested
      const mockSpotifyGetTrackResponse = {
        body: {
          id: mockSongId,
          name: 'Requested Song',
          duration_ms: 210000,
          artists: [{ name: 'Requested Artist' }],
          album: { images: [{ url: 'requested-cover-url' }] },
        },
      };
      (spotifyApi.getTrack as jest.Mock).mockResolvedValue(mockSpotifyGetTrackResponse);
      const mockPrismaCreateResponse = {
        id: 123,
        song_id: mockSongId,
        song_title: 'Requested Song',
        artist_name: 'Requested Artist',
        cover_image: 'requested-cover-url',
        play_time: '3:30',
        customer_id: mockCustomerId,
        owner_id: mockOwnerId,
        status: 'pending',
      };
      (prisma.requestSong.create as jest.Mock).mockResolvedValue(mockPrismaCreateResponse);
      (spotifyApi.clientCredentialsGrant as jest.Mock).mockResolvedValue({
        body: { access_token: 'mock-token', expires_in: 3600 },
      });

      const result = await songService.requestSong(mockSongId, mockCustomerId, mockOwnerId);

      expect(prisma.requestSong.findFirst).toHaveBeenCalledWith({
        where: { song_id: mockSongId, customer_id: mockCustomerId },
      });
      expect(spotifyApi.getTrack).toHaveBeenCalledWith(mockSongId);
      expect(prisma.requestSong.create).toHaveBeenCalledWith({
        data: {
          song_id: mockSongId,
          song_title: 'Requested Song',
          artist_name: 'Requested Artist',
          cover_image: 'requested-cover-url',
          play_time: '3:30',
          customer_id: mockCustomerId,
          owner_id: mockOwnerId,
          status: 'pending',
        },
      });
      expect(result).toEqual({
        success: true,
        data: {
          id: '123',
          coverImage: 'requested-cover-url',
          songTitle: 'Requested Song',
          artistName: 'Requested Artist',
          playTime: '3:30',
        },
      });
    });

    it('should return success: false and message if song is already requested', async () => {
      const mockSongId = 'song-id-1';
      const mockCustomerId = 'customer-id-1';
      const mockOwnerId = 'owner-id-1';
      (prisma.requestSong.findFirst as jest.Mock).mockResolvedValue({}); // Song already requested

      const result = await songService.requestSong(mockSongId, mockCustomerId, mockOwnerId);

      expect(prisma.requestSong.findFirst).toHaveBeenCalledWith({
        where: { song_id: mockSongId, customer_id: mockCustomerId },
      });
      expect(spotifyApi.getTrack).not.toHaveBeenCalled();
      expect(prisma.requestSong.create).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, message: 'Song already requested' });
    });

    it('should handle spotifyApi.getTrack error', async () => {
      const mockSongId = 'song-id-1';
      const mockCustomerId = 'customer-id-1';
      const mockOwnerId = 'owner-id-1';
      (prisma.requestSong.findFirst as jest.Mock).mockResolvedValue(null);
      const mockError = new Error('Spotify GetTrack Error');
      (spotifyApi.getTrack as jest.Mock).mockRejectedValue(mockError);
      (spotifyApi.clientCredentialsGrant as jest.Mock).mockResolvedValue({
        body: { access_token: 'mock-token', expires_in: 3600 },
      });

      await expect(
        songService.requestSong(mockSongId, mockCustomerId, mockOwnerId),
      ).rejects.toThrowError(mockError);
      expect(spotifyApi.getTrack).toHaveBeenCalledWith(mockSongId);
      expect(prisma.requestSong.create).not.toHaveBeenCalled();
    });

    it('should handle prisma.requestSong.create error', async () => {
      const mockSongId = 'song-id-1';
      const mockCustomerId = 'customer-id-1';
      const mockOwnerId = 'owner-id-1';
      (prisma.requestSong.findFirst as jest.Mock).mockResolvedValue(null);
      (spotifyApi.getTrack as jest.Mock).mockResolvedValue({
        body: {
          id: mockSongId,
          name: 'Song',
          duration_ms: 1000,
          artists: [{ name: 'Artist' }],
          album: { images: [{ url: 'url' }] },
        },
      });
      const mockPrismaError = new Error('Prisma Create Error');
      (prisma.requestSong.create as jest.Mock).mockRejectedValue(mockPrismaError);
      (spotifyApi.clientCredentialsGrant as jest.Mock).mockResolvedValue({
        body: { access_token: 'mock-token', expires_in: 3600 },
      });

      await expect(
        songService.requestSong(mockSongId, mockCustomerId, mockOwnerId),
      ).rejects.toThrowError(mockPrismaError);
      expect(spotifyApi.getTrack).toHaveBeenCalledWith(mockSongId);
      expect(prisma.requestSong.create).toHaveBeenCalled();
    });
  });

  describe('reviewSong', () => {
    it('should successfully approve a song request', async () => {
      const mockRequestId = '123';
      const approved = true;

      await songService.reviewSong(mockRequestId, approved);

      expect(prisma.requestSong.update).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { status: 'approved' },
      });
    });

    it('should successfully reject a song request', async () => {
      const mockRequestId = '123';
      const approved = false;

      await songService.reviewSong(mockRequestId, approved);

      expect(prisma.requestSong.update).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { status: 'rejected' },
      });
    });

    it('should handle prisma.requestSong.update error', async () => {
      const mockRequestId = '123';
      const approved = true;
      const mockPrismaError = new Error('Prisma Update Error');
      (prisma.requestSong.update as jest.Mock).mockRejectedValue(mockPrismaError);

      await expect(songService.reviewSong(mockRequestId, approved)).rejects.toThrowError(
        mockPrismaError,
      );
      expect(prisma.requestSong.update).toHaveBeenCalled();
    });
  });

  describe('resetRejectedSong', () => {
    it('should successfully delete a request song by id', async () => {
      const songId = '123';
      (prisma.requestSong.delete as jest.Mock).mockResolvedValue(undefined);

      await songService.resetRejectedSong(songId);

      expect(prisma.requestSong.delete as jest.Mock).toHaveBeenCalledTimes(1);
      expect(prisma.requestSong.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: +songId },
      });
    });

    it('should throw an error if prisma.requestSong.delete fails', async () => {
      const songId = '123';
      const mockPrismaError = new Error('Prisma delete error');
      (prisma.requestSong.delete as jest.Mock).mockRejectedValue(mockPrismaError);

      await expect(songService.resetRejectedSong(songId)).rejects.toThrowError(mockPrismaError);

      expect(prisma.requestSong.delete as jest.Mock).toHaveBeenCalledTimes(1);
      expect(prisma.requestSong.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: +songId },
      });
    });
  });
});
