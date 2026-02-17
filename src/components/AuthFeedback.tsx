import React from 'react';

interface AuthFeedbackProps {
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    onClear?: () => void;
}

const AuthFeedback: React.FC<AuthFeedbackProps> = ({ type, message, onClear }) => {
    if (!message) return null;

    const config = {
        error: {
            border: 'var(--accent-pink)',
            titleColor: '#FF6B6B',
            background: 'rgba(236, 72, 153, 0.1)',
            icon: '🔐',
            gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EC4899 100%)'
        },
        warning: {
            border: 'var(--accent-cyan-highlight)',
            titleColor: 'var(--accent-cyan-highlight)',
            background: 'rgba(75, 195, 255, 0.1)',
            icon: '⚡',
            gradient: null
        },
        success: {
            border: 'var(--accent-electric-blue)',
            titleColor: 'var(--accent-electric-blue)',
            background: 'rgba(37, 99, 235, 0.1)',
            icon: '✅',
            gradient: null
        },
        info: {
            border: 'var(--border-ui)',
            titleColor: 'var(--text-light)',
            background: 'var(--glass-bg)',
            icon: 'ℹ️',
            gradient: null
        }
    }[type];

    return (
        <div
            className="auth-feedback-container"
            style={{
                border: `1px solid ${config.border}`,
                background: config.background,
                padding: '1.2rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.2rem',
                width: '100%',
                boxSizing: 'border-box',
                backdropFilter: 'blur(8px)',
                boxShadow: type === 'error' ? '0 0 20px rgba(236, 72, 153, 0.1)' : 'none',
                animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        >
            <div style={{
                fontSize: '1.5rem',
                filter: type === 'error' ? 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.4))' : 'none'
            }}>
                {config.icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.4rem',
                    background: config.gradient || 'none',
                    WebkitBackgroundClip: config.gradient ? 'text' : 'unset',
                    WebkitTextFillColor: config.gradient ? 'transparent' : config.titleColor,
                    color: config.gradient ? 'transparent' : config.titleColor
                }}>
                    {type === 'error' ? 'Security Alert' : type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    color: type === 'error' ? 'var(--accent-pink)' : 'var(--text-light)',
                    opacity: 0.9
                }}>
                    {message}
                </p>
            </div>
            {onClear && (
                <button
                    onClick={onClear}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'var(--text-medium)',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.4rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        marginLeft: '0.5rem',
                        width: '32px',
                        height: '32px',
                        flexShrink: 0
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    aria-label="Clear notification"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default AuthFeedback;
