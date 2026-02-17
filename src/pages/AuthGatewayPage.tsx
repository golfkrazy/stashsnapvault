import { Link } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";
import { BrandHeader, BrandFooter } from "../components/BrandComponents";

const AuthGatewayPage = () => {
    const { session, profile } = useSession();
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <BrandHeader />
            <section className="main-container" style={{ flex: 1, margin: '2rem auto' }}>

                <p style={{ marginBottom: '1.5rem', color: 'var(--text-medium)' }}>
                    {session ? `Welcome back, ${session.user.email}` : "Secure your treasures, one snap at a time."}
                </p>

                {session ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {profile?.role?.toLowerCase() === 'admin' && (
                            <Link to="/admin" className="btn" style={{ background: 'var(--accent-cyan-highlight)', color: 'var(--primary-deep-navy)' }}>
                                Admin Command Center 🛡️
                            </Link>
                        )}
                        <Link to="/profile" className="btn" style={{ background: 'var(--accent-purple-glow)', borderColor: 'var(--accent-pink)' }}>
                            Manage Profile 👤
                        </Link>
                        <button className="btn auth-link" onClick={() => supabase.auth.signOut()}>Sign Out</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Link to="/auth/sign-in" className="btn">Sign In</Link>
                        <Link to="/auth/sign-up" className="btn auth-link">Don't have an account? Sign Up</Link>
                    </div>
                )}

                <div id="divider"></div>

                <Link to="/auth/forgot-password" title="Self-service security" className="btn secondary" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', borderColor: 'var(--accent-purple-glow)' }}>
                    Reset Password 🔑
                </Link>

                <Link to="/protected" className="btn" style={{ background: 'var(--primary-rich-dark)', borderColor: 'var(--border-ui)' }}>
                    Access Vault 🛡️
                </Link>
            </section>
            <BrandFooter />
        </main>
    );
};

export default AuthGatewayPage;
