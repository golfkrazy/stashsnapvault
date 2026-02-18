import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VaultItem } from '../supabase/types';
import { useSession } from '../context/SessionContext';
import { trashService } from '../services/trashService';
import { BrandHeader, BrandFooter } from '../components/BrandComponents';
import VaultItemCard from '../components/VaultItemCard';

const TrashBinPage: React.FC = () => {
    const { session } = useSession();
    const [trashItems, setTrashItems] = useState<VaultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const fetchTrash = async () => {
        if (!session?.user.id) return;
        try {
            const data = await trashService.getTrashItems(session.user.id);
            setTrashItems(data);
        } catch (error) {
            console.error('Error fetching trash:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, [session]);

    const handleSelectItem = (id: string, isSelected: boolean) => {
        setSelectedItems(prev =>
            isSelected ? [...prev, id] : prev.filter(itemId => itemId !== id)
        );
    };

    const handleBulkRestore = async () => {
        if (selectedItems.length === 0) return;
        try {
            await Promise.all(selectedItems.map(id => trashService.restoreFromTrash(id)));
            setTrashItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
            alert(`${selectedItems.length} items restored.`);
        } catch (error) {
            console.error('Error in bulk restore:', error);
            alert('Failed to restore some items.');
        }
    };

    const handleBulkPermanentDelete = async () => {
        if (selectedItems.length === 0) return;
        if (!window.confirm(`Permanently delete ${selectedItems.length} items? This cannot be undone.`)) return;

        try {
            await Promise.all(selectedItems.map(id => trashService.permanentlyDelete(id)));
            setTrashItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
            alert(`${selectedItems.length} items permanently deleted.`);
        } catch (error) {
            console.error('Error in bulk delete:', error);
            alert('Failed to delete some items.');
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await trashService.restoreFromTrash(id);
            setTrashItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error restoring item:', error);
            alert('Failed to restore item.');
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (!window.confirm('This will permanently delete the item and its photo. This action cannot be undone.')) return;
        try {
            await trashService.permanentlyDelete(id);
            setTrashItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item.');
        }
    };

    const handleEmptyTrash = async () => {
        if (!window.confirm('Are you sure you want to empty the trash? All items and photos will be permanently deleted.')) return;
        try {
            await trashService.emptyTrash(session?.user.id || '');
            setTrashItems([]);
        } catch (error) {
            console.error('Error emptying trash:', error);
            alert('Failed to empty trash.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--primary-rich-dark)', color: 'var(--text-light)' }}>
            <BrandHeader />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <Link to="/inventory" style={{ color: 'var(--accent-cyan-highlight)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            ← Back to Inventory
                        </Link>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>🗑️ Trash Bin</h1>
                        <p style={{ color: 'var(--text-medium)', marginTop: '0.5rem' }}>
                            Items here will be permanently deleted after 30 days.
                        </p>
                    </div>

                    {trashItems.length > 0 && (
                        <button
                            onClick={handleEmptyTrash}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid var(--accent-pink)',
                                color: 'var(--accent-pink)',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Empty Trash
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--accent-cyan-highlight)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    </div>
                ) : trashItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px border var(--glass-border)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍃</div>
                        <h2>Your trash is empty</h2>
                        <p style={{ color: 'var(--text-medium)' }}>Good job keeping things tidy!</p>
                        <Link to="/inventory" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.8rem 2rem', background: 'var(--accent-electric-blue)', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
                            Return to Vault
                        </Link>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {trashItems.map(item => (
                                <div key={item.id} style={{ position: 'relative' }}>
                                    <VaultItemCard
                                        item={item}
                                        selected={selectedItems.includes(item.id)}
                                        onSelect={handleSelectItem}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0,0,0,0.6)',
                                        backdropFilter: 'blur(2px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '1rem',
                                        borderRadius: '12px',
                                        opacity: selectedItems.length > 0 ? 0 : (trashItems.length > 0 ? 0 : 0), // Base logic
                                        pointerEvents: selectedItems.length > 0 ? 'none' : 'auto',
                                        transition: 'opacity 0.3s ease',
                                        zIndex: 10
                                    }} className="trash-overlay">
                                        <button
                                            onClick={() => handleRestore(item.id)}
                                            style={{ background: 'var(--accent-cyan-highlight)', color: 'black', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '80%' }}
                                        >
                                            🔄 Restore Item
                                        </button>
                                        <button
                                            onClick={() => handlePermanentDelete(item.id)}
                                            style={{ background: 'transparent', color: 'var(--accent-pink)', border: '1px solid var(--accent-pink)', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', width: '80%' }}
                                        >
                                            🛑 Permanent Delete
                                        </button>
                                    </div>
                                    <style>{`
                                        .trash-overlay:hover { opacity: ${selectedItems.length > 0 ? 0 : 1} !important; }
                                    `}</style>
                                </div>
                            ))}
                        </div>

                        {/* Bulk Actions Toolbar */}
                        {selectedItems.length > 0 && (
                            <div style={{
                                position: 'fixed',
                                bottom: '2rem',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--primary-rich-dark)',
                                border: '1px solid var(--accent-cyan-highlight)',
                                padding: '1rem 2rem',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                                zIndex: 100,
                                animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}>
                                <div style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>
                                    📑 {selectedItems.length} items selected
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setSelectedItems([])}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-medium)', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBulkRestore}
                                        style={{
                                            background: 'rgba(34, 211, 238, 0.1)',
                                            color: 'var(--accent-cyan-highlight)',
                                            border: '1px solid var(--accent-cyan-highlight)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        🔄 Restore
                                    </button>
                                    <button
                                        onClick={handleBulkPermanentDelete}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            color: 'var(--accent-pink)',
                                            border: '1px solid var(--accent-pink)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        🛑 Delete Permanently
                                    </button>
                                </div>
                            </div>
                        )}

                        <style>{`
                            @keyframes slideUp {
                                from { transform: translate(-50%, 100px); opacity: 0; }
                                to { transform: translate(-50%, 0); opacity: 1; }
                            }
                        `}</style>
                    </>
                )}

            </main>

            <BrandFooter />
        </div>
    );
};

export default TrashBinPage;
