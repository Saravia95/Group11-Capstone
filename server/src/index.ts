import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// CORS Configuration
app.use(
  cors({
    origin: 'http://localhost:5173', // Replace with your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Enable this if using cookies or authentication headers
  }),
);

app.use(express.json());

app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

export default app;
