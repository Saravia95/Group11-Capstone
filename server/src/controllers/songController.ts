import { Request, Response } from 'express';
import { SongService } from '../services/songService';

export class SongController {
  private songService: SongService;

  constructor() {
    this.songService = SongService.getInstance();
  }

  async searchSongs(req: Request, res: Response) {
    try {
      const { filter, searchTerm } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Please enter a search term.',
        });
      }

      const songs = await this.songService.searchSongs(filter as string, searchTerm);

      res.json({ success: true, data: songs });
    } catch (error) {
      console.error('fail to search songs:', error);
      res.status(500).json({
        success: false,
        message: 'fail to search songs.',
      });
    }
  }

  async requestSong(req: Request, res: Response) {
    try {
      const {
        song: { id: songId },
        userId,
        ownerId,
      } = req.body;

      if (!userId || !ownerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID or Owner ID missing',
        });
      }

      const song = await this.songService.requestSong(songId, userId, ownerId);

      res.json({ success: true, data: song });
    } catch (error) {
      console.error('fail to request song:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request song',
      });
    }
  }

  async reviewSong(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      if (typeof approved !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid approval status.',
        });
      }

      await this.songService.reviewSong(id, approved);

      res.json({ success: true });
    } catch (error) {
      console.error('fail to review song:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review song',
      });
    }
  }
}
