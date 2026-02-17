import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            throw new Error('STRIPE_SECRET_KEY is not set in the vault environment.');
        }

        const stripe = new Stripe(stripeKey, {
            httpClient: Stripe.createFetchHttpClient(),
        })

        // 2. Auth Check (Verify calling user)
        const { priceId, userId, email } = await req.json()
        console.log('Vault: Received checkout request for:', { priceId, userId, email });

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        if (!priceId) throw new Error('Price ID is required')

        // 4. Create Stripe Checkout Session
        const origin = req.headers.get('origin') || 'http://localhost:5173'

        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/inventory?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/profile`,
            metadata: {
                userId: user.id
            }
        })

        return new Response(
            JSON.stringify({ sessionId: session.id, url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Checkout session error:', error);
        return new Response(
            JSON.stringify({
                error: error.message || 'An internal error occurred in the vault service',
                details: error instanceof Error ? error.stack : undefined
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
