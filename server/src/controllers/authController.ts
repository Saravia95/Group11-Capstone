import { AuthService } from '../services/authService';
import { SignUpDto } from '../types/auth';
import { Request, Response } from 'express';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signUp(req: Request, res: Response) {
    try {
      const newUser: SignUpDto = req.body;
      const user = await this.authService.signUp(newUser);

      res.status(201).json({
        message: 'User registered successfully',
        email: user?.email,
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}
