import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import supabase from '../supabase';

// Initialize Stripe outside component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const useStripeCheckout = () => {
    const navigate = useNavigate();

    const handleCheckout = async (priceId: string, onError?: (message: string) => void) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/auth/sign-in');
                return;
            }

            if (!priceId) {
                console.error('Checkout error: Price ID is missing or undefined.');
                if (onError) onError("The configuration for this vault tier is incomplete (Missing Price ID). Please check your .env.local and restart the server.");
                return;
            }

            console.log('Vault: Initiating checkout for priceId:', priceId);

            // Call Supabase Edge Function to create Checkout Session
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId,
                    userId: session.user.id,
                    email: session.user.email
                }
            });

            if (error) {
                console.error('Edge function error:', error);
                throw error; // Preserve original error with context/response
            }

            if (data?.url) {
                window.location.href = data.url;
                return;
            }

            // Fallback for older sessions if needed (though we should favor url redirect)
            const stripe = await stripePromise;
            if (!stripe) throw new Error('Stripe failed to initialize');

            const { error: stripeError } = await (stripe as any).redirectToCheckout({
                sessionId: data.sessionId
            });

            if (stripeError) throw stripeError;

        } catch (error: any) {
            console.error('ULTRA DEBUG - Full Checkout Error Object:', error);

            let message = 'An unexpected vault communication error occurred.';

            if (error.message) {
                message = error.message;
            }

            // Check for Supabase Edge Function detailed error
            // In the Supabase SDK, error.context IS the Response object directly for FunctionsHttpError
            const response = error.context?.response || error.context;

            if (response && typeof response.clone === 'function') {
                try {
                    const clonedResponse = response.clone();
                    const text = await clonedResponse.text();
                    console.log('ULTRA DEBUG - Response text raw:', text);

                    try {
                        const data = JSON.parse(text);
                        if (data.error) {
                            message = data.error;
                        } else {
                            message = `Status ${response.status}: ${text.substring(0, 100)}`;
                        }
                    } catch (jsonErr) {
                        message = `Status ${response.status}: ${text || response.statusText || 'Bad Response'}`;
                    }
                } catch (readErr) {
                    message = `Status ${response.status || 'Unknown'}: (Could not read response)`;
                }
            } else if (error.status) {
                message = `Vault Code ${error.status}: ${error.message}`;
            }

            const finalMessage = `[VAULT_REPORT] ${message}`;

            if (onError) {
                onError(finalMessage);
            } else {
                alert(finalMessage);
            }
        }
    };

    return { handleCheckout };
};
