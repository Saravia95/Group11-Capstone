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

router.post('/fetch-membership', (req: Request, res: Response) =>
  authController.fetchMembership(req, res),
);

router.post('/cancel-membership', (req: Request, res: Response) =>
  authController.cancelMembership(req, res),
);
router.post('/manage-membership', (req: Request, res: Response) =>
  authController.manageMembership(req, res),
);
router.post('/create-checkout-session', (req: Request, res: Response) =>
  authController.createCheckoutSession(req, res),
);

router.post('/google-login', (req: Request, res: Response) =>
  authController.signInWithGoogle(req, res),
);
router.post('/verify-google-oauth', (req: Request, res: Response) =>
  authController.handleCallback(req, res),
);

export default router;
