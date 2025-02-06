import express, { Request, Response } from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();
const authController = new AuthController();

router.post('/register-user', (req: Request, res: Response) => authController.signUp(req, res));
router.post('/login', (req: Request, res: Response) => authController.signIn(req, res));
router.post('/logout', (req: Request, res: Response) => authController.signOut(req, res));

router.post('/request-password-change', (req: Request, res: Response) =>
  authController.requestPasswordChange(req, res),
);
router.post('/change-password', (req: Request, res: Response) =>
  authController.changePassword(req, res),
);
router.post('/verify-qr', (req: Request, res: Response) => authController.verifyQRCode(req, res));
router.post('/google-login', (req: Request, res: Response) =>
  authController.signInWithGoogle(req, res),
);
router.post('/google-callback', (req: Request, res: Response) =>
  authController.googleCallback(req, res),
);
router.get('/spotify-login', (req: Request, res: Response) =>
  authController.spotifyLogin(req, res),
);
router.get('/spotify-callback', (req: Request, res: Response) =>
  authController.spotifyCallback(req, res),
);

export default router;
