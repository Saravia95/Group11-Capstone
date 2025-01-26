import { AuthService } from '../services/authService';
import { SignInInputDto, SignUpInputDto } from '../types/auth';
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

      res.status(201).json({
        message: 'Login successful',
        session,
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}
