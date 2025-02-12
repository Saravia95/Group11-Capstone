import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import songRoutes from './routes/songRoutes';
import { stripe } from './config/stripe';
import Stripe from 'stripe';
import { supabase } from './config/supabase';

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
    credentials: true, // Ewnable this if using cookies or authentication headers
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

      //  console.log('STRIPE WEBHOOK CALLED!', event);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed: ${(err as Error).message}`);
      res.sendStatus(400);
      return;
    }

    const dataObject = event.data.object as Stripe.Subscription; // Cast to specific Stripe type if needed

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        const subscription = dataObject;

        const hasActiveSubcription = ['active', 'trialing'].includes(
          subscription.status.toLowerCase(),
        )
          ? true
          : false;

        const customer = await stripe.customers.retrieve(subscription.customer as string);

        let customerUserId =
          !customer.deleted && typeof customer.metadata?.userId === 'string'
            ? customer.metadata.userId
            : null;

        const { error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single(); // Get only one row

        if (error && error.code === 'PGRST116') {
          const {} = await supabase.from('subscriptions').insert([
            {
              user_id: customerUserId,
              membership_status: false,
              stripe_customer_id: customer.id,
              stripe_subscription_id: subscription.id,
              stripe_subscription_status: hasActiveSubcription ? 'active' : 'inactive',
            },
          ]);
        }

        const {} = await supabase
          .from('subscriptions')
          .update([
            {
              start_date: hasActiveSubcription
                ? new Date(subscription.current_period_start * 1000).toISOString()
                : null,
              renewal_date: hasActiveSubcription
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
              membership_status: hasActiveSubcription ? true : false,
              billing_rate: hasActiveSubcription
                ? subscription.items.data[0].price.unit_amount
                : 0.0,
              stripe_customer_id: subscription.customer,
              stripe_subscription_id: subscription.id,
              stripe_subscription_status: hasActiveSubcription ? 'active' : 'inactive',
            },
          ])
          .eq('stripe_subscription_id', subscription.id)
          .select('*')
          .single();

        break;

      case 'customer.subscription.deleted':
        console.log('⚠️ Subscription Deleted:', dataObject);

        break;
      case 'invoice.finalized':
        console.log('📜 Invoice Finalized:', dataObject);
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
