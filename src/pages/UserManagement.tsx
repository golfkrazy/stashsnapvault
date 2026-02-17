import React, { useEffect, useState } from "react";
import "./UserManagement.css";
import supabase from "../supabase";
import { UserProfile } from "../supabase/types";
import { useNavigate } from "react-router-dom";

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .rpc("get_all_users_admin");

            if (error) {
                console.warn("RPC failed, falling back to direct query:", error);
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from("user_profiles")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (fallbackError) throw fallbackError;
                setUsers(fallbackData || []);
            } else {
                setUsers(data || []);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-management">
            <div className="back-link" onClick={() => navigate("/admin")}>
                🏠 Back to Dashboard
            </div>

            <header className="management-header">
                <h1>User Management</h1>
                <p className="subtitle">View and manage all registered vault users.</p>
            </header>

            <div className="glass-card table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Provider</th>
                            <th>Role</th>
                            <th>Subscription</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                                    <p style={{ marginTop: '1rem' }}>Accessing user ledgers...</p>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                                    No users found in the vault.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-name-wrapper">
                                            <div className="user-name">
                                                {user.first_name || user.last_name
                                                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                                    : "Anonymous User"}
                                            </div>
                                            <div className="user-tooltip">
                                                <div className="tooltip-item">
                                                    <span className="tooltip-label">Phone</span>
                                                    <span className="tooltip-value">{user.phone_number || "Not provided"}</span>
                                                </div>
                                                <div className="tooltip-item">
                                                    <span className="tooltip-label">Location</span>
                                                    <span className="tooltip-value">
                                                        {user.city || user.state || user.country
                                                            ? `${user.city || ""}${user.city && user.state ? ", " : ""}${user.state || ""}${user.country ? ` (${user.country})` : ""}`
                                                            : "Not provided"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-email">{user.email || "No Email"}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            {user.email?.includes('gmail.com') || (user as any).provider === 'google' ? '🟢 Google' : '📧 Email'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-tag ${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`tier-tag ${user.subscription_tier}`}>
                                            {user.subscription_tier}
                                        </span>
                                    </td>
                                    <td>
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" title="Reset Password" onClick={() => alert('Sending Reset Link to ' + user.email)}>🔑</button>
                                            <button className="btn-icon warning" title="Ban User" onClick={() => confirm('Ban ' + user.email + '?')}>🚫</button>
                                            <button className="btn-icon danger" title="Delete User" onClick={() => confirm('Permanently delete ' + user.email + '?')}>🗑️</button>
                                        </div>
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

export default UserManagement;
