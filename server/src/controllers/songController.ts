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
}
