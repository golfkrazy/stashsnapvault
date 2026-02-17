import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import supabase from "../supabase";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

const AdminDashboard: React.FC = () => {
    const { session } = useSession();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalItems: 0,
        totalCategories: 0,
    });
    const [loading, setLoading] = useState(true);
    const [reindexing, setReindexing] = useState(false);
    const [reindexProgress, setReindexProgress] = useState("");
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        icon: string;
        isConfirm: boolean;
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        icon: "🛡️",
        isConfirm: false
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            console.log("AdminDashboard: Fetching global stats...");
            try {
                // Try fetching using privileged RPC
                const { data: globalStats, error: globalError } = await supabase
                    .rpc('get_system_stats_admin');

                if (!globalError && globalStats && globalStats.length > 0) {
                    const stats = globalStats[0];
                    setStats({
                        totalUsers: Number(stats.total_users) || 0,
                        totalItems: Number(stats.total_items) || 0,
                        totalCategories: Number(stats.total_categories) || 0,
                    });
                } else {
                    console.warn("Global stats RPC failed, falling back to local counts:", globalError);
                    // 1. Get User Count (from profiles)
                    const { count: userCount } = await supabase
                        .from("user_profiles")
                        .select("*", { count: 'exact', head: true });

                    // 2. Get Item Count 
                    const { count: itemCount } = await supabase
                        .from("items")
                        .select("*", { count: 'exact', head: true });

                    // 3. Get Category Count
                    const { count: catCount } = await supabase
                        .from("categories")
                        .select("*", { count: 'exact', head: true });

                    setStats({
                        totalUsers: userCount || 0,
                        totalItems: itemCount || 0,
                        totalCategories: catCount || 0,
                    });
                }
            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchStats();
    }, [session, setStats]);

    const showAlert = (title: string, message: string, icon: string = "ℹ️") => {
        setModal({ isOpen: true, title, message, icon, isConfirm: false });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, icon: string = "⚠️") => {
        setModal({ isOpen: true, title, message, icon, isConfirm: true, onConfirm });
    };

    const handleSyncProfiles = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('sync_user_profiles_admin');
            if (error) throw error;
            const created = data?.[0]?.created_count || 0;
            showAlert("Sync Complete", `Profile sync complete! ${created} new profiles created.`, "🔄");
            // stats will refresh on re-render if we don't reload, but reload ensures fresh state
            setTimeout(() => window.location.reload(), 2000);
        } catch (err: any) {
            console.error("Sync failed:", err);
            showAlert("Sync Failed", err.message, "❌");
        } finally {
            setLoading(false);
        }
    };

    const handleReindex = async () => {
        if (!session) {
            showAlert("Auth Required", "You must be logged in to re-index items.", "🔐");
            return;
        }

        showConfirm(
            "Precision Re-Indexing",
            "This will regenerate AI embeddings for all items system-wide. Continue?",
            async () => {
                setReindexing(true);
                setReindexProgress("Checking system vault...");

                try {
                    console.log("AdminDashboard: Starting system-wide re-index...");
                    // ... rest of the logic ...
                    let itemsToProcess: any[] = [];
                    const rpcResult = await supabase.rpc('get_all_items_admin');

                    if (rpcResult.error) {
                        const { data: fallbackItems, error: fallbackError } = await supabase
                            .from('items')
                            .select('id, title, description, location, category:categories(name)');

                        if (fallbackError) throw fallbackError;
                        itemsToProcess = fallbackItems || [];
                    } else {
                        itemsToProcess = rpcResult.data || [];
                    }

                    if (!itemsToProcess || itemsToProcess.length === 0) {
                        showAlert("No Items", "No items found to index. Check database items table.", "📦");
                        setReindexing(false);
                        return;
                    }

                    let successCount = 0;
                    const totalToProcess = itemsToProcess.length;

                    for (let i = 0; i < totalToProcess; i++) {
                        const item = itemsToProcess[i];
                        if (!item) continue;
                        setReindexProgress(`Global Indexing ${i + 1}/${totalToProcess}: ${item.title || 'Untitled'}`);

                        try {
                            const categoryName = item.category_name || (item.category as any)?.name || 'Uncategorized';
                            const itemText = `${item.title || ''} (${categoryName}) - ${item.description || ''}`.trim();

                            const { data: itemEmbedData, error: itemEmbedError } = await supabase.functions.invoke('generate-embedding', {
                                body: { text: itemText, task: 'search_document' }
                            });

                            if (itemEmbedError) throw itemEmbedError;

                            let locEmbedData = null;
                            if (item.location && typeof item.location === 'string') {
                                const { data: lData, error: lError } = await supabase.functions.invoke('generate-embedding', {
                                    body: { text: item.location.trim(), task: 'search_document' }
                                });
                                if (!lError) locEmbedData = lData;
                            }

                            if (itemEmbedData?.embedding) {
                                const { error: updateError } = await supabase
                                    .from('items')
                                    .update({
                                        embedding: itemEmbedData.embedding,
                                        location_embedding: locEmbedData?.embedding || null
                                    })
                                    .eq('id', item.id);

                                if (updateError) throw updateError;
                                successCount++;
                            }

                        } catch (err) {
                            console.error(`Failed to index item ${item.id || i}:`, err);
                        }
                    }

                    showAlert("Intelligence Updated", `Global re-indexing complete! Successfully indexed ${successCount}/${totalToProcess} items.`, "🧠");

                } catch (error: any) {
                    console.error("Global Re-index failed:", error);
                    showAlert("Indexing Failed", error.message || 'Unknown error', "❌");
                } finally {
                    setReindexing(false);
                    setReindexProgress("");
                }
            },
            "🧠"
        );
    };

    return (
        <div className="admin-dashboard">
            <div className="back-link" onClick={() => navigate("/")}>
                🏠 Vault Home
            </div>

            <header className="dashboard-header">
                <h1>StashSnap Vault Command Center</h1>
                <p className="subtitle">Real-time system health and intelligence.</p>
            </header>

            <div className="admin-stats-grid">
                <div className="glass-card stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <span className="stat-label">Total Users</span>
                        <span className="stat-value">{loading ? "..." : stats.totalUsers}</span>
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <span className="stat-label">Data Items</span>
                        <span className="stat-value">{loading ? "..." : stats.totalItems}</span>
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-info">
                        <span className="stat-label">Active Categories</span>
                        <span className="stat-value">{loading ? "..." : stats.totalCategories}</span>
                    </div>
                </div>
            </div>

            <div className="admin-actions">
                <div
                    className="glass-card action-card premium-hover"
                    onClick={() => navigate("users")}
                >
                    <h3>👤 User Management</h3>
                    <p>Review user profiles, manage roles, and assist with account recovery or subscription tiers.</p>
                </div>

                <div
                    className="glass-card action-card premium-hover"
                    onClick={reindexing ? undefined : handleReindex}
                    style={{ cursor: reindexing ? 'wait' : 'pointer', opacity: reindexing ? 0.7 : 1 }}
                >
                    <h3>{reindexing ? '🧠 AI Processing...' : '🧠 System Health (AI)'}</h3>
                    <p>{reindexing ? reindexProgress : 'Generate Dual Embeddings for all items in the system.'}</p>
                </div>

                <div
                    className="glass-card action-card premium-hover"
                    onClick={() => navigate("subscriptions")}
                >
                    <h3>💳 Subscription Commander</h3>
                    <p>Track all active ledgers, monitor renewal dates (marked RED if soon), and manage tier statuses.</p>
                </div>

                <div
                    className="glass-card action-card premium-hover"
                    onClick={loading ? undefined : handleSyncProfiles}
                    style={{ cursor: loading ? 'wait' : 'pointer' }}
                >
                    <h3>🔄 Sync User Profiles</h3>
                    <p>Ensure all authentication users have active vault profiles and correct counts.</p>
                </div>
            </div>

            {/* Branded Admin Modal */}
            {modal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon">{modal.icon}</div>
                        <h2>{modal.title}</h2>
                        <p>{modal.message}</p>
                        <div className="modal-actions">
                            {modal.isConfirm && (
                                <button
                                    className="modal-btn secondary"
                                    onClick={() => setModal({ ...modal, isOpen: false })}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                className="modal-btn primary"
                                onClick={() => {
                                    setModal({ ...modal, isOpen: false });
                                    if (modal.onConfirm) modal.onConfirm();
                                }}
                            >
                                {modal.isConfirm ? "Proceed" : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
