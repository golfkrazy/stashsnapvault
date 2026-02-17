import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../supabase';
import { BrandHeader, BrandFooter } from '../../components/BrandComponents';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setStatus(`Error: ${error.message}`);
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
                <h1 className="header-text">New Password</h1>
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
            </section>
            <BrandFooter />
        </main>
    );
};

export default ResetPasswordPage;
