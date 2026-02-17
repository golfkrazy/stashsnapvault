import React, { useState, useEffect } from 'react';
import { SearchType } from '../services/semanticSearch';
import './SearchComponent.css';

interface SearchComponentProps {
    onSearch: (query: string, isSemantic: boolean, aspect: SearchType) => void;
    isSemantic: boolean;
    setIsSemantic: (value: boolean) => void;
    aspect: SearchType;
    setAspect: (value: SearchType) => void;
    subscriptionTier?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
    onSearch,
    isSemantic,
    setIsSemantic,
    aspect,
    setAspect,
    subscriptionTier = 'free'
}) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showUpgradeTooltip, setShowUpgradeTooltip] = useState(false);
    const isPremium = subscriptionTier?.toLowerCase() === 'premium' || subscriptionTier?.toLowerCase() === 'admin';

    // Debounce logic unchanged...
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        onSearch(debouncedQuery, isSemantic, aspect);
    }, [debouncedQuery, isSemantic, aspect, onSearch]);

    const handleToggleSemantic = () => {
        if (!isPremium) {
            setShowUpgradeTooltip(true);
            setTimeout(() => setShowUpgradeTooltip(false), 3000);
            return;
        }
        setIsSemantic(!isSemantic);
    };

    const getPlaceholder = () => {
        if (isPremium && isSemantic) {
            const examples = {
                item: "e.g., 'the gold watch my dad gave me'",
                location: "e.g., 'behind the books in the study'",
                category: "e.g., 'wedding heirlooms'"
            };
            return `Semantic search: ${examples[aspect]}`;
        }

        const standard = {
            item: "Search for item by Name...",
            location: "Search for item by 'stashed' Location...",
            category: "Search for item by Category..."
        };
        return standard[aspect];
    };

    return (
        <div className="search-container">
            <div className="search-main">
                <div className="search-input-wrapper" title={isPremium && isSemantic ? "AI Semantic Search Active" : ""}>
                    <span className="search-icon">{isSemantic ? '✨' : '🔍'}</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder={getPlaceholder()}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            border: isPremium && isSemantic ? '1px solid var(--accent-pink)' : '1px solid var(--border-ui)'
                        }}
                    />
                    {query && (
                        <button className="clear-btn" onClick={() => setQuery('')}>✕</button>
                    )}
                </div>

                <div
                    className={`search-mode-toggle ${!isPremium ? 'locked' : ''}`}
                    onClick={handleToggleSemantic}
                    style={{ position: 'relative' }}
                >
                    <div className={`toggle-track ${isSemantic && isPremium ? 'active' : ''}`}>
                        <div className="toggle-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!isPremium && <span style={{ fontSize: '10px' }}>🔒</span>}
                        </div>
                    </div>
                    <span className={`toggle-label ${isSemantic && isPremium ? 'active-text' : ''}`}>
                        {isPremium ? (
                            <><span style={{ marginRight: '4px' }}>✨</span> AI Semantic</>
                        ) : (
                            'Unlock AI Semantic'
                        )}
                    </span>

                    {showUpgradeTooltip && (
                        <div style={{
                            position: 'absolute',
                            bottom: '120%',
                            right: 0,
                            background: 'var(--primary-rich-dark)',
                            border: '1px solid var(--accent-pink)',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            zIndex: 100,
                            width: '200px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            fontSize: '0.8rem',
                            animation: 'slideUp 0.3s ease-out'
                        }}>
                            <strong style={{ color: 'var(--accent-pink)', display: 'block', marginBottom: '0.4rem' }}>Premium Feature</strong>
                            To unlock AI Semantic search, please upgrade to a Premium subscription.
                        </div>
                    )}
                </div>
            </div>

            {/* Always show selectors for Free users to help them narrow down keyword search */}
            <div className="search-aspect-selector" style={{ borderTop: isSemantic ? '1px solid rgba(255, 255, 255, 0.1)' : 'none' }}>
                <button
                    className={`aspect-btn ${aspect === 'item' ? 'active' : ''}`}
                    onClick={() => setAspect('item')}
                >
                    📦 Item
                </button>
                <button
                    className={`aspect-btn ${aspect === 'location' ? 'active' : ''}`}
                    onClick={() => setAspect('location')}
                >
                    📍 Location
                </button>
                <button
                    className={`aspect-btn ${aspect === 'category' ? 'active' : ''}`}
                    onClick={() => setAspect('category')}
                >
                    🔖 Category
                </button>
            </div>
        </div>
    );
};

export default SearchComponent;
