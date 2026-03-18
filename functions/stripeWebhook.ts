import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event;
    if (webhookSecret && sig) {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata?.user_email || session.customer_email;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (userEmail) {
        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (users.length > 0) {
          await base44.asServiceRole.auth.updateUser(users[0].id, {
            is_premium: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          });
        }
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        const customers = await stripe.customers.retrieve(subscription.customer);
        const userEmail = customers.email;
        if (userEmail) {
          const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
          if (users.length > 0) {
            await base44.asServiceRole.auth.updateUser(users[0].id, { is_premium: false });
          }
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
});