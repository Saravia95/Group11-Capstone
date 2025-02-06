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
      const session = await this.authService.signUp(newUser);

      res.status(201).json(session);
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const user: SignInInputDto = req.body;
      const session = await this.authService.signIn(user);

      res.status(201).json(session);
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async signOut(req: Request, res: Response) {
    try {
      const result = await this.authService.signOut();

      res.status(201).json(result);
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async requestPasswordChange(req: Request, res: Response) {
    try {
      const email: RequestPasswordResetInputDto = req.body;
      const result = await this.authService.requestPasswordChange(email);

      res.status(201).json(result);
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const resetRequest: ResetPasswordInputDto = req.body;
      const result = await this.authService.changePassword(resetRequest);

      res.status(201).json(result);
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async verifyQRCode(req: Request, res: Response) {
    try {
      const verifyRequest: verifyQRCodeInputDto = req.body;
      const session = await this.authService.verifyQRCode(verifyRequest);

      res.status(201).json(session);
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async signInWithGoogle(req: Request, res: Response) {
    try {
      const session = await this.authService.signInWithGoogle();
      res.status(201).json(session);
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async googleCallback(req: Request, res: Response) {
    try {
      const session = req.body.session;
      const verifiedSession = await this.authService.googleCallback(session);

      res.status(201).json(verifiedSession);
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async spotifyLogin(req: Request, res: Response) {
    try {
      const redirectUrl = await this.authService.spotifyLogin();

      res.status(201).json({ success: true, redirectUrl });
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }

  async spotifyCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      const { access_token, refresh_token, expires_in } =
        await this.authService.spotifyCallback(code);

      res.redirect(
        `${process.env.CLIENT_URL}/spotify-callback/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`,
      );
    } catch (error) {
      res.status(401).json({ success: false, message: (error as Error).message });
    }
  }
}
