import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { session_id, booking_id } = body;

    if (!session_id && !booking_id) {
      return Response.json({ error: 'Chybí session_id nebo booking_id' }, { status: 400 });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'Stripe není nakonfigurován' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const base44 = createClientFromRequest(req);
    const client = base44.asServiceRole;

    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === 'paid') {
        const bid = session.metadata?.booking_id || booking_id;
        if (bid) {
          await client.entities.Booking.update(bid, {
            status: 'potvrzeno',
            stripe_payment_intent_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          });
        }
        return Response.json({ paid: true, status: 'potvrzeno', booking_id: bid });
      }
      return Response.json({ paid: false, status: session.payment_status });
    }

    return Response.json({ paid: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
