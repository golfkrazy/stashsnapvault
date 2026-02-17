import React from 'react';
import { VaultItem } from '../supabase/types';

interface VaultStatsProps {
    items: VaultItem[];
}

const VaultStats: React.FC<VaultStatsProps> = ({ items }) => {
    const totalValue = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

    return (
        <div style={{
            display: 'flex',
            width: '100%',
            gap: '1rem',
            marginBottom: '2rem',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-medium)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Total Items</p>
                <h2 style={{ color: 'var(--accent-cyan-highlight)', fontSize: '1.8rem', fontWeight: 'bold' }}>{items.length}</h2>
            </div>
            <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>
            <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-medium)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Vault Value</p>
                <h2 style={{ color: 'var(--accent-golden-yellow)', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
            </div>
        </div>
    );
};

export default VaultStats;
