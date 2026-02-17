import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TIERS, SUBSCRIPTION_TIERS } from '../constants/tiers';
import { useStripeCheckout } from '../services/stripe';
import { useSession } from '../context/SessionContext';

const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const { session } = useSession();
    const { handleCheckout } = useStripeCheckout();
    const currentTier = (session as any)?.profile?.subscription_tier || SUBSCRIPTION_TIERS.FREE;

    return (
        <main style={{ marginTop: '5vh', paddingBottom: '2rem' }}>
            <section className="main-container">
                <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 className="header-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Upgrade Your Vault</h1>
                    <p style={{ color: 'var(--text-medium)', fontSize: '1.1rem' }}>
                        Unlock the full power of StashSnap with AI Search and Unlimited Items.
                    </p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}>
                    {/* Free Tier */}
                    <div style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-ui)',
                        borderRadius: '16px',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{TIERS[SUBSCRIPTION_TIERS.FREE].name}</h2>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{TIERS[SUBSCRIPTION_TIERS.FREE].price}</span>
                            <span style={{ color: 'var(--text-medium)' }}>/forever</span>
                        </div>

                        <div style={{ flex: 1 }}>
                            {TIERS[SUBSCRIPTION_TIERS.FREE].features.map((feature, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    gap: '0.8rem',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                    color: feature.included ? 'white' : 'var(--text-medium)',
                                    opacity: feature.included ? 1 : 0.5
                                }}>
                                    <span>{feature.included ? '✅' : '❌'}</span>
                                    <span>{feature.name}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={true}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: 'var(--text-medium)',
                                cursor: 'default'
                            }}
                        >
                            Included
                        </button>
                    </div>

                    {/* Premium Tier */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                        border: '1px solid var(--accent-electric-blue)',
                        borderRadius: '16px',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        position: 'relative',
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '2rem',
                            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                            color: 'black',
                            padding: '0.2rem 1rem',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 10px rgba(255, 215, 0, 0.4)'
                        }}>
                            RECOMMENDED
                        </div>

                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{TIERS[SUBSCRIPTION_TIERS.PREMIUM].name}</h2>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{TIERS[SUBSCRIPTION_TIERS.PREMIUM].price}</span>
                            <span style={{ color: 'var(--text-medium)' }}>/month</span>
                        </div>

                        <div style={{ flex: 1 }}>
                            {TIERS[SUBSCRIPTION_TIERS.PREMIUM].features.map((feature, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    gap: '0.8rem',
                                    alignItems: 'center',
                                    marginBottom: '1rem'
                                }}>
                                    <span>✅</span>
                                    <div>
                                        <span style={{ display: 'block' }}>{feature.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-medium)' }}>{feature.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={async () => {
                                if (currentTier !== 'premium') {
                                    // Handle Upgrade
                                    await handleCheckout(TIERS[SUBSCRIPTION_TIERS.PREMIUM].priceId!);
                                }
                            }}
                            className="btn"
                            disabled={currentTier === 'premium'}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '8px',
                                background: currentTier === 'premium' ? 'rgba(34, 197, 94, 0.2)' : 'var(--accent-electric-blue)',
                                border: 'none',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: currentTier === 'premium' ? 'default' : 'pointer'
                            }}
                        >
                            {currentTier === 'premium' ? 'Active Plan' : 'Upgrade to Ultimate'}
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-medium)',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Maybe later
                    </button>
                </div>
            </section>
        </main>
    );
};

export default PricingPage;
