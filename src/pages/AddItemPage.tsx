import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import { useSession } from '../context/SessionContext';
import { Category } from '../supabase/types';
import CameraPreview from '../components/CameraPreview';
import {
    CitySelect,
    CountrySelect,
    StateSelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { BrandHeader, BrandFooter, BrandErrorModal } from '../components/BrandComponents';

const EMOJI_OPTIONS = ['📦', '📄', '💎', '📱', '🪑', '👕', '📚', '⚽', '🍳', '🚗', '🏠', '🧸', '🛠️', '🎨', '🎸', '💰', '🔑', '🎒', '⌚', '🌂'];

const AddItemPage: React.FC = () => {
    const { session } = useSession();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [effectiveDate, setEffectiveDate] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [jurisdictionCity, setJurisdictionCity] = useState('');
    const [jurisdictionState, setJurisdictionState] = useState('');
    const [jurisdictionCountry, setJurisdictionCountry] = useState('');
    const [countryId, setCountryId] = useState<number>(0);
    const [stateId, setStateId] = useState<number>(0);

    const [itemCount, setItemCount] = useState<number | null>(null);
    const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
    const [isLimitReached, setIsLimitReached] = useState(false);
    const [errorModal, setErrorModal] = useState<{ show: boolean; message: string; title: string }>({
        show: false,
        message: '',
        title: ''
    });

    const fetchCategories = async () => {
        if (!session?.user.id) return;

        // Fetch categories that belong to me OR have no user_id (global defaults)
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .or(`user_id.eq.${session.user.id},user_id.is.null`)
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
        } else if (data) {
            setCategories(data);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchUsageStats();
    }, [session]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                // trigger form submit
                const form = document.querySelector('form');
                if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchUsageStats = async () => {
        if (!session?.user.id) return;

        try {
            // 1. Fetch item count
            const { count, error: countError } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);

            if (countError) throw countError;
            setItemCount(count || 0);

            // 2. Fetch subscription tier
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('subscription_tier')
                .eq('id', session.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') throw profileError;

            const tier = profile?.subscription_tier || 'free';
            setSubscriptionTier(tier);

            // 3. Check limit
            if (tier.toLowerCase() === 'free' && (count || 0) >= 10) {
                setIsLimitReached(true);
            }
        } catch (error) {
            console.error('Error fetching usage stats:', error);
        }
    };

    const handleCapture = (blob: Blob) => {
        setCapturedBlob(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
        setIsCapturing(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCapturedBlob(file);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreateCategory = async () => {
        if (!session?.user.id || !newCategoryName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    user_id: session.user.id,
                    name: newCategoryName.trim(),
                    icon: newCategoryIcon,
                    color: '#7C3AED' // Default color
                })
                .select()
                .single();

            if (error) throw error;

            setCategories(prev => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)));
            setCategoryId(data.id);
            setShowNewCategoryForm(false);
            setNewCategoryName('');
            setNewCategoryIcon('📦');
            setShowEmojiPicker(false);
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Failed to create category.');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user.id || !title || !location) {
            alert('Please fill in all mandatory fields (Title and Location)');
            return;
        }

        if (isLimitReached) {
            setErrorModal({
                show: true,
                title: "Vault Limit Reached",
                message: "Free accounts are limited to 10 items. Please upgrade to Ultimate Premium for unlimited stashing and AI power! ✨"
            });
            return;
        }

        setIsSaving(true);
        try {
            let photoUrl = null;
            let photoPath = null;

            if (capturedBlob) {
                const fileExt = capturedBlob.type === 'image/png' ? 'png' : 'jpg';
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${session.user.id}/${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('item-photos')
                    .upload(filePath, capturedBlob);

                if (uploadError) throw uploadError;

                photoPath = data.path;
                const { data: { publicUrl } } = supabase.storage
                    .from('item-photos')
                    .getPublicUrl(filePath);

                photoUrl = publicUrl;
            }

            const { error: insertError } = await supabase
                .from('items')
                .insert({
                    user_id: session.user.id,
                    title: title.trim(),
                    location: location.trim(),
                    category_id: categoryId || null,
                    value: parseFloat(value) || 0,
                    description: description.trim(),
                    photo_url: photoUrl,
                    photo_path: photoPath,
                    effective_date: effectiveDate || null,
                    expiration_date: expirationDate || null,
                    reminder_enabled: reminderEnabled,
                    jurisdiction_city: jurisdictionCity || null,
                    jurisdiction_state: jurisdictionState || null,
                    jurisdiction_country: jurisdictionCountry || null,
                });

            if (insertError) throw insertError;
            navigate('/inventory');
        } catch (error: any) {
            console.error('Error saving item:', error);
            setErrorModal({
                show: true,
                title: "Save Error",
                message: error.message || error.details || JSON.stringify(error) || 'Unknown error occurred'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isCapturing) {
        return <CameraPreview onCapture={handleCapture} onCancel={() => setIsCapturing(false)} />;
    }

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <BrandHeader />
            <section className="main-container" style={{ maxWidth: '500px', margin: '2rem auto', flex: 1 }}>
                <header style={{ width: '100%', marginBottom: '2rem' }}>
                    <h1 className="header-text" style={{ fontSize: '2rem', padding: '0.2em 0', justifyContent: 'center' }}>Snap New Item</h1>
                    <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem', textAlign: 'center' }}>Capture a memory, secure its place.</p>
                </header>

                <form onSubmit={handleSave} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
                    {/* Photo Action Area */}
                    <div style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        background: 'var(--primary-rich-dark)',
                        borderRadius: '12px',
                        border: '2px dashed var(--border-ui)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                    }}>
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📸</span>
                                <span style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>No photo selected</span>
                            </div>
                        )}

                        {/* Overlay Controls */}
                        <div style={{
                            position: 'absolute',
                            bottom: '1rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '0.8rem',
                            width: '90%'
                        }}>
                            <button
                                type="button"
                                onClick={() => setIsCapturing(true)}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: 'var(--accent-electric-blue)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span>📷</span> Snap
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(5px)',
                                    border: '1px solid var(--border-ui)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span>📁</span> Upload
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>

                    <div className="input-group" style={{ width: '100%' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>
                            Item Name <span style={{ color: 'var(--accent-pink)' }}>*</span>
                        </label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What are we stashing?"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="input-group" style={{ width: '100%' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>
                            Location <span style={{ color: 'var(--accent-pink)' }}>*</span>
                        </label>
                        <input
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Where is it stored?"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>Category</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <select
                                    value={categoryId}
                                    onChange={(e) => {
                                        if (e.target.value === 'new') {
                                            setShowNewCategoryForm(true);
                                        } else {
                                            setCategoryId(e.target.value);
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        borderRadius: '4px',
                                        background: 'var(--primary-rich-dark)',
                                        border: '1px solid var(--border-ui)',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">Uncategorized</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                    ))}
                                    <option value="new" style={{ color: 'var(--accent-cyan-highlight)', fontWeight: 'bold' }}>+ Create New...</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>Value ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="0.00"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    {showNewCategoryForm && (
                        <div style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--accent-cyan-highlight)',
                            padding: '1.2rem',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(10px)',
                            width: '100%'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-cyan-highlight)' }}>New Category</span>
                                <button type="button" onClick={() => setShowNewCategoryForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            fontSize: '1.8rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid var(--border-ui)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {newCategoryIcon}
                                    </button>
                                    <input
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Category Name"
                                        style={{ flex: 1, height: '50px' }}
                                        autoFocus
                                    />
                                </div>

                                {showEmojiPicker && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gap: '0.5rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        maxHeight: '150px',
                                        overflowY: 'auto'
                                    }}>
                                        {EMOJI_OPTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => {
                                                    setNewCategoryIcon(emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                                style={{
                                                    fontSize: '1.5rem',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '0.3rem',
                                                    borderRadius: '4px',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="button" className="btn" onClick={handleCreateCategory} disabled={!newCategoryName.trim()} style={{ marginTop: 0, padding: '0.8rem' }}>
                                Save Category
                            </button>
                        </div>
                    )}

                    <div className="input-group" style={{ width: '100%' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>Description / Notes</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Any extra details?"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '4px',
                                background: 'var(--primary-rich-dark)',
                                border: '1px solid var(--border-ui)',
                                color: 'white',
                                minHeight: '80px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Document Specific Fields */}
                    {categories.find(c => c.id === categoryId)?.name === 'Documents' && (
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid var(--accent-electric-blue)',
                            padding: '1.2rem',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            width: '100%'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-medium)' }}>Effective/Issue Date</label>
                                    <input
                                        type="date"
                                        value={effectiveDate}
                                        onChange={(e) => setEffectiveDate(e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', background: 'var(--primary-rich-dark)', border: '1px solid var(--border-ui)', color: 'white' }}
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--accent-pink)' }}>Expiration Date</label>
                                    <input
                                        type="date"
                                        value={expirationDate}
                                        onChange={(e) => setExpirationDate(e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', background: 'var(--primary-rich-dark)', border: '1px solid var(--border-ui)', color: 'white' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <input
                                    type="checkbox"
                                    id="reminder_enabled"
                                    checked={reminderEnabled}
                                    onChange={(e) => setReminderEnabled(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 0 }}
                                />
                                <label htmlFor="reminder_enabled" style={{ fontSize: '0.85rem', color: 'var(--text-light)', cursor: 'pointer' }}>
                                    Set Reminder for Expiration (Email/SMS)
                                </label>
                            </div>

                            {/* Jurisdiction Details */}
                            <div style={{
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--accent-cyan-highlight)', display: 'block' }}>Jurisdiction (Where is this valid?)</label>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-medium)', marginBottom: '0.3rem', display: 'block' }}>Country</label>
                                        <CountrySelect
                                            onChange={(e: any) => {
                                                setCountryId(e.id);
                                                setJurisdictionCountry(e.name);
                                            }}
                                            placeHolder="Select Country"
                                            containerClassName="country-selector-container"
                                            inputClassName="country-selector-input"
                                        />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-medium)', marginBottom: '0.3rem', display: 'block' }}>State/Province</label>
                                        <StateSelect
                                            countryid={countryId}
                                            onChange={(e: any) => {
                                                setStateId(e.id);
                                                setJurisdictionState(e.name);
                                            }}
                                            placeHolder="Select State"
                                            containerClassName="country-selector-container"
                                            inputClassName="country-selector-input"
                                        />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-medium)', marginBottom: '0.3rem', display: 'block' }}>City</label>
                                    <CitySelect
                                        countryid={countryId}
                                        stateid={stateId}
                                        onChange={(e: any) => {
                                            setJurisdictionCity(e.name);
                                        }}
                                        placeHolder="Select City"
                                        containerClassName="country-selector-container"
                                        inputClassName="country-selector-input"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {isLimitReached && (
                        <div style={{
                            background: 'rgba(255, 77, 77, 0.1)',
                            border: '1px solid var(--accent-pink)',
                            padding: '1rem',
                            borderRadius: '8px',
                            color: 'var(--accent-pink)',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            marginBottom: '1rem',
                            width: '100%'
                        }}>
                            🛡️ <strong>Vault Limit Reached</strong><br />
                            Your {subscriptionTier} vault is full ({itemCount}/50 items).<br />
                            <button
                                type="button"
                                onClick={() => navigate('/pricing')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-cyan-highlight)',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    marginTop: '0.5rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Upgrade now to stashed more! ✨
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn"
                        disabled={isSaving || !title || !location || isLimitReached}
                        style={{
                            marginTop: '1rem',
                            opacity: (!title || !location || isLimitReached) ? 0.5 : 1
                        }}
                    >
                        {isSaving ? 'Securing Item...' : isLimitReached ? 'Vault Full 🔒' : 'Save to Vault 🛡️'}
                    </button>

                    <button
                        type="button"
                        className="btn auth-link"
                        onClick={() => navigate('/inventory')}
                    >
                        Cancel
                    </button>
                </form>
            </section>
            <BrandFooter />

            <BrandErrorModal
                isOpen={errorModal.show}
                onClose={() => {
                    setErrorModal(prev => ({ ...prev, show: false }));
                    if (isLimitReached) navigate('/pricing');
                }}
                title={errorModal.title}
                message={errorModal.message}
            />
        </main>
    );
};

export default AddItemPage;
