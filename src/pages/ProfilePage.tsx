import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";
import { BrandHeader, BrandFooter, BrandErrorModal } from "../components/BrandComponents";
import "./ProfilePage.css";
import {
    CitySelect,
    CountrySelect,
    StateSelect,
    GetCountries,
    GetState,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { useStripeCheckout } from "../services/stripe";
import { TIERS, SUBSCRIPTION_TIERS } from "../constants/tiers";

interface Profile {
    first_name: string;
    last_name: string;
    bio: string;
    location: string;
    timezone: string;
    preferred_language: string;
    avatar_url: string;
    email: string;
    phone_number: string;
    city: string;
    state: string;
    country: string;
    role: string;
    subscription_tier?: string;
}

const LanguageSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const languages = [
        "English", "Spanish", "French", "German",
        "Italian", "Portuguese", "Dutch", "Russian",
        "Chinese (Simplified)", "Japanese", "Korean", "Arabic",
        "Hindi", "Turkish", "Polish", "Swedish"
    ];
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="stdropdown-container" ref={containerRef} style={{ position: 'relative' }}>
            <div
                className="stdropdown-input stsearch-box"
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
                <input
                    type="text"
                    value={value}
                    readOnly
                    style={{ cursor: 'pointer', flex: 1 }}
                />
                <div className="stdropdown-tools" style={{ paddingRight: '10px' }}>
                    <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="css-8mmkcg">
                        <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" fill="#cccccc"></path>
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="stdropdown-menu">
                    {languages.map((lang) => (
                        <div
                            key={lang}
                            className={`stdropdown-item ${value === lang ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(lang);
                                setIsOpen(false);
                            }}
                        >
                            {lang}
                        </div>
                    ))}
                </div>
            )}
        </div >
    );
};

const ProfilePage: React.FC = () => {
    const { session } = useSession();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [profile, setProfile] = useState<Profile>({
        first_name: "",
        last_name: "",
        bio: "",
        location: "",
        timezone: "",
        preferred_language: "English",
        avatar_url: "",
        email: session?.user?.email || "",
        phone_number: "",
        city: "",
        state: "",
        country: "",
        role: "user",
    });

    const [countryId, setCountryId] = useState<number>(0);
    const [stateId, setStateId] = useState<number>(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [brandModal, setBrandModal] = useState({ isOpen: false, title: "", message: "" });
    const { handleCheckout } = useStripeCheckout();

    const showError = (message: string, title: string = "Security Alert") => {
        setBrandModal({ isOpen: true, title, message });
    };

    useEffect(() => {
        if (!session) {
            navigate("/auth/sign-in");
            return;
        }
        fetchProfile();

        // CTRL+S to Save
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                // Find and submit the profile form
                const form = document.querySelector('.profile-form') as HTMLFormElement;
                if (form) {
                    form.requestSubmit();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [session, navigate]);

    // Ensure location field is kept in sync for backward compatibility
    useEffect(() => {
        const city = profile.city || "";
        const state = profile.state || "";
        const country = profile.country || "";
        const parts = [city, state, country].filter(p => p.trim() !== "");
        const newLocation = parts.join(", ");
        if (newLocation !== profile.location) {
            setProfile(prev => ({ ...prev, location: newLocation }));
        }
    }, [profile.city, profile.state, profile.country]);

    // Ensure stateId is found if countryId and profile.state are set
    useEffect(() => {
        const findStateId = async () => {
            if (countryId && profile.state && !stateId) {
                try {
                    const states = await GetState(countryId);
                    const matchedState = states.find((s: any) => s.name === profile.state);
                    if (matchedState) {
                        setStateId(matchedState.id);
                    }
                } catch (e) {
                    console.error("Error finding state ID:", e);
                }
            }
        };
        findStateId();
    }, [countryId, profile.state, stateId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", session?.user?.id)
                .single();

            if (error && error.code !== "PGRST116") throw error;

            if (data) {
                setProfile({
                    ...profile,
                    ...data,
                    email: session?.user?.email || "",
                });

                // Initialize dropdowns
                if (data.country) {
                    try {
                        const countries = await GetCountries();
                        const country = countries.find((c: any) => c.name === data.country);
                        if (country) {
                            setCountryId(country.id);

                            if (data.state) {
                                const states = await GetState(country.id);
                                const state = states.find((s: any) => s.name === data.state);
                                if (state) {
                                    setStateId(state.id);
                                }
                            }
                        }
                    } catch (err) {
                        console.warn("Dropdown init failed (expected during schema transitions):", err);
                    }
                }
            }
        } catch (error: any) {
            console.error("Error fetching profile:", error.message);
            showError("We couldn't retrieve your vault profile. Please check your connection and try again.", "Retrieval Error");
        } finally {
            setLoading(false);
        }
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUpdating(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${session?.user?.id}/${Math.random()}.${fileExt}`;

            // 1. Upload the file to the 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            // 3. Update the profile state with the new URL
            setProfile({ ...profile, avatar_url: publicUrl });

            // Using success styling if needed, but for now branding the alert message
            // alert("Photo uploaded! Don't forget to save your changes. ✨");
        } catch (error: any) {
            console.error("Avatar upload error:", error);
            if (error.message?.includes("Bucket not found")) {
                showError("The 'avatars' storage bucket was not found. Please ensure you've created it in the Supabase Dashboard (Storage > New Bucket > 'avatars' > Public).", "System Config Missing");
            } else {
                showError("Error uploading avatar: " + (error.message || "Unknown error"), "Upload Failed");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const { error } = await supabase.from("user_profiles").upsert({
                id: session?.user?.id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                bio: profile.bio,
                location: profile.location,
                timezone: profile.timezone,
                preferred_language: profile.preferred_language,
                avatar_url: profile.avatar_url,
                updated_at: new Date().toISOString(),
                phone_number: profile.phone_number,
                city: profile.city,
                state: profile.state,
                country: profile.country,
            });

            if (error) throw error;
            setShowSuccessModal(true);
        } catch (error: any) {
            showError("We encountered an issue updating your secure profile data: " + error.message, "Update Failed");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Gearing up your vault...</p>
            </div>
        );
    }

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <BrandHeader />
            <div className="glass-card profile-card" style={{ flex: 1, margin: '2rem auto' }}>
                <div className="profile-header">
                    <div className="avatar-section">
                        <div className="badge role-badge" style={{ position: 'absolute', right: '120%', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: '15px', border: '1px solid var(--accent-cyan-highlight)' }}>
                            <span className="label" style={{ fontSize: '0.75rem', color: 'var(--text-medium)', marginRight: '5px' }}>Role:</span>
                            <span className={`value ${profile.role}`} style={{ fontWeight: 'bold', color: 'white' }}>{profile.role.toUpperCase()}</span>
                        </div>

                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="avatar-image" />
                        ) : (
                            <div className="avatar-placeholder">
                                {profile.first_name?.[0] || profile.email?.[0] || "U"}
                            </div>
                        )}

                        <div className="badge tier-badge" style={{ position: 'absolute', left: '120%', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap', background: 'rgba(192, 132, 252, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(192, 132, 252, 0.4)', boxShadow: '0 0 15px rgba(192, 132, 252, 0.1)', display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', marginRight: '6px', filter: 'drop-shadow(0 0 5px rgba(192, 132, 252, 0.6))' }}>✨</span>
                            <span
                                className="value"
                                style={{
                                    color: (profile as any).subscription_tier?.toLowerCase() === 'free' ? '#ff4d4d' : '#c084fc',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    letterSpacing: '0.5px',
                                    textShadow: (profile as any).subscription_tier?.toLowerCase() === 'free' ? 'none' : '0 0 10px rgba(192, 132, 252, 0.3)'
                                }}
                            >
                                {(profile as any).subscription_tier?.toUpperCase() || 'FREE'}
                            </span>
                        </div>

                        {((profile as any).subscription_tier?.toLowerCase() !== 'premium' && profile.role?.toLowerCase() !== 'admin') && (
                            <button
                                type="button"
                                onClick={() => handleCheckout(TIERS[SUBSCRIPTION_TIERS.PREMIUM].priceId!, (msg) => showError(msg, "Checkout Error"))}
                                style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    left: '120%',
                                    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    fontWeight: '800',
                                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 'auto',
                                    margin: 0,
                                    lineHeight: '1.2',
                                    gap: '0.4rem',
                                    width: 'fit-content'
                                }}
                            >
                                ✨ Upgrade to Premium
                            </button>
                        )}

                        <label htmlFor="avatar-upload" className="upload-label">
                            {updating ? "Processing..." : "Change Photo"}
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={uploadAvatar}
                                disabled={updating}
                                style={{ display: "none" }}
                            />
                        </label>
                    </div>
                    <h2>Vault Profile</h2>
                    <p className="subtitle">Secure your personal identity</p>
                </div>

                <form onSubmit={handleUpdate} className="profile-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={profile.first_name || ""}
                                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                placeholder="John"
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={profile.last_name || ""}
                                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address (Read-only)</label>
                        <input type="email" value={profile.email} readOnly className="readonly-input" />
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            value={profile.bio || ""}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Country</label>
                            <CountrySelect
                                defaultValue={profile.country ? { name: profile.country, id: countryId } as any : undefined}
                                onChange={(e: any) => {
                                    setCountryId(e.id);
                                    setProfile(prev => ({ ...prev, country: e.name, state: "", city: "" }));
                                    setStateId(0);
                                }}
                                placeHolder="Select Country"
                                containerClassName="country-selector-container"
                                inputClassName="country-selector-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>State/Province</label>
                            <StateSelect
                                countryid={countryId}
                                key={`state-${countryId}-${countryId ? 'active' : 'inactive'}`}
                                defaultValue={profile.state ? { name: profile.state, id: stateId } as any : undefined}
                                onChange={(e: any) => {
                                    setStateId(e.id);
                                    setProfile(prev => ({ ...prev, state: e.name, city: "" }));
                                }}
                                placeHolder="Select State"
                                containerClassName="country-selector-container"
                                inputClassName="country-selector-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <CitySelect
                                countryid={countryId}
                                stateid={stateId}
                                key={`city-${countryId}-${stateId}`}
                                defaultValue={profile.city ? { name: profile.city } as any : undefined}
                                onChange={(e: any) => {
                                    setProfile(prev => ({ ...prev, city: e.name }));
                                }}
                                placeHolder="Select City"
                                containerClassName="country-selector-container"
                                inputClassName="country-selector-input"
                            />
                        </div>
                        <div className="form-group">
                            <div className="form-group">
                                <label>Preferred Language</label>
                                <LanguageSelect
                                    value={profile.preferred_language}
                                    onChange={(value) => setProfile({ ...profile, preferred_language: value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn primary" disabled={updating}>
                            {updating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            <BrandFooter />

            {/* Brand Error Modal */}
            <BrandErrorModal
                isOpen={brandModal.isOpen}
                onClose={() => setBrandModal({ ...brandModal, isOpen: false })}
                title={brandModal.title}
                message={brandModal.message}
            />

            {/* Custom Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'rgba(17, 26, 46, 0.95)',
                        border: '1px solid var(--accent-cyan-highlight)',
                        borderRadius: '24px',
                        padding: '3rem',
                        textAlign: 'center',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 0 50px rgba(0, 198, 255, 0.2)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
                        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>All Set!</h2>
                        <p style={{ color: 'var(--text-medium)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Your profile has been successfully updated and secured in the vault.
                        </p>
                        <button
                            className="btn primary"
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate("/inventory");
                            }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--accent-electric-blue), var(--primary-deep-navy))',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ProfilePage;
