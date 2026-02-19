import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VaultItem } from '../supabase/types';
import { trashService } from '../services/trashService';

interface VaultItemCardProps {
    item: VaultItem;
    onDelete?: (id: string) => void;
    selected?: boolean;
    onSelect?: (id: string, isSelected: boolean) => void;
}

const VaultItemCard: React.FC<VaultItemCardProps> = ({ item, onDelete, selected, onSelect }) => {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (onSelect) onSelect(item.id, e.target.checked);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to move "${item.title}" to Trash? (Item will be recoverable for 30 days)`)) return;

        setIsDeleting(true);
        try {
            // Soft Delete using Trash Service
            await trashService.moveToTrash(item.id);

            // Notify parent to refresh UI
            if (onDelete) onDelete(item.id);
        } catch (error) {
            console.error('Error moving item to trash:', error);
            alert('Failed to move item to trash.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/inventory/edit/${item.id}`);
    };

    return (
        <div className="vault-item-card" onClick={handleEdit} style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            padding: '0.8rem',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            height: '100%'
        }}>
            <div style={{
                width: '100%',
                paddingTop: '75%',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.2)'
            }}>
                {/* Selection Checkbox Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={handleSelect}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: 'var(--accent-cyan-highlight)'
                        }}
                    />
                </div>

                {item.photo_url ? (
                    <>
                        <img
                            src={item.photo_url}
                            alt={item.title}
                            onError={(e) => {
                                console.warn(`[VaultItemCard] Image load failed for: ${item.title}`);
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement?.classList.add('image-load-failed');
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <div className="image-fallback" style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            background: 'var(--primary-rich-dark)'
                        }}>
                            {item.category?.icon || '📦'}
                        </div>
                    </>
                ) : (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem'
                    }}>
                        {item.category?.icon || '📦'}
                    </div>
                )}
                {/* CSS for load failure */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .image-load-failed .image-fallback { display: flex !important; }
                `}} />
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', margin: 0 }}>{item.title}</h3>
                    {item.value && item.value > 0 && (
                        <span style={{ color: 'var(--accent-golden-yellow)', fontWeight: 'bold' }}>
                            ${Number(item.value).toFixed(2)}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan-highlight)' }}>
                        🏷️ {item.category?.name || 'Uncategorized'}
                    </span>
                    {item.location && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-medium)' }}>
                            📍 {item.location}
                        </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-pink)', marginTop: '0.2rem' }}>
                        🕒 Last Updated: {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                    {item.effective_date && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-medium)', marginTop: '0.1rem' }}>
                            📅 Effective: {new Date(item.effective_date).toLocaleDateString()}
                        </span>
                    )}
                    {item.expiration_date && (
                        <span style={{
                            fontSize: '0.75rem',
                            color: new Date(item.expiration_date) < new Date() ? 'var(--accent-pink)' : 'var(--accent-golden-yellow)',
                            marginTop: '0.1rem',
                            fontWeight: new Date(item.expiration_date) < new Date() ? 'bold' : 'normal'
                        }}>
                            🛑 Expires: {new Date(item.expiration_date).toLocaleDateString()}
                            {new Date(item.expiration_date) < new Date() && ' (EXPIRED)'}
                        </span>
                    )}
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '0.6rem',
                marginTop: 'auto'
            }}>
                <button
                    onClick={handleEdit}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'var(--accent-cyan-highlight)',
                        cursor: 'pointer',
                        padding: '0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}
                >
                    ✏️ Edit
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                        background: 'rgba(255,0,0,0.1)',
                        border: 'none',
                        color: 'var(--accent-pink)',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        padding: '0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        opacity: isDeleting ? 0.5 : 1
                    }}
                >
                    {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
                </button>
            </div>

            <style>{`
        .vault-item-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
          border-color: var(--accent-electric-blue);
        }
      `}</style>
        </div>
    );
};

export default VaultItemCard;
