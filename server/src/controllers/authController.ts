import { AuthService } from '../services/authService';
import {
  RequestPasswordResetInputDto,
  ResetPasswordInputDto,
  SignInInputDto,
  SignUpInputDto,
  verifyQRCodeInputDto,
} from '../types/auth';
import { Request, Response } from 'express';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signUp(req: Request, res: Response) {
    try {
      const newUser: SignUpInputDto = req.body;
      const user = await this.authService.signUp(newUser);

      res.status(201).json({
        message: 'User registered successfully',
        email: user?.email,
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const user: SignInInputDto = req.body;
      const session = await this.authService.signIn(user);

      res.status(201).json(session);
    } catch (error) {
      res.status(401).json({ success: false, error: (error as Error).message });
    }
  }

  async signOut(req: Request, res: Response) {
    try {
      await this.authService.signOut();

      res.status(201).json({
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const email: RequestPasswordResetInputDto = req.body;

      await this.authService.requestPasswordReset(email);

      res.status(201).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const resetRequest: ResetPasswordInputDto = req.body;

      await this.authService.resetPassword(resetRequest);

      res.status(201).json({ message: 'reset successful' });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async verifyQRCode(req: Request, res: Response) {
    try {
      const verifyRequest: verifyQRCodeInputDto = req.body;
      const session = await this.authService.verifyQRCode(verifyRequest);

      res.status(201).json({ success: true, session });
    } catch (error) {
      res.status(401).json({ success: false, error: (error as Error).message });
    }
  }
}
