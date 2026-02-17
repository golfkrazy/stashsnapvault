import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./LandingPage.css"; // Reuse Landing Page styles for consistency

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <div className="landing-container">
                {/* Hero / Content Section */}
                <section className="hero-section" style={{ minHeight: '80vh', justifyContent: 'center' }}>

                    <div className="hero-badge" style={{ borderColor: 'var(--accent-pink)', color: 'var(--accent-pink)', background: 'rgba(236, 72, 153, 0.1)' }}>
                        Security Alert
                    </div>

                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                        <img
                            src="/ssv_brand_logo.png"
                            alt="StashSnap Vault Logo"
                            style={{
                                height: '160px',
                                width: 'auto',
                                mixBlendMode: 'screen',
                                filter: 'drop-shadow(0 0 15px rgba(0, 198, 255, 0.4))'
                            }}
                        />
                    </div>

                    <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #FF6B6B 0%, #EC4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'block',
                            marginBottom: '0.5rem'
                        }}>
                            403
                        </span>
                        Access Denied
                    </h1>

                    <p className="hero-subtitle" style={{ maxWidth: '600px' }}>
                        You do not have the required permissions to view this secure vault area.
                        Please return to safety.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                        <button
                            onClick={() => navigate(-1)}
                            className="cta-button secondary-cta"
                            style={{
                                padding: '0.6rem 2rem',
                                fontSize: '0.9rem',
                                minWidth: '150px'
                            }}
                        >
                            ← Go Back
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="brand-footer">
                    <div className="footer-logo">
                        <img src="/logo.svg" alt="Logo" style={{ height: '30px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>StashSnap Vault</span>
                        </div>
                    </div>
                    <div className="footer-links">
                        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                            &copy; 2026 StashSnap Vault Security.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
