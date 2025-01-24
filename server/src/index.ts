import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

//For env File
dotenv.config();

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const app: Application = express();
const port = process.env.PORT || 3000;

// CORS Configuration
app.use(
  cors({
      origin: 'http://localhost:5173', // Replace with your frontend's URL
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
      credentials: true, // Enable this if using cookies or authentication headers
  })
);
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});


app.post('/register-user', async(req: Request, res: Response) => {
  
  const { data, error } = await supabase.auth.signUp({
    email: req.body.email,
    password: req.body.password,
    options: {
      emailRedirectTo: "http://localhost:5173/owner-register-confirmation",
      data:{ display_name:req.body.displayName,
          first_name:req.body.firstName,
          last_name:req.body.lastName,
      } // Additional data to be stored in the user table
    }
  })
  res.send('Registered User: ' + data.user?.email);

});



app.get("/validate-database", async (req:Request, res:Response) => {
 
    // Fetching the first (or only) row from the "database-greetings" table
    const { data, error } = await supabase
      .from("database-greetings")
      .select("greeting-message")
      .single(); // Retrieves one row only

    // Check for errors in the Supabase query

    // Send the fetched row as the response
    res.send(data);
 
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
  // For testing
 //
 
});
