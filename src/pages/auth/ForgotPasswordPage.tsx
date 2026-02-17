import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../../supabase';
import { BrandHeader, BrandFooter } from '../../components/BrandComponents';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            setStatus(`Error: ${error.message}`);
        } else {
            setStatus('Password reset email sent! Please check your inbox.');
        }
        setLoading(false);
    };

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <BrandHeader />
            <section className="main-container" style={{ flex: 1, margin: '2rem auto' }}>
                <h1 className="header-text">Reset Password</h1>
                <p style={{ color: 'var(--text-medium)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Enter your email to receive a password reset link.
                </p>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    {status && (
                        <p style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{status}</p>
                    )}
                    <Link to="/auth/sign-in" className="auth-link" style={{ marginTop: '1rem' }}>
                        Back to Sign In
                    </Link>
                </form>
            </section>
            <BrandFooter />
        </main>
    );
};

export default ForgotPasswordPage;
