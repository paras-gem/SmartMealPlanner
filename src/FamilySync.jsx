import React, { useState, useEffect, useRef } from 'react';
import Header from './Header.jsx';
import './FamilySync.css';

const FamilySync = ({ user, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick, onCommunityClick, isDark, toggleDarkMode }) => {
    const [familyCode, setFamilyCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [family, setFamily] = useState(null);
    const [newItem, setNewItem] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const pollRef = useRef(null);

    useEffect(() => {
        // 1. Initial Load: Check if user already belongs to a family
        const loadInitial = async () => {
            if (!user) return;
            const uid = user.firebaseUID || user.email;
            try {
                const res = await fetch(`http://localhost:5000/api/family/user/${uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setFamily(data);
                    setFamilyCode(data.familyCode);
                }
            } catch (err) { console.error("Auto-load family failed", err); }
        };

        loadInitial();
    }, [user]);

    const fetchFamily = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/family/${id}`);
            if (res.ok) {
                const data = await res.json();
                setFamily(data);
            }
        } catch (err) {
            console.error('Polling error:', err);
        }
    };

    useEffect(() => {
        if (family?._id) {
            pollRef.current = setInterval(() => fetchFamily(family._id), 3000);
            fetchSuggestions();
        }
        return () => clearInterval(pollRef.current);
    }, [family?._id]);

    const fetchSuggestions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/recipes');
            if (res.ok) {
                const data = await res.json();
                // Randomly pick some for family
                setSuggestions(data.sort(() => 0.5 - Math.random()).slice(0, 4));
            }
        } catch (err) {
            console.error('Failed to fetch family suggestions:', err);
        }
    };

    const handleCreate = async () => {
        if (!user) return alert('Please login first!');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/family/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.firebaseUID || user.email, name: user.name })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create group');

            setFamily(data);
            setFamilyCode(data.familyCode);
        } catch (err) {
            alert(err.message || 'Failed to create family group.');
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (!user) return alert('Please login first!');
        if (!joinCode.trim()) return alert('Enter a family code!');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/family/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.firebaseUID || user.email,
                    name: user.name,
                    familyCode: joinCode.toUpperCase()
                })
            });
            if (!res.ok) { const d = await res.json(); return alert(d.error); }
            const data = await res.json();
            setFamily(data);
        } catch (err) {
            alert('Invalid family code or server error.');
        }
        setLoading(false);
    };

    const handleAddItem = async () => {
        if (!newItem.trim()) return;
        const updatedList = [...(family.sharedGroceryList || []), { item: newItem, addedBy: user.name, checked: false }];
        try {
            const res = await fetch(`http://localhost:5000/api/family/${family._id}/grocery`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sharedGroceryList: updatedList })
            });
            const updated = await res.json();
            setFamily(updated);
            setNewItem('');
        } catch (err) {
            console.error('Add item error:', err);
        }
    };

    const handleToggleItem = async (idx) => {
        const updatedList = family.sharedGroceryList.map((item, i) =>
            i === idx ? { ...item, checked: !item.checked } : item
        );
        const res = await fetch(`http://localhost:5000/api/family/${family._id}/grocery`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sharedGroceryList: updatedList })
        });
        const updated = await res.json();
        setFamily(updated);
    };

    const handleInviteByEmail = async () => {
        if (!inviteEmail.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/family/${family._id}/add-member-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail.trim() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to invite user');

            setFamily(data);
            setInviteEmail('');
            alert('Member added successfully! ✨');
        } catch (err) {
            alert(err.message);
        }
        setLoading(false);
    };

    const handleConnectGoogleCalendar = async () => {
        if (!user) return alert('Please login first!');
        try {
            const uid = user.firebaseUID || user.email;
            const res = await fetch(`http://localhost:5000/api/calendar/auth-url/${uid}`);
            const data = await res.json();
            if (data.url) {
                // Open auth URL in a new window
                window.open(data.url, '_blank', 'width=600,height=600');
            }
        } catch (err) {
            console.error("Failed to get auth URL:", err);
        }
    };

    const handleSyncFamilyToGoogle = async (meal) => {
        if (!family) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/calendar/sync-family', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    familyId: family._id,
                    recipeId: meal.id,
                    recipeTitle: meal.item,
                    date: new Date().toISOString().split('T')[0], // For demo, using today. In real use, would pick a date.
                    mealType: 'Dinner'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Family Meal synced to Google Calendar! 📅');
            } else {
                alert('Sync partially failed or family members have not connected. Check console.');
            }
        } catch (err) {
            console.error("Sync Error:", err);
        }
        setLoading(false);
    };

    return (
        <div className={`family-sync-page animate-fade-in ${isDark ? 'dark-mode' : ''}`}>
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
                activePage="family"
            />

            <div className="family-container">
                <h2>👨‍👩‍👧 Family Sync</h2>
                <p>Create or join a family group to share grocery lists and meal plans in real time.</p>

                {!family ? (
                    <div className="family-setup">
                        <div className="family-option-card">
                            <h3>Create a Family Group</h3>
                            <p>Start a new family group and share the code with your family.</p>
                            <button className="family-btn primary" onClick={handleCreate} disabled={loading}>
                                {loading ? 'Creating...' : '+ Create Group'}
                            </button>
                        </div>
                        <div className="family-divider">or</div>
                        <div className="family-option-card">
                            <h3>Join Existing Group</h3>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                placeholder="Enter family code (e.g. A1B2C3D4)"
                                className="family-input"
                            />
                            <button className="family-btn secondary" onClick={handleJoin} disabled={loading}>
                                {loading ? 'Joining...' : 'Join Group →'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="family-dashboard">
                        <div className="family-info-bar">
                            <div className="info-main">
                                <strong>Family Code:</strong>
                                <span className="family-code-badge">{family?.familyCode}</span>
                                <small>(Share this with your family)</small>
                            </div>
                            <div className="info-members">
                                <strong>Members:</strong> {family?.members?.map(m => m.name).join(', ')}
                            </div>
                            <div className="google-sync-controls">
                                {user?.googleCalendarTokens?.refreshToken ? (
                                    <span className="sync-badge connected">Google Calendar Connected ✅</span>
                                ) : (
                                    <button className="family-btn google-btn" onClick={handleConnectGoogleCalendar}>
                                        🔗 Connect Google Calendar
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grocery-section">
                            <h3>🛒 Shared Grocery List</h3>
                            <div className="grocery-input-row">
                                <input
                                    type="text"
                                    value={newItem}
                                    onChange={e => setNewItem(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleAddItem()}
                                    placeholder="Add an item (e.g. 2kg Tomatoes)..."
                                    className="family-input"
                                />
                                <button className="family-btn primary" onClick={handleAddItem}>Add</button>
                            </div>

                            <ul className="grocery-list">
                                {(family?.sharedGroceryList || []).map((item, idx) => (
                                    <li key={idx} className={`grocery-item ${item.checked ? 'checked' : ''}`}>
                                        <div className="item-details" onClick={() => handleToggleItem(idx)}>
                                            <span className="check-icon">{item.checked ? '✓' : '○'}</span>
                                            <span className="item-name">{item.item}</span>
                                            <span className="item-by">by {item.addedBy}</span>
                                        </div>
                                        {user?.googleCalendarTokens?.refreshToken && (
                                            <button className="mini-sync-btn" onClick={() => handleSyncFamilyToGoogle(item)} title="Sync to Family Calendar">📅</button>
                                        )}
                                    </li>
                                ))}
                                {(!family?.sharedGroceryList || family.sharedGroceryList.length === 0) && (
                                    <p className="empty-list">No items yet. Add your first grocery item above!</p>
                                )}
                            </ul>
                            <small style={{ opacity: 0.6, display: 'block', marginTop: '10px' }}>🔄 List auto-refreshes every 10 seconds</small>
                        </div>

                        <div className="family-recommendations" style={{ marginTop: '30px' }}>
                            <h3>🎯 Group Recommendations</h3>
                            <p>Recipes curated for your family group.</p>
                            <div className="family-recipe-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                {(suggestions || []).map(recipe => (
                                    <div key={recipe._id} className="family-recipe-card" style={{ background: 'var(--bg-main)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'recipe-details' }))}>
                                        <img src={recipe.imageURL} alt={recipe.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                        <div style={{ padding: '10px' }}>
                                            <h4 style={{ fontSize: '0.9rem', margin: '0 0 5px 0' }}>{recipe.title}</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--theme-color)' }}>{recipe.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FamilySync;
