import React from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";
import "./LandingPage.css";
import { BrandHeader } from "../components/BrandComponents";

const LandingPage: React.FC = () => {
    const { session, profile, loading } = useSession();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    if (loading) return null;


    return (
        <div className="landing-page">
            <BrandHeader />
            <div className="landing-container">
                {/* Hero Section */}
                <section className="hero-section" style={{ paddingTop: '2rem' }}>
                    {session && (
                        <div className="user-status-badge">
                            <span className="user-email-text">Signed in as <strong>{profile?.first_name || session.user.email}</strong></span>
                            <div className="user-actions">
                                <Link
                                    to="/profile"
                                    className="profile-link-mini"
                                >
                                    My Profile
                                </Link>
                                <button onClick={handleSignOut} className="sign-out-mini">Sign Out</button>
                            </div>
                        </div>
                    )}
                    <div className="hero-badge">Solving the 2 AM Mystery</div>
                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                        <img
                            src="/logo.svg"
                            alt="StashSnap Vault Logo"
                            style={{ height: '180px', width: 'auto', filter: 'drop-shadow(0 0 15px rgba(75, 195, 255, 0.4))' }}
                        />
                    </div>

                    <h1 className="hero-title">
                        Finally, Remember Exactly <br />
                        Where You Put Everything.
                    </h1>

                    <p className="hero-subtitle">
                        Save hours of frantic searches 🕒 <br />
                        Avoid the guilt, frustration 😰 and emotional exhaustion 😔 <br />
                        From expensive jewelry to critical documents, StashSnap Vault is your premium digital fortress that remembers the details so you don't have to.
                    </p>

                    {session ? (
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                            <Link to="/inventory" className="cta-button">
                                Enter My Vault 🛡️
                            </Link>
                            {profile?.role?.toLowerCase() === 'admin' && (
                                <Link to="/welcome" className="cta-button secondary-cta">
                                    Command Center ⚔️
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link to="/welcome" className="cta-button">
                                Start Using StashSnap Vault
                            </Link>
                        </div>
                    )}
                </section>

                {/* Problem Section */}
                <section className="problem-section">
                    <div className="section-label">Universal Peace of Mind</div>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon">🗝️</div>
                            <h3>The Jewelry Hider</h3>
                            <p style={{ fontWeight: 600, color: 'var(--accent-cyan-highlight)', marginBottom: '0.5rem' }}>
                                Don't call-in sick to the party 🥳.
                            </p>
                            <p>
                                You found the perfect "safe place" for your expensive jewelry.
                                Now, three months later, that place is so safe even you can't find it.
                                StashSnap Vault remembers for you.
                            </p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">📜</div>
                            <h3>Critical Documents</h3>
                            <p style={{ fontWeight: 600, color: 'var(--accent-cyan-highlight)', marginBottom: '0.5rem' }}>
                                Don't cancel that bucket list trip ✈️.
                            </p>
                            <p>
                                Passports, birth certificates, and house deeds always seem to disappear
                                right when you're in a rush. Document them once, find them forever.
                            </p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon">📦</div>
                            <h3>Household Mysteries</h3>
                            <p>
                                Hiding things in the yard, basement or simply stashing winter gear
                                in the attic. Stop the "Where is it?" frustration before it starts.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer Footer */}
                <footer className="brand-footer">
                    <div className="footer-logo">
                        <img src="/logo.svg" alt="Logo" style={{ height: '40px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem' }}>StashSnap Vault</span>
                            <span className="footer-motto">More Peace of Mind</span>
                        </div>
                    </div>
                    <div className="footer-links">
                        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                            &copy; 2026 StashSnap Vault. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
