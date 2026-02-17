export const SUBSCRIPTION_TIERS = {
    FREE: 'free',
    PREMIUM: 'premium'
} as const;

export interface TierFeature {
    name: string;
    description: string;
    included: boolean;
}

export interface SubscriptionTier {
    id: string;
    name: string;
    price: string;
    priceId?: string; // Stripe Price ID
    features: TierFeature[];
    limit: number; // Item limit
    color: string;
    cta: string;
}

export const TIERS: Record<string, SubscriptionTier> = {
    [SUBSCRIPTION_TIERS.FREE]: {
        id: SUBSCRIPTION_TIERS.FREE,
        name: 'StashSnap Basic',
        price: '$0',
        features: [
            { name: '50 Item Limit', description: 'Store up to 50 items', included: true },
            { name: 'Basic Search', description: 'Keyword search', included: true },
            { name: 'Standard Support', description: 'Email support', included: true },
            { name: 'AI Semantic Search', description: 'Search by meaning', included: false },
            { name: 'Unlimited Vault', description: 'Store unlimited items', included: false },
        ],
        limit: 50,
        color: 'var(--text-light)',
        cta: 'Current Plan'
    },
    [SUBSCRIPTION_TIERS.PREMIUM]: {
        id: SUBSCRIPTION_TIERS.PREMIUM,
        name: 'Ultimate Vault',
        price: '$9.99',
        priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
        features: [
            { name: 'Unlimited Items', description: 'No storage limits', included: true },
            { name: 'AI Semantic Search', description: 'Find items by description', included: true },
            { name: 'Priority Support', description: '24/7 support access', included: true },
            { name: 'Expiration Alerts', description: 'Get notified before items expire', included: true },
            { name: 'Document Tracking', description: 'Track warranties and insurance', included: true },
        ],
        limit: Infinity,
        color: '#FFD700', // Gold
        cta: 'Upgrade Now'
    }
};
