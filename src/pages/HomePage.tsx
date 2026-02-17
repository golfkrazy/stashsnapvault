import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <header style={{ marginBottom: '3rem' }}>
        <BrandLogo variant="full" style={{ justifyContent: 'center', marginBottom: '1rem', fontSize: '2rem' }} />
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          background: 'linear-gradient(90deg, #60A5FA, #A78BFA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Your Life. Organized.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94A3B8', maxWidth: '600px', margin: '0 auto' }}>
          The intelligent personal vault for your documents, valuables, and memories.
          Now with <strong>AI Semantic Search</strong>.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/auth/sign-up')}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            transition: 'transform 0.2s'
          }}
        >
          Get Started Free
        </button>
        <button
          onClick={() => navigate('/auth/sign-in')}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          Sign In
        </button>
      </div>

      <footer style={{ marginTop: '5rem', color: '#64748B', fontSize: '0.9rem' }}>
        <p>© 2026 StashSnap Vault. Secure. Intelligent. Yours.</p>
      </footer>
    </main>
  );
};

export default HomePage;
