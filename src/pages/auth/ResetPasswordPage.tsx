import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../../supabase';
import { BrandHeader, BrandFooter } from '../../components/BrandComponents';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageError, setPageError] = useState<{ code: string; message: string } | null>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        // Supabase appends errors to the URL hash (fragment)
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const errorCode = params.get('error_code');
            const errorDescription = params.get('error_description');

            if (errorCode === 'otp_expired') {
                setPageError({
                    code: 'Expired',
                    message: 'Your password reset link has expired. For security, these links are single-use and valid for a limited time.'
                });
            } else if (errorCode) {
                setPageError({
                    code: 'Invalid',
                    message: errorDescription || 'This password reset link is invalid or has already been used.'
                });
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            if (error.message.includes('expired')) {
                setPageError({
                    code: 'Expired',
                    message: 'Your session has expired. Please request a new link.'
                });
            } else {
                setStatus(`Error: ${error.message}`);
            }
        } else {
            setStatus('Password updated successfully!');
            setTimeout(() => navigate('/auth/sign-in'), 2000);
        }
        setLoading(false);
    };

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <BrandHeader />
            <section className="main-container" style={{ flex: 1, margin: '2rem auto' }}>
                <h1 className="header-text">
                    {pageError ? 'Link Expired' : 'New Password'}
                </h1>

                {pageError ? (
                    <div style={{ textAlign: 'center', width: '100b%' }}>
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--accent-pink)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            color: 'var(--text-light)',
                            marginBottom: '2rem'
                        }}>
                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>⚠️ {pageError.code} Link</p>
                            <p style={{ color: 'var(--text-medium)' }}>{pageError.message}</p>
                        </div>
                        <Link
                            to="/auth/forgot-password"
                            className="auth-button"
                            style={{
                                display: 'inline-block',
                                textDecoration: 'none',
                                background: 'var(--accent-cyan-highlight)',
                                color: 'var(--primary-rich-dark)',
                                padding: '0.8rem 2rem',
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            Get Fresh Link
                        </Link>
                    </div>
                ) : (
                    <>
                        <p style={{ color: 'var(--text-medium)', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Please enter your new password below.
                        </p>

                        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%' }}
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                            {status && (
                                <p style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{status}</p>
                            )}
                        </form>
                    </>
                )}
            </section>
            <BrandFooter />
        </main>
    );
};

export default ResetPasswordPage;
