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

  async getRecommendedSongs(req: Request, res: Response) {
    try {
      const songs = await this.songService.getRecommendedSongs();

      res.json({ success: true, data: songs });
    } catch (error) {
      console.error('fail to get recommended songs:', error);
      res.status(500).json({
        success: false,
        message: 'fail to get recommended songs.',
      });
    }
  }

  async requestSong(req: Request, res: Response) {
    try {
      const {
        song: { id: songId },
        customerId,
        ownerId,
      } = req.body;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Owner ID missing',
        });
      }

      const response = await this.songService.requestSong(songId, customerId, ownerId);

      res.status(201).json(response);
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

  async resetRejectedSong(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await this.songService.resetRejectedSong(id);

      res.json({ success: true });
    } catch (error) {
      console.error('fail to reset rejected song:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset rejected song',
      });
    }
  }

  async setPlaying(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await this.songService.setPlaying(id);

      res.json({ success: true });
    } catch (error) {
      console.error('fail to set playing song:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set playing song',
      });
    }
  }
}
