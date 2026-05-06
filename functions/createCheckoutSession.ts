import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const { booking_id, amount_czk, description, customer_email, success_url, cancel_url } = body;

    if (!booking_id || !amount_czk) {
      return Response.json({ error: 'Chybí povinné parametry' }, { status: 400 });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'Stripe není nakonfigurován' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customer_email,
      line_items: [{
        price_data: {
          currency: 'czk',
          product_data: {
            name: description || 'Pronájem vozidla',
            description: `Rezervace č. ${booking_id}`,
          },
          unit_amount: Math.round(amount_czk * 100),
        },
        quantity: 1,
      }],
      metadata: { booking_id },
      success_url: success_url || `${Deno.env.get('APP_URL') || ''}/platba-uspesna?booking_id=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${Deno.env.get('APP_URL') || ''}/rezervace?cancelled=1`,
      payment_intent_data: {
        metadata: { booking_id },
      },
    });

    // Aktualizuj rezervaci s session ID
    const client = base44.asServiceRole;
    await client.entities.Booking.update(booking_id, {
      stripe_session_id: session.id,
      status: 'ceka_na_platbu',
    });

    return Response.json({ 
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
