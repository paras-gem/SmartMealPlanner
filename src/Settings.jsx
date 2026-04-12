import React, { useState } from "react";
import "./Settings.css";
import Header from "./Header.jsx";
import { useTheme } from "./ThemeContext.jsx";

const THEME_PALETTES = [
    { name: "Forest Green", color: "#6dba5f" },
    { name: "Ocean Blue", color: "#3b82f6" },
    { name: "Sunset Orange", color: "#f97316" },
    { name: "Royal Purple", color: "#a855f7" },
    { name: "Cherry Red", color: "#ef4444" },
    { name: "Golden Yellow", color: "#eab308" },
    { name: "Deep Teal", color: "#14b8a6" },
    { name: "Rose Pink", color: "#ec4899" },
];

const MEAL_SUGGESTIONS = ["Veg", "Non-Veg", "Vegan", "Keto", "Mediterranean", "High-Protein", "Low-Carb"];

const Settings = ({ user, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick, onCommunityClick, isDark, toggleDarkMode, isAIEnabled, toggleAI, onUpdateUser }) => {
    const [settings, setSettings] = useState({
        themeColor: user?.themeColor || localStorage.getItem("themeColor") || "#6dba5f",
        fontSize: user?.fontSize || "medium",
        isAIEnabled: isAIEnabled,
        isDarkMode: isDark,
        name: user?.name || "",
        email: user?.email || "",
        newPassword: "",
        confirmPassword: "",
        allergies: user?.allergies?.join(", ") || "",
        mealPreference: user?.mealPreference || "Veg",
    });

    React.useEffect(() => {
        if (user) {
            setSettings(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                themeColor: user.themeColor || prev.themeColor,
                fontSize: user.fontSize || prev.fontSize,
                allergies: user.allergies?.join(", ") || prev.allergies,
                mealPreference: user.mealPreference || prev.mealPreference,
            }));
        }
    }, [user]);

    const [family, setFamily] = useState(null);
    React.useEffect(() => {
        const loadSettingsFamily = async () => {
            if (!user) return;
            const uid = user.firebaseUID || user.email;
            try {
                const res = await fetch(`http://localhost:5000/api/family/user/${uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setFamily(data);
                }
            } catch (err) { console.error("Settings family load error:", err); }
        };
        loadSettingsFamily();
    }, [user]);

    const [message, setMessage] = useState({ text: "", type: "" });
    const { setThemeColor } = useTheme();

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        if (field === "themeColor" && window.ThemeEngine) window.ThemeEngine.setColor(value);
    };

    const showMsg = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    const handleSaveProfile = async () => {
        if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
            return showMsg("Passwords do not match! ❌", "error");
        }
        try {
            const identifier = user?.firebaseUID || user?.email;
            const payload = {
                email: settings.email || user?.email,
                name: settings.name,
                allergies: settings.allergies.split(",").map(a => a.trim()).filter(a => a),
                mealPreference: settings.mealPreference,
                ...(settings.newPassword ? { password: settings.newPassword } : {})
            };

            console.log("[Settings] Saving profile:", identifier, payload);
            const res = await fetch(`http://localhost:5000/api/users/${identifier}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const resBody = await res.json();
            if (res.ok) {
                if (onUpdateUser) onUpdateUser(resBody);
                showMsg("Profile saved! ✨");
            } else {
                showMsg(`Failed to save: ${resBody.error || resBody.message} ❌`, "error");
            }
        } catch (err) {
            console.error("[Settings] Fetch error:", err);
            showMsg("Server error. ❌", "error");
        }
    };

    const handleSaveAppearance = async () => {
        try {
            const identifier = user?.firebaseUID || user?.email;
            const res = await fetch(`http://localhost:5000/api/users/${identifier}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user?.email,
                    themeColor: settings.themeColor,
                    fontSize: settings.fontSize
                })
            });
            if (res.ok) {
                const updated = await res.json();
                if (onUpdateUser) onUpdateUser(updated);
                showMsg("Appearance updated! 🎨");
            }
        } catch { showMsg("Failed to update appearance. ❌", "error"); }
    };

    const handleSaveAI = async () => {
        try {
            const identifier = user?.firebaseUID || user?.email;
            const res = await fetch(`http://localhost:5000/api/users/${identifier}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user?.email,
                    isAIEnabled: settings.isAIEnabled
                })
            });
            if (res.ok) {
                const updated = await res.json();
                if (onUpdateUser) onUpdateUser(updated);
                showMsg("AI preferences saved! 🤖");
            }
        } catch { showMsg("Failed to save AI settings. ❌", "error"); }
    };

    return (
        <div className={`settings-page animate-fade-in ${isDark ? "dark-mode" : ""}`}>
            <Header user={user}
                onLogoClick={onLogoClick}
                onContactClick={onContactClick}
                onAboutClick={onAboutClick}
                onSubscriptionClick={onSubscriptionClick}
                onCommunityClick={onCommunityClick}
                onProductsClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'products' }))}
                onFamilyClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'family' }))}
                isDark={isDark}
                toggleDarkMode={toggleDarkMode}
                activePage="settings"
                actionButton={<span className="user-badge">{user?.name?.charAt(0) || "U"}</span>}
            />

            <div className="settings-container full-page">
                {/* Banner */}
                <div className="settings-header-banner">
                    <div className="banner-avatar">{user?.name?.charAt(0) || "U"}</div>
                    <div className="banner-info">
                        <h2>{user?.name || "User"}</h2>
                        <span className="plan-badge">{user?.subscriptionLevel || "Basic"} Plan</span>
                    </div>
                </div>

                {message.text && (
                    <div className={`settings-message ${message.type}`}>{message.text}</div>
                )}

                {/* ── PROFILE ───────────────────────────────── */}
                <section className="settings-section" id="profile">
                    <div className="section-heading"><span>👤</span> Profile Details</div>
                    <p className="section-sub">Update your account information and preferences.</p>
                    <div className="settings-grid">
                        <div className="form-field">
                            <label>Full Name</label>
                            <input type="text" value={settings.name} onChange={e => handleChange("name", e.target.value)} placeholder="Your name" />
                        </div>
                        <div className="form-field">
                            <label>Email Address</label>
                            <input type="email" value={settings.email} onChange={e => handleChange("email", e.target.value)} placeholder="your@email.com" />
                        </div>
                        <div className="form-field">
                            <label>New Password</label>
                            <input type="password" value={settings.newPassword} onChange={e => handleChange("newPassword", e.target.value)} placeholder="Leave blank to keep current" />
                        </div>
                        <div className="form-field">
                            <label>Confirm Password</label>
                            <input type="password" value={settings.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} placeholder="Re-enter new password" />
                        </div>
                        <div className="form-field full-width">
                            <label>Allergies <span>(comma separated)</span></label>
                            <input type="text" value={settings.allergies} onChange={e => handleChange("allergies", e.target.value)} placeholder="e.g. peanuts, dairy, gluten" />
                        </div>
                        <div className="form-field full-width">
                            <label>Meal Preference</label>
                            <div className="chip-group">
                                {MEAL_SUGGESTIONS.map(m => (
                                    <button key={m} className={`chip ${settings.mealPreference === m ? "active" : ""}`} onClick={() => handleChange("mealPreference", m)}>{m}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button className="save-btn" onClick={handleSaveProfile}>Save Profile</button>
                </section>

                <div className="settings-divider" />

                {/* ── APPEARANCE ────────────────────────────── */}
                <section className="settings-section" id="appearance">
                    <div className="section-heading"><span>🎨</span> Appearance</div>
                    <p className="section-sub">Customize the look and feel of SmartMeal.</p>

                    <div className="form-field">
                        <label>Theme Color</label>
                        <div className="color-palette-grid">
                            {THEME_PALETTES.map(p => (
                                <button
                                    key={p.color}
                                    className={`color-swatch ${settings.themeColor === p.color ? "selected" : ""}`}
                                    style={{ background: p.color }}
                                    onClick={() => handleChange("themeColor", p.color)}
                                    title={p.name}
                                />
                            ))}
                            <input
                                type="color"
                                value={settings.themeColor}
                                onChange={e => handleChange("themeColor", e.target.value)}
                                title="Custom Color"
                                className="custom-color-dot"
                            />
                        </div>
                        <p className="hint">Selected: <span style={{ color: settings.themeColor, fontWeight: "bold" }}>{settings.themeColor}</span></p>
                    </div>

                    <div className="form-field">
                        <label>Font Size</label>
                        <div className="size-group">
                            {["small", "medium", "large"].map(s => (
                                <button key={s} className={`size-btn ${settings.fontSize === s ? "active" : ""}`} onClick={() => handleChange("fontSize", s)}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-field toggle-row-inline">
                        <label>Dark Mode</label>
                        <label className="switch">
                            <input type="checkbox" checked={isDark} onChange={() => { toggleDarkMode(); handleChange("isDarkMode", !isDark); }} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <button className="save-btn" onClick={handleSaveAppearance}>Save Appearance</button>
                </section>

                <div className="settings-divider" />

                {/* ── AI ────────────────────────────────────── */}
                <section className="settings-section" id="ai">
                    <div className="section-heading"><span>🤖</span> NutriBot AI</div>
                    <p className="section-sub">Manage your AI assistant preferences.</p>
                    <div className="toggle-row">
                        <div>
                            <strong>NutriBot Assistant</strong>
                            <p>Enable the floating AI chat assistant on every page.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={settings.isAIEnabled} onChange={() => { handleChange("isAIEnabled", !settings.isAIEnabled); toggleAI(); }} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <button className="save-btn" onClick={handleSaveAI}>Save AI Settings</button>
                </section>



                {/* ── SUBSCRIPTION ──────────────────────────── */}
                <section className="settings-section" id="subscription">
                    <div className="section-heading"><span>💎</span> Your Plan</div>
                    <p className="section-sub">Current plan: <strong style={{ color: "var(--accent)" }}>{user?.subscriptionLevel || "Basic"}</strong></p>
                    <div className="upgrade-cta">
                        <p>Unlock Family Sync, Advanced AI, and more with a Premium plan.</p>
                        <button className="save-btn" onClick={onSubscriptionClick}>View Premium Plans →</button>
                    </div>
                </section>

                <div className="settings-divider" />

                {/* ── FAMILY GROUP ─────────────────────────── */}
                <section className="settings-section" id="family-group">
                    <div className="section-heading"><span>👨‍👩‍👧</span> Family Group</div>
                    <p className="section-sub">View and manage your connected family members.</p>

                    {family ? (
                        <div className="family-settings-card" style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '15px' }}>
                            <div style={{ marginBottom: '15px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                Family Code: <span style={{ color: 'var(--theme-color)', background: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '8px', marginLeft: '8px' }}>{family?.familyCode}</span>
                            </div>
                            <div className="family-members-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {family?.members?.map((m, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                                        <div style={{ width: '30px', height: '30px', background: 'var(--theme-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                            {m.name?.charAt(0) || 'U'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{m.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email || 'Group Member'}</div>
                                        </div>
                                        {m.firebaseUID === family.createdBy && <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>Admin</span>}
                                    </div>
                                ))}
                            </div>
                            <button className="save-btn" style={{ marginTop: '20px' }} onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'family' }))}>
                                Manage in Family Sync →
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '15px', color: 'var(--text-muted)' }}>
                            <p>You are not currently in a family group.</p>
                            <button className="save-btn" style={{ marginTop: '15px' }} onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'family' }))}>
                                Set up Family Sync →
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Settings;
