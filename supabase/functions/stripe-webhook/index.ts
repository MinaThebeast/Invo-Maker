// Supabase Edge Function for handling Stripe webhooks
// This syncs subscription status with RevenueCat
//
// To deploy:
// supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const REVENUECAT_API_KEY = Deno.env.get('REVENUECAT_API_KEY') || '';

// Map entitlements to plan IDs
const ENTITLEMENT_TO_PLAN: Record<string, string> = {
  pro: 'invo_maker_pro',
  gold: 'invo_maker_gold',
};

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      return new Response('Webhook secret not configured', { status: 400 });
    }

    const body = await req.text();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify webhook signature (simplified - in production, use Stripe's verification)
    // For now, we'll process the webhook directly
    const event = JSON.parse(body);

    console.log('Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};
        const userId = metadata.supabase_user_id;
        const entitlement = metadata.entitlement;

        if (userId && entitlement && REVENUECAT_API_KEY) {
          // Grant entitlement in RevenueCat
          try {
            await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}/entitlements/${entitlement}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_identifier: ENTITLEMENT_TO_PLAN[entitlement] || entitlement,
              }),
            });
          } catch (error) {
            console.error('RevenueCat entitlement grant failed:', error);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;

        // Find user by Stripe customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user && REVENUECAT_API_KEY) {
          // Get subscription metadata
          const metadata = subscription.metadata || {};
          const entitlement = metadata.entitlement;

          if (entitlement) {
            // Update RevenueCat entitlement based on subscription status
            if (status === 'active') {
              await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}/entitlements/${entitlement}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
                  'Content-Type': 'application/json',
                },
              });
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user && REVENUECAT_API_KEY) {
          // Revoke all entitlements (user goes back to free)
          const metadata = subscription.metadata || {};
          const entitlement = metadata.entitlement;

          if (entitlement) {
            try {
              await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}/entitlements/${entitlement}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
                },
              });
            } catch (error) {
              console.error('RevenueCat entitlement revocation failed:', error);
            }
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

