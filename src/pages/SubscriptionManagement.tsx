import React, { useEffect, useState } from "react";
import "./UserManagement.css"; // Reuse table styles
import supabase from "../supabase";
import { UserProfile } from "../supabase/types";
import { useNavigate } from "react-router-dom";

const SubscriptionManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            // Fetch profiles with subscription data
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error("Error fetching subscriptions:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusType = (user: UserProfile) => {
        const tier = user.subscription_tier?.toLowerCase();
        const status = user.subscription_status?.toLowerCase();

        if (tier === 'admin') return 'Admin';
        if (tier === 'premium' && status === 'active') return 'Active';
        if (status === 'canceled') return 'Canceled';
        return 'Inactive / Free';
    };

    const isExpiringSoon = (dateStr: string | undefined) => {
        if (!dateStr) return false;
        const renewalDate = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    const filteredUsers = users.filter(user => {
        const status = getStatusType(user).toLowerCase();
        const matchesFilter = filter === "all" || status.includes(filter);
        const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="user-management">
            <div className="back-link" onClick={() => navigate("/admin")}>
                🏠 Back to Command Center
            </div>

            <header className="management-header">
                <h1>Subscription Commander</h1>
                <p className="subtitle">Real-time monitoring of all vault active ledgers and renewals.</p>
            </header>

            <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input"
                    style={{ flex: 1, minWidth: '250px', background: 'var(--glass-bg)', border: '1px solid var(--border-ui)', borderRadius: '12px', padding: '0.8rem 1.2rem', color: 'white' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Filter:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="glass-select"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-ui)', borderRadius: '12px', padding: '0.8rem', color: 'white' }}
                    >
                        <option value="all">All Ledgers</option>
                        <option value="active">Active Premium</option>
                        <option value="canceled">Canceled</option>
                        <option value="inactive">Inactive / Free</option>
                    </select>
                </div>
            </div>

            <div className="glass-card table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Tier</th>
                            <th>Status</th>
                            <th>Renewal Date</th>
                            <th>Stripe ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                                    <p style={{ marginTop: '1rem' }}>Decrypting subscription logs...</p>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                    No matching subscriptions found.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-name">
                                            {user.first_name || user.last_name
                                                ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                                : "Vault Guest"}
                                        </div>
                                        <div className="user-email" style={{ fontSize: '0.8rem', opacity: 0.6 }}>{user.email}</div>
                                    </td>
                                    <td>
                                        <span className={`tier-tag ${user.subscription_tier}`}>
                                            {user.subscription_tier || 'Free'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.subscription_status?.toLowerCase() || 'inactive'}`}>
                                            {getStatusType(user)}
                                        </span>
                                    </td>
                                    <td style={{
                                        color: isExpiringSoon((user as any).subscription_renewal_date) ? '#ff4d4d' : 'inherit',
                                        fontWeight: isExpiringSoon((user as any).subscription_renewal_date) ? 'bold' : 'normal'
                                    }}>
                                        {(user as any).subscription_renewal_date
                                            ? new Date((user as any).subscription_renewal_date).toLocaleDateString()
                                            : 'N/A'}
                                        {isExpiringSoon((user as any).subscription_renewal_date) && " ⚠️"}
                                    </td>
                                    <td>
                                        <code style={{ fontSize: '0.75rem', opacity: 0.5 }}>{(user as any).stripe_customer_id || '---'}</code>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriptionManagement;
