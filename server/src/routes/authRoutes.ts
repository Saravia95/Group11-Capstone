import express, { Request, Response } from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();
const authController = new AuthController();

router.post('/register-user', (req: Request, res: Response) => authController.signUp(req, res));
router.post('/login', (req: Request, res: Response) => authController.signIn(req, res));
router.post('/logout', (req: Request, res: Response) => authController.signOut(req, res));
router.post('/request-password-reset', (req: Request, res: Response) =>
  authController.requestPasswordReset(req, res),
);
router.post('/reset-password', (req: Request, res: Response) =>
  authController.resetPassword(req, res),
);
router.post('/verify-qr', (req: Request, res: Response) => authController.verifyQRCode(req, res));
router.post('/process-membership-purchase', (req: Request, res: Response) => authController.processMembershipPurchaseRequest(req, res));
router.post('/fetch-membership', (req: Request, res: Response) => authController.fetchMembership(req, res));


export default router;
