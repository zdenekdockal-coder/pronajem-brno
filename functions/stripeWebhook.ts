import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';

Deno.serve(async (req) => {
  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) {
      return Response.json({ error: 'Stripe není nakonfigurován' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;
    
    if (webhookSecret && sig) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
      } catch (err) {
        return Response.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    const base44 = createClientFromRequest(req);
    const client = base44.asServiceRole;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const booking_id = session.metadata?.booking_id;

      if (booking_id && session.payment_status === 'paid') {
        // Aktualizuj rezervaci
        await client.entities.Booking.update(booking_id, {
          status: 'potvrzeno',
          stripe_payment_intent_id: session.payment_intent as string,
          paid_at: new Date().toISOString(),
        });

        // Načti rezervaci pro email
        const booking = await client.entities.Booking.get(booking_id);
        
        // Načti admin email z nastavení
        const settings = await client.entities.AdminSettings.filter({ key: 'admin_email' });
        const adminEmail = settings[0]?.value || 'admin@example.com';

        // Odešli emaily přes Base44
        if (booking?.customer_email) {
          const startDate = new Date(booking.start_datetime).toLocaleDateString('cs-CZ', { 
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
          });
          const endDate = new Date(booking.end_datetime).toLocaleDateString('cs-CZ', { 
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
          });

          // Email zákazníkovi
          await fetch('https://api.base44.com/api/apps/' + Deno.env.get('BASE44_APP_ID') + '/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_TOKEN')}`,
            },
            body: JSON.stringify({
              to: booking.customer_email,
              subject: `Potvrzení rezervace č. ${booking.booking_number} — Mercedes-Benz C 220 d`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 12px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #d4af37; font-size: 28px; margin: 0;">✓ Rezervace potvrzena</h1>
                    <p style="color: #999; margin-top: 8px;">Platba byla úspěšně přijata</p>
                  </div>
                  <div style="background: #1a1a1a; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #d4af37;">
                    <p style="margin: 0 0 8px 0;">Vážený/á <strong>${booking.customer_first_name} ${booking.customer_last_name}</strong>,</p>
                    <p style="color: #ccc; margin: 0;">Vaše rezervace Mercedes-Benz C 220 d AMG byla úspěšně potvrzena.</p>
                  </div>
                  <div style="background: #1a1a1a; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                    <h3 style="color: #d4af37; margin-top: 0;">📋 Detail rezervace</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr><td style="color: #999; padding: 6px 0;">Číslo rezervace:</td><td style="font-weight: bold;">${booking.booking_number}</td></tr>
                      <tr><td style="color: #999; padding: 6px 0;">Začátek:</td><td>${startDate}</td></tr>
                      <tr><td style="color: #999; padding: 6px 0;">Konec:</td><td>${endDate}</td></tr>
                      <tr><td style="color: #999; padding: 6px 0;">Místo předání:</td><td>${booking.pickup_location}</td></tr>
                      <tr><td style="color: #999; padding: 6px 0;">Místo vrácení:</td><td>${booking.return_location}</td></tr>
                      <tr><td style="color: #999; padding: 6px 0;">Uhrazená cena:</td><td style="color: #d4af37; font-weight: bold; font-size: 18px;">${booking.total_price?.toLocaleString('cs-CZ')} Kč</td></tr>
                    </table>
                  </div>
                  <div style="background: #1a1a1a; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                    <h3 style="color: #d4af37; margin-top: 0;">📌 Důležité informace</h3>
                    <ol style="color: #ccc; padding-left: 20px; line-height: 1.8;">
                      <li>Před předáním vás budeme kontaktovat pro upřesnění místa a času.</li>
                      <li>Přineste platný <strong>občanský průkaz</strong> a <strong>řidičský průkaz</strong>.</li>
                      <li>Auto bude předáno s <strong>plnou nádrží</strong>.</li>
                      <li>Auto vraťte prosím také s <strong>plnou nádrží</strong>.</li>
                      <li>V ceně je zahrnuto <strong>200 km/den</strong>. Nadlimitní km: 8 Kč/km.</li>
                      <li>Při předání vytvoříme předávací protokol a fotodokumentaci.</li>
                    </ol>
                  </div>
                  <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
                    <p>V případě dotazů nás kontaktujte na <a href="mailto:info@example.com" style="color: #d4af37;">info@example.com</a></p>
                    <p>Tel: +420 XXX XXX XXX</p>
                  </div>
                </div>
              `,
            }),
          }).catch(e => console.log('Email error:', e));

          // Email adminovi
          await fetch('https://api.base44.com/api/apps/' + Deno.env.get('BASE44_APP_ID') + '/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_TOKEN')}`,
            },
            body: JSON.stringify({
              to: adminEmail,
              subject: `🚗 Nová rezervace č. ${booking.booking_number} — ${booking.customer_first_name} ${booking.customer_last_name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>🚗 Nová potvrzená rezervace</h2>
                  <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                    <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Číslo rezervace</td><td style="padding: 8px;">${booking.booking_number}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Zákazník</td><td style="padding: 8px;">${booking.customer_first_name} ${booking.customer_last_name}</td></tr>
                    <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">E-mail</td><td style="padding: 8px;">${booking.customer_email}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Telefon</td><td style="padding: 8px;">${booking.customer_phone}</td></tr>
                    <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Začátek</td><td style="padding: 8px;">${startDate}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Konec</td><td style="padding: 8px;">${endDate}</td></tr>
                    <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Místo předání</td><td style="padding: 8px;">${booking.pickup_location}${booking.pickup_location_detail ? ' — ' + booking.pickup_location_detail : ''}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Místo vrácení</td><td style="padding: 8px;">${booking.return_location}${booking.return_location_detail ? ' — ' + booking.return_location_detail : ''}</td></tr>
                    <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Uhrazená cena</td><td style="padding: 8px; color: green; font-weight: bold;">${booking.total_price?.toLocaleString('cs-CZ')} Kč</td></tr>
                    ${booking.abroad_travel ? `<tr style="background: #fff3cd;"><td style="padding: 8px; font-weight: bold;">⚠️ Zahraničí</td><td style="padding: 8px;">ANO — ${booking.abroad_countries}</td></tr>` : ''}
                    ${booking.animal_transport ? `<tr style="background: #fff3cd;"><td style="padding: 8px; font-weight: bold;">⚠️ Zvíře</td><td style="padding: 8px;">ANO — ${booking.animal_detail}</td></tr>` : ''}
                  </table>
                </div>
              `,
            }),
          }).catch(e => console.log('Admin email error:', e));
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
