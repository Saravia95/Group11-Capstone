import dotenv from 'dotenv';

dotenv.config();

export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
