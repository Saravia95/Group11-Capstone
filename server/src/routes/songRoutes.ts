import express, { Request, Response } from 'express';
import { SongController } from '../controllers/songController';

const router = express.Router();
const songController = new SongController();

router.get('/search', async (req: Request, res: Response) => {
  await songController.searchSongs(req, res);
});

router.post('/request', async (req: Request, res: Response) => {
  await songController.requestSong(req, res);
});

router.post('/review/:id', async (req: Request, res: Response) => {
  await songController.reviewSong(req, res);
});

router.post('/reset-rejected/:id', async (req: Request, res: Response) => {
  await songController.resetRejectedSong(req, res);
});
export default router;
