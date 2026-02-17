import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')

    try {
        if (!signature) throw new Error('Missing stripe-signature')

        const body = await req.text()
        const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

        let event
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                endpointSecret!,
                undefined,
                cryptoProvider
            )
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        )

        // Handle the event
        console.log(`Vault Webhook: Received event [${event.type}]`);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const userId = session.metadata?.userId
            console.log(`Vault Webhook: Processing completion for user: ${userId}`);

            if (userId) {
                console.log(`Vault Webhook: Upgrading user ${userId} to premium...`)
                const { data, error } = await supabaseAdmin
                    .from('user_profiles')
                    .update({
                        subscription_tier: 'premium',
                        subscription_status: 'active'
                    })
                    .eq('id', userId)
                    .select();

                if (error) {
                    console.error('Vault Webhook: Database update failed:', error);
                    throw error;
                }
                console.log('Vault Webhook: Successfully updated profile:', data);
            } else {
                console.warn('Vault Webhook: No userId found in session metadata');
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (err) {
        console.error(`Webhook error: ${err.message}`)
        return new Response(`Error: ${err.message}`, { status: 400 })
    }
})
