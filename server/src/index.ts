import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import songRoutes from './routes/songRoutes';
import { stripe } from './config/stripe';

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

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    let event;
    console.log('STRIPE WEBHOOK CALLED!');
    try {
      const sig = req.headers['stripe-signature'] as string | undefined;
      if (!sig) {
        throw new Error('Missing Stripe-Signature header');
      }

      event = stripe.webhooks.constructEvent(
        req.body as Buffer, // Ensure req.body is treated as a Buffer
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      console.log('STRIPE WEBHOOK CALLED!', event);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed: ${(err as Error).message}`);
      res.sendStatus(400);
      return;
    }

    const dataObject = event.data.object; // Cast to specific Stripe type if needed

    switch (event.type) {
      case 'invoice.payment_succeeded':
        console.log('✅ Invoice Payment Succeeded:', dataObject);
        break;
      case 'invoice.payment_failed':
        console.log('❌ Invoice Payment Failed:', dataObject);
        break;
      case 'invoice.finalized':
        console.log('📜 Invoice Finalized:', dataObject);
        break;
      case 'customer.subscription.deleted':
        console.log('⚠️ Subscription Deleted:', dataObject);
        break;
      case 'customer.subscription.trial_will_end':
        console.log('⏳ Trial Will End Soon:', dataObject);
        break;
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.sendStatus(200);
  },
);

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/song', songRoutes);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

export default app;
