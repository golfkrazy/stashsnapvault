import React from 'react';

interface BrandLogoProps {
    variant?: 'full' | 'icon';
    className?: string;
    style?: React.CSSProperties;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'full', className, style }) => {
    return (
        <div className={`brand-logo-container ${className || ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', ...style }}>
            {/* Icon Part */}
            <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    position: 'absolute',
                    background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
                    borderRadius: '8px',
                    width: '100%',
                    height: '100%',
                    transform: 'rotate(-10deg)',
                    boxShadow: '0 4px 10px rgba(0, 198, 255, 0.4)'
                }} />
                <span style={{ position: 'relative', color: 'white', fontWeight: '900', fontSize: '1.2rem', zIndex: 2 }}>S</span>
            </div>

            {/* Text Part */}
            {variant === 'full' && (
                <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: '800',
                    fontSize: '1.5rem',
                    background: 'linear-gradient(90deg, #FFFFFF 0%, #E0E7FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 10px rgba(255,255,255,0.1)'
                }}>
                    StashSnap
                </span>
            )}
        </div>
    );
};

export default BrandLogo;
