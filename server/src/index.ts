import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

//For env File
dotenv.config();

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const app: Application = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
  // For testing
  supabase
    .channel('room-1')
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      console.log('Change received!', payload);
    })
    .subscribe();
});
