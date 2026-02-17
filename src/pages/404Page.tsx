import React from 'react';
import { Link } from "react-router-dom";
import { BrandHeader, BrandFooter } from "../components/BrandComponents";

const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--primary-rich-dark)"
    }}>
      <BrandHeader />

      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}>
        <section style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          padding: '3rem',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          borderTop: '3px solid var(--accent-electric-blue)'
        }}>
          <h1 className="header-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 Page Not Found</h1>
          <p style={{ color: 'var(--text-medium)', marginBottom: '2rem' }}>
            The vault entrance you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Go back to Home
          </Link>
        </section>
      </main>

      <BrandFooter />
    </div>
  );
};

export default NotFoundPage;
