import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import supabase from '../supabase';
import { VaultItem, Category } from '../supabase/types';
import { useSession } from '../context/SessionContext';
import VaultItemCard from '../components/VaultItemCard';
import VaultStats from '../components/VaultStats';
import SearchComponent from '../components/SearchComponent';
import { performSemanticSearch, SearchType } from '../services/semanticSearch';
import { trashService } from '../services/trashService';
import { BrandHeader, BrandFooter } from '../components/BrandComponents';

const InventoryPage: React.FC = () => {
    const { session, profile } = useSession();
    const [items, setItems] = useState<VaultItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSemantic, setIsSemantic] = useState(false);
    const [searchAspect, setSearchAspect] = useState<SearchType>('item');
    const [searchResults, setSearchResults] = useState<VaultItem[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showPremiumCelebration, setShowPremiumCelebration] = useState(false);
    const [hasDefaultedSemantic, setHasDefaultedSemantic] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const { refreshProfile } = useSession();

    // Set AI Semantic as default for Premium/Admin users on first load
    useEffect(() => {
        if (profile && !hasDefaultedSemantic) {
            const isPremium = profile.subscription_tier?.toLowerCase() === 'premium' || profile.role?.toLowerCase() === 'admin';
            if (isPremium) {
                setIsSemantic(true);
            }
            setHasDefaultedSemantic(true);
        }
    }, [profile, hasDefaultedSemantic]);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user.id) return;

            try {
                // Fetch items with joined category data
                const { data: itemsData, error: itemsError } = await supabase
                    .from('items')
                    .select('*, category:categories(*)')
                    .eq('user_id', session.user.id)
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false });

                if (itemsError) throw itemsError;

                // Fetch categories (own + global)
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .or(`user_id.eq.${session.user.id},user_id.is.null`);

                if (catError) throw catError;

                setItems(itemsData || []);
                setCategories(catData || []);
            } catch (error) {
                console.error('Error fetching inventory data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Check for successful checkout session
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            const handleSuccess = async () => {
                await refreshProfile();
                setShowPremiumCelebration(true);
                // Clear the session_id from URL without refreshing
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('session_id');
                setSearchParams(newParams, { replace: true });
            };
            handleSuccess();
        }
    }, [session, searchParams, setSearchParams, refreshProfile]);

    // Search Handler
    const handleSearch = React.useCallback(async (query: string, semantic: boolean, aspect: SearchType) => {
        setSearchQuery(query);
        setIsSemantic(semantic);
        setSearchAspect(aspect);

        if (!query.trim()) {
            setSearchResults(null);
            return;
        }

        // Only show loading indicator for semantic (network) search
        if (semantic) setIsSearching(true);
        setSearchError(null);

        try {
            if (semantic) {
                if (!session?.user.id) return;

                const results = await performSemanticSearch(
                    query,
                    session.user.id,
                    {
                        threshold: aspect === 'item' ? 0.65 : 0.5,
                        limit: 10,
                        searchType: aspect
                    }
                );

                const matchedIds = results.map(r => r.id);
                setSearchResults(items.filter(item => matchedIds.includes(item.id))
                    .sort((a, b) => matchedIds.indexOf(a.id) - matchedIds.indexOf(b.id)));
            } else {
                // Client-side Keyword Search (Instant)
                const lowerQuery = query.toLowerCase();
                setSearchResults(items.filter(item =>
                    item.title.toLowerCase().includes(lowerQuery) ||
                    item.description?.toLowerCase().includes(lowerQuery) ||
                    item.location?.toLowerCase().includes(lowerQuery)
                ));
            }
        } catch (error: any) {
            console.error("Search failed:", error);
            setSearchError(error.message || "Unknown search error");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [session?.user.id, items]);

    const handleSelectItem = (id: string, isSelected: boolean) => {
        setSelectedItems(prev =>
            isSelected ? [...prev, id] : prev.filter(itemId => itemId !== id)
        );
    };

    const handleBulkTrash = async () => {
        if (selectedItems.length === 0) return;
        if (!window.confirm(`Move ${selectedItems.length} items to Trash?`)) return;

        setLoading(true);
        try {
            await Promise.all(selectedItems.map(id => trashService.moveToTrash(id)));
            // Refresh items list
            setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
            alert(`${selectedItems.length} items moved to trash.`);
        } catch (error) {
            console.error('Error in bulk trash:', error);
            alert('Failed to delete some items.');
        } finally {
            setLoading(false);
        }
    };


    // Filter Logic: Category AND Search
    const displayItems = (searchResults || items).filter(item => {
        if (selectedCategory && item.category_id !== selectedCategory) return false;
        return true;
    });

    if (loading) {
        return <div className="main-container">Loading your vault...</div>;
    }

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <BrandHeader />
            <section className="main-container" style={{ maxWidth: '800px', flex: 1, margin: '2rem auto' }}>
                <div style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '1rem' }}>
                    <Link to="/" className="home-link">🏠 Vault Home</Link>
                    {profile?.role?.toLowerCase() === 'admin' && (
                        <Link to="/admin" className="home-link" style={{ color: 'var(--accent-cyan-highlight)' }}>🛡️ Vault Command (AI)</Link>
                    )}
                </div>

                <header style={{ width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 className="header-text" style={{ fontSize: '2rem', padding: '0.2em 0', justifyContent: 'center' }}>My Vault</h1>
                        <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>Secure inventory tracker</p>
                    </div>

                    <div style={{ position: 'absolute', right: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
                        {((profile as any).subscription_tier?.toLowerCase() !== 'premium' && profile?.role?.toLowerCase() !== 'admin') && (
                            <Link
                                to="/profile"
                                className="btn"
                                style={{
                                    width: '165px',
                                    padding: '0.6em 1.2em',
                                    fontSize: '0.9rem',
                                    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    color: 'white',
                                    fontWeight: '600'
                                }}
                            >
                                ✨ Upgrade
                            </Link>
                        )}
                        <Link
                            to="/inventory/trash"
                            style={{
                                color: 'var(--text-medium)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.6em 1.2em',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)'
                            }}
                        >
                            🗑️ Trash
                        </Link>
                        <Link
                            to="/inventory/add"
                            className="btn"
                            style={{
                                width: '165px',
                                padding: '0.6em 1.2em',
                                fontSize: '0.9rem',
                                marginTop: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            + Snap New Item
                        </Link>
                    </div>
                </header>

                <VaultStats items={items} />

                <SearchComponent
                    onSearch={handleSearch}
                    isSemantic={isSemantic}
                    setIsSemantic={setIsSemantic}
                    aspect={searchAspect}
                    setAspect={setSearchAspect}
                    subscriptionTier={profile?.subscription_tier}
                />

                <div className="categories-filter" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', width: '100%', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`btn auth-link ${!selectedCategory ? 'active' : ''}`}
                        style={{
                            padding: '0.4rem 1rem',
                            border: '1px solid var(--border-ui)',
                            borderRadius: '20px',
                            backgroundColor: !selectedCategory ? 'var(--accent-electric-blue)' : 'transparent',
                            color: !selectedCategory ? 'white' : 'var(--text-medium)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        All Items
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`btn auth-link ${selectedCategory === cat.id ? 'active' : ''}`}
                            style={{
                                padding: '0.4rem 1rem',
                                border: '1px solid var(--border-ui)',
                                borderRadius: '20px',
                                backgroundColor: selectedCategory === cat.id ? 'var(--accent-electric-blue)' : 'transparent',
                                color: selectedCategory === cat.id ? 'white' : 'var(--text-medium)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                <div className="items-grid-container" style={{ position: 'relative', minHeight: '300px', width: '100%' }}>
                    {isSearching && (
                        <div style={{
                            position: 'sticky',
                            top: '10px',
                            zIndex: 100,
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            pointerEvents: 'none'
                        }}>
                            <div style={{
                                background: 'var(--accent-electric-blue)',
                                color: 'white',
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                animation: 'pulse 1.5s infinite'
                            }}>
                                <span>🧠 Thinking...</span>
                            </div>
                        </div>
                    )}

                    <div className="items-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '1rem',
                        width: '100%',
                        marginTop: '1rem',
                        opacity: isSearching ? 0.6 : 1,
                        transition: 'opacity 0.3s ease'
                    }}>
                        {displayItems.length === 0 && !isSearching ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-medium)' }}>
                                <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                    {searchQuery ? '🔍' : '📦'}
                                </p>
                                <h3>{searchQuery ? 'No matches found' : 'No items found'}</h3>
                                <p>{searchQuery ? 'Try a different search term.' : 'Start by snapping your first item!'}</p>
                                {searchError && (
                                    <div style={{ marginTop: '1rem', color: 'red', border: '1px solid red', padding: '1rem', borderRadius: '8px' }}>
                                        <strong>Debug Error:</strong> {searchError}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {displayItems.map(item => (
                                    <VaultItemCard
                                        key={item.id}
                                        item={item}
                                        onDelete={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                                        selected={selectedItems.includes(item.id)}
                                        onSelect={handleSelectItem}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
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
                                onClick={handleBulkTrash}
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
                                🗑️ Move to Trash
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

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <Link to="/" className="home-link">🏠 Vault Home</Link>
                </div>
            </section>

            {/* Premium Celebration Modal */}
            {showPremiumCelebration && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000,
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    <div style={{
                        background: 'linear-gradient(145deg, rgba(17, 26, 46, 0.95), rgba(7, 12, 24, 0.98))',
                        border: '2px solid var(--accent-cyan-highlight)',
                        borderRadius: '32px',
                        padding: '4rem',
                        textAlign: 'center',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 0 80px rgba(0, 198, 255, 0.4)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative background elements */}
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-cyan-highlight)', filter: 'blur(80px)', opacity: 0.2 }}></div>
                        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: '#9333ea', filter: 'blur(80px)', opacity: 0.2 }}></div>

                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'bounce 2s infinite' }}>🏆</div>
                        <h2 style={{
                            color: 'white',
                            marginBottom: '1rem',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #00c6ff, #c084fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 20px rgba(0, 198, 255, 0.3)'
                        }}>
                            Vault Unlocked!
                        </h2>
                        <p style={{
                            color: 'var(--text-medium)',
                            marginBottom: '2.5rem',
                            fontSize: '1.2rem',
                            lineHeight: '1.6',
                            fontWeight: '500'
                        }}>
                            Welcome to <strong>Ultimate Premium</strong>.<br />
                            Your account is now secure with unlimited AI semantic power.
                        </p>
                        <button
                            className="btn primary"
                            onClick={() => setShowPremiumCelebration(false)}
                            style={{
                                width: '100%',
                                padding: '1.2rem',
                                fontSize: '1.2rem',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, var(--accent-electric-blue), #9333ea)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
                            }}
                        >
                            Enter Your Premium Vault
                        </button>
                    </div>
                </div>
            )}
            <BrandFooter />
        </main>
    );
};

export default InventoryPage;
