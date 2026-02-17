import React from 'react';
import { Link } from 'react-router-dom';

export const BrandHeader: React.FC = () => {
    return (
        <header style={{
            width: '100%',
            opacity: 0.9,
            marginBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div className="landing-container" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.5rem 0'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                    <img src="/logo.svg" alt="StashSnap Vault" style={{ height: '40px', width: 'auto' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>StashSnap Vault</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan-highlight)', fontStyle: 'italic' }}>More Peace of Mind</span>
                    </div>
                </Link>
            </div>
        </header>
    );
};

export const BrandFooter: React.FC = () => {
    return (
        <div style={{ width: '100%', marginTop: 'auto', borderTop: '1px solid var(--border-ui)' }}>
            <div className="landing-container">
                <footer className="brand-footer" style={{ borderTop: 'none' }}>
                    <div className="footer-logo">
                        <img src="/logo.svg" alt="Logo" style={{ height: '40px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'white' }}>StashSnap Vault</span>
                            <span className="footer-motto">More Peace of Mind</span>
                        </div>
                    </div>
                    <div className="footer-links">
                        <p style={{ fontSize: '0.8rem', opacity: 0.6, color: 'var(--text-medium)', margin: 0 }}>
                            &copy; 2026 StashSnap Vault. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

interface BrandErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export const BrandErrorModal: React.FC<BrandErrorModalProps> = ({ isOpen, onClose, title = "Security Alert", message }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}
            onClick={onClose}
        >
            <div
                style={{
                    maxWidth: '450px',
                    width: '100%',
                    background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(236, 72, 153, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative background glow */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-20%',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.4rem 1.2rem',
                        borderRadius: '20px',
                        border: '1px solid var(--accent-pink)',
                        color: 'var(--accent-pink)',
                        background: 'rgba(236, 72, 153, 0.1)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '1.5rem'
                    }}>
                        {title}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <img
                            src="/ssv_brand_logo.png"
                            alt="StashSnap Vault"
                            style={{
                                height: '80px',
                                width: 'auto',
                                mixBlendMode: 'screen',
                                filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.3))'
                            }}
                        />
                    </div>

                    <h2 style={{
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #EC4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Vault Instruction
                    </h2>

                    <p style={{
                        color: 'var(--text-medium)',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        marginBottom: '2rem',
                        opacity: 0.9
                    }}>
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className="cta-button primary-cta"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #FF6B6B 0%, #EC4899 100%)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                        }}
                    >
                        Understood
                    </button>
                </div>
            </div>
        </div>
    );
};
