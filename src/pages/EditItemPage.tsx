import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import supabase from '../supabase';
import { useSession } from '../context/SessionContext';
import { Category } from '../supabase/types';
import CameraPreview from '../components/CameraPreview';
import {
    CitySelect,
    CountrySelect,
    StateSelect,
    GetCountries,
    GetState,
} from "react-country-state-city";
import { BrandHeader, BrandFooter } from '../components/BrandComponents';

const EMOJI_OPTIONS = ['📦', '📄', '💎', '📱', '🪑', '👕', '📚', '⚽', '🍳', '🚗', '🏠', '🧸', '🛠️', '🎨', '🎸', '💰', '🔑', '🎒', '⌚', '🌂'];

const EditItemPage: React.FC = () => {
    const { session } = useSession();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoPath, setPhotoPath] = useState<string | null>(null);
    const [effectiveDate, setEffectiveDate] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [jurisdictionCity, setJurisdictionCity] = useState('');
    const [jurisdictionState, setJurisdictionState] = useState('');
    const [jurisdictionCountry, setJurisdictionCountry] = useState('');
    const [countryId, setCountryId] = useState<number>(0);
    const [stateId, setStateId] = useState<number>(0);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user.id || !id) return;

            try {
                // Fetch item data
                const { data: item, error: itemError } = await supabase
                    .from('items')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', session.user.id)
                    .single();

                if (itemError) throw itemError;

                if (item) {
                    setTitle(item.title);
                    setLocation(item.location || '');
                    setCategoryId(item.category_id || '');
                    setValue(item.value?.toString() || '');
                    setDescription(item.description || '');
                    setPhotoUrl(item.photo_url);
                    setPhotoPath(item.photo_path);
                    setPreviewUrl(item.photo_url);
                    setEffectiveDate(item.effective_date || '');
                    setExpirationDate(item.expiration_date || '');
                    setReminderEnabled(item.reminder_enabled || false);
                    setJurisdictionCity(item.jurisdiction_city || '');
                    setJurisdictionState(item.jurisdiction_state || '');
                    setJurisdictionCountry(item.jurisdiction_country || '');

                    // Initialize dropdowns
                    if (item.jurisdiction_country) {
                        try {
                            const countries = await GetCountries();
                            const country = countries.find((c: any) => c.name === item.jurisdiction_country);
                            if (country) {
                                setCountryId(country.id);
                                if (item.jurisdiction_state) {
                                    const states = await GetState(country.id);
                                    const state = states.find((s: any) => s.name === item.jurisdiction_state);
                                    if (state) {
                                        setStateId(state.id);
                                    }
                                }
                            }
                        } catch (dropdownError) {
                            console.error('Error initializing jurisdiction dropdowns:', dropdownError);
                        }
                    }
                }

                // Fetch categories
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .or(`user_id.eq.${session.user.id},user_id.is.null`)
                    .order('name');

                if (catError) throw catError;
                setCategories(catData || []);

            } catch (error) {
                console.error('Error fetching item for edit:', error);
                alert('Failed to load item data.');
                navigate('/inventory');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, session, navigate]);

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

    const handleCapture = (blob: Blob) => {
        setCapturedBlob(blob);
        if (previewUrl && previewUrl !== photoUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
        setIsCapturing(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCapturedBlob(file);
            if (previewUrl && previewUrl !== photoUrl) URL.revokeObjectURL(previewUrl);
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
                    color: '#7C3AED'
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
        if (!session?.user.id || !id || !title || !location) {
            alert('Please fill in all mandatory fields (Title and Location)');
            return;
        }

        setIsSaving(true);
        try {
            let finalPhotoUrl = photoUrl;
            let finalPhotoPath = photoPath;

            if (capturedBlob) {
                // Upload new photo
                const fileExt = capturedBlob.type === 'image/png' ? 'png' : 'jpg';
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${session.user.id}/${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('item-photos')
                    .upload(filePath, capturedBlob);

                if (uploadError) throw uploadError;

                finalPhotoPath = data.path;
                const { data: { publicUrl } } = supabase.storage
                    .from('item-photos')
                    .getPublicUrl(filePath);

                finalPhotoUrl = publicUrl;

                // Optionally delete old photo if exists
                if (photoPath) {
                    await supabase.storage.from('item-photos').remove([photoPath]);
                }
            }

            const { error: updateError } = await supabase
                .from('items')
                .update({
                    title: title.trim(),
                    location: location.trim(),
                    category_id: categoryId || null,
                    value: parseFloat(value) || 0,
                    description: description.trim(),
                    photo_url: finalPhotoUrl,
                    photo_path: finalPhotoPath,
                    effective_date: effectiveDate || null,
                    expiration_date: expirationDate || null,
                    reminder_enabled: reminderEnabled,
                    jurisdiction_city: jurisdictionCity || null,
                    jurisdiction_state: jurisdictionState || null,
                    jurisdiction_country: jurisdictionCountry || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', session.user.id);

            if (updateError) throw updateError;

            navigate('/inventory');
        } catch (error: any) {
            console.error('Error updating item:', error);
            alert(`Failed to update item: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="main-container">Loading item details...</div>;
    if (isCapturing) return <CameraPreview onCapture={handleCapture} onCancel={() => setIsCapturing(false)} />;

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <BrandHeader />
            <section className="main-container" style={{ maxWidth: '500px', margin: '2rem auto', flex: 1 }}>
                <header style={{ width: '100%', marginBottom: '2rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '0', top: '-1.5rem' }}>
                        <Link to="/inventory" className="home-link" style={{ fontSize: '0.85rem' }}>🏠 Back to Vault</Link>
                    </div>
                    <h1 className="header-text" style={{ fontSize: '2rem', padding: '0.2em 0', justifyContent: 'center' }}>Edit Item</h1>
                    <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem', textAlign: 'center' }}>Update your treasures info.</p>
                </header>

                <form onSubmit={handleSave} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
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
                                <span style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>No photo</span>
                            </div>
                        )}

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
                                <span>📷</span> Retake
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
                                <span>📁</span> Replace
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>Item Name *</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Item name"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="input-group" style={{ width: '100%' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>Location *</label>
                        <input
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Where is it?"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>Category</label>
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
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '4px',
                                    background: 'var(--primary-rich-dark)',
                                    border: '1px solid var(--border-ui)',
                                    color: 'white'
                                }}
                            >
                                <option value="">Uncategorized</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                                <option value="new">+ Create New...</option>
                            </select>
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
                            width: '100%'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent-cyan-highlight)' }}>New Category</span>
                                <button type="button" onClick={() => setShowNewCategoryForm(false)} style={{ background: 'none', border: 'none', color: 'white' }}>✕</button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ fontSize: '1.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-ui)', borderRadius: '8px' }}>
                                    {newCategoryIcon}
                                </button>
                                <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Name" style={{ flex: 1 }} />
                            </div>
                            {showEmojiPicker && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button key={emoji} type="button" onClick={() => { setNewCategoryIcon(emoji); setShowEmojiPicker(false); }} style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}>{emoji}</button>
                                    ))}
                                </div>
                            )}
                            <button type="button" className="btn" onClick={handleCreateCategory}>Save Category</button>
                        </div>
                    )}

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
                            marginBottom: '1.5rem'
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
                                            defaultValue={jurisdictionCountry ? { name: jurisdictionCountry, id: countryId } as any : undefined}
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
                                            defaultValue={jurisdictionState ? { name: jurisdictionState, id: stateId } as any : undefined}
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
                                        defaultValue={jurisdictionCity ? { name: jurisdictionCity } as any : undefined}
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

                    <div className="input-group" style={{ width: '100%' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-medium)' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Notes"
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

                    <button type="submit" className="btn" disabled={isSaving || !title || !location}>
                        {isSaving ? 'Updating...' : 'Save Changes 🛡️'}
                    </button>

                    <button type="button" className="btn auth-link" onClick={() => navigate('/inventory')}>
                        Cancel
                    </button>
                </form>
            </section>
            <BrandFooter />
        </main>
    );
};

export default EditItemPage;
