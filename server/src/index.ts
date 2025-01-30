import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import songRoutes from './routes/songRoutes';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Replace with your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Enable this if using cookies or authentication headers
  }),
);

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/song', songRoutes);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

export default app;
