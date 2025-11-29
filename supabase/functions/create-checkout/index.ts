// Supabase Edge Function for creating Stripe checkout sessions
// This integrates with RevenueCat for subscription management
//
// To deploy:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Login: supabase login
// 3. Link project: supabase link --project-ref your-project-ref
// 4. Set secrets: supabase secrets set STRIPE_SECRET_KEY=sk_... REVENUECAT_API_KEY=rcb_...
// 5. Deploy: supabase functions deploy create-checkout

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const REVENUECAT_API_KEY = Deno.env.get('REVENUECAT_API_KEY') || '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

interface CheckoutRequest {
  userId: string;
  planId: string; // 'invo_maker_pro' or 'invo_maker_gold'
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

// Map plan IDs to Stripe price IDs and RevenueCat entitlements
const PLAN_CONFIG: Record<string, { stripePriceId: string; entitlement: string }> = {
  invo_maker_pro: {
    stripePriceId: Deno.env.get('STRIPE_PRICE_ID_PRO') || '', // Set this in your .env
    entitlement: 'pro',
  },
  invo_maker_gold: {
    stripePriceId: Deno.env.get('STRIPE_PRICE_ID_GOLD') || '', // Set this in your .env
    entitlement: 'gold',
  },
};

serve(async (req) => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { planId, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    if (!planId || !PLAN_CONFIG[planId]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const planConfig = PLAN_CONFIG[planId];
    const stripePriceId = planConfig.stripePriceId;

    if (!stripePriceId) {
      return new Response(
        JSON.stringify({ error: `Stripe price ID not configured for ${planId}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId: string;

    // Check if user already has a Stripe customer ID stored
    const { data: existingCustomer } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const stripeResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: user.email || '',
          metadata: JSON.stringify({ supabase_user_id: user.id }),
        }),
      });

      if (!stripeResponse.ok) {
        throw new Error('Failed to create Stripe customer');
      }

      const stripeCustomer = await stripeResponse.json();
      stripeCustomerId = stripeCustomer.id;

      // Store Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Create or update RevenueCat customer
    if (REVENUECAT_API_KEY) {
      try {
        await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            app_user_id: user.id,
            email: user.email,
          }),
        });
      } catch (error) {
        // Continue even if RevenueCat update fails
        console.error('RevenueCat customer creation failed:', error);
      }
    }

    // Create Stripe Checkout Session
    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: stripeCustomerId,
        payment_method_types: 'card',
        line_items: JSON.stringify([
          {
            price: stripePriceId,
            quantity: 1,
          },
        ]),
        mode: 'subscription',
        success_url: successUrl || `${req.headers.get('origin') || 'http://localhost:5173'}/settings?subscription=success`,
        cancel_url: cancelUrl || `${req.headers.get('origin') || 'http://localhost:5173'}/settings?subscription=cancelled`,
        metadata: JSON.stringify({
          supabase_user_id: user.id,
          plan_id: planId,
          entitlement: planConfig.entitlement,
        }),
        subscription_data: {
          metadata: JSON.stringify({
            supabase_user_id: user.id,
            plan_id: planId,
            entitlement: planConfig.entitlement,
          }),
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.text();
      throw new Error(`Stripe checkout failed: ${error}`);
    }

    const checkoutSession = await checkoutResponse.json();

    return new Response(
      JSON.stringify({ url: checkoutSession.url, sessionId: checkoutSession.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

