import React, { useState } from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import './Subscription.css';
import plans from './subscriptionPlans.json';

const Subscription = ({ user, onUpdateUser, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick, onCommunityClick, isDark, toggleDarkMode }) => {
    const [submitting, setSubmitting] = useState(null);
    const [mockCard, setMockCard] = useState('');
    const [mockExpiry, setMockExpiry] = useState('');
    const [mockCVV, setMockCVV] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSelectPlan = (level) => {
        if (level === 'Basic') return;
        setSelectedPlan(level === selectedPlan ? null : level);
    };

    const handleStartTrial = async () => {
        if (!user) return alert('Please login first!');
        try {
            const response = await fetch(`http://localhost:5000/api/users/start-trial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, firebaseUID: user.firebaseUID })
            });
            if (response.ok) {
                const updatedUser = await response.json();
                if (onUpdateUser) onUpdateUser({ ...user, ...updatedUser, trialActive: true, createdAt: new Date().toISOString() });
                setSuccessMsg(`🎉 30-Day Free Trial activated! All recipes are now unlocked!`);
                setTimeout(() => setSuccessMsg(''), 6000);
            } else {
                const err = await response.json();
                alert("Could not start trial: " + (err.message || 'Unknown error'));
            }
        } catch (err) { alert("Server connection error. Is the backend running?"); }
    };

    const handleUpgrade = async (level) => {
        if (!user) return alert('Please login first!');
        if (level === 'Basic') return;
        if (!mockCard || mockCard.length < 12) return alert('Enter a valid 12+ digit mock card number.');
        if (!mockExpiry) return alert('Enter expiry date (MM/YY).');
        if (!mockCVV || mockCVV.length < 3) return alert('Enter a 3-digit CVV.');

        setSubmitting(level);
        try {
            const uid = user.firebaseUID || 'undefined';
            const response = await fetch(`http://localhost:5000/api/users/${uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, subscriptionLevel: level })
            });
            if (response.ok) {
                const updatedUser = await response.json();
                if (onUpdateUser) onUpdateUser(updatedUser);
                setSuccessMsg(`🎉 Successfully upgraded to ${level} Plan!`);
                setSelectedPlan(null);
                setMockCard(''); setMockExpiry(''); setMockCVV('');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        } catch (err) { alert("Payment failed. Server error."); }
        setSubmitting(null);
    };

    return (
        <div className={`subscription-page animate-fade-in ${isDark ? "dark-mode" : ""}`}>
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
                activePage="subscription"
            />

            <div className="subscription-container">
                <h2>💎 Choose Your Plan</h2>
                <p>Unlock the full potential of SmartMeal</p>

                {successMsg && <div className="success-banner">{successMsg}</div>}

                <div className="plans-grid">
                    {plans.map((plan, idx) => {
                        const isActive = user?.subscriptionLevel === plan.level;
                        const isSelected = selectedPlan === plan.level;
                        return (
                            <div key={idx} className={`plan-card ${plan.popular ? 'popular' : ''} ${isActive ? 'active-plan' : ''}`}
                                style={{ '--plan-color': plan.color }}>
                                {plan.popular && <div className="popular-badge">Most Popular</div>}
                                {isActive && <div className="active-badge">✓ Your Plan</div>}

                                <h3 style={{ color: plan.color }}>{plan.tier}</h3>
                                <p className="plan-tagline">{plan.tagline}</p>

                                <div className="price">
                                    <strong>${plan.price}</strong>
                                    <span>/{plan.period}</span>
                                </div>

                                <ul className="features-list">
                                    {plan.features.map((feat, i) => (
                                        <li key={i}><span style={{ color: plan.color }}>✓</span> {feat}</li>
                                    ))}
                                </ul>

                                {plan.level === 'Basic' && (
                                    <button
                                        className="select-plan-btn"
                                        style={{ background: plan.color, marginTop: '15px' }}
                                        onClick={handleStartTrial}
                                    >
                                        Start 30-Day AI Trial 🌟
                                    </button>
                                )}

                                {plan.level !== 'Basic' && !isActive && (
                                    <>
                                        <button
                                            className="select-plan-btn"
                                            style={{ background: plan.color, marginTop: '15px' }}
                                            onClick={() => handleSelectPlan(plan.level)}
                                        >
                                            {isSelected ? '▲ Hide Payment' : plan.buttonText}
                                        </button>

                                        {isSelected && (
                                            <div className="payment-form animate-pop-in">
                                                <h4>💳 Payment Details</h4>
                                                <input type="text" placeholder="Card Number (mock: 1234 5678 9012 3456)" maxLength={19}
                                                    value={mockCard} onChange={e => setMockCard(e.target.value)} />
                                                <div className="payment-row">
                                                    <input type="text" placeholder="MM/YY" maxLength={5}
                                                        value={mockExpiry} onChange={e => setMockExpiry(e.target.value)} />
                                                    <input type="text" placeholder="CVV" maxLength={3}
                                                        value={mockCVV} onChange={e => setMockCVV(e.target.value)} />
                                                </div>
                                                <button
                                                    className="pay-btn"
                                                    style={{ background: plan.color }}
                                                    onClick={() => handleUpgrade(plan.level)}
                                                    disabled={submitting === plan.level}
                                                >
                                                    {submitting === plan.level ? 'Processing...' : `Pay $${plan.price}/mo →`}
                                                </button>
                                                <p className="mock-note">🔒 This is a simulated payment for demo purposes.</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isActive && (
                                    <div className="active-plan-badge">✅ Currently Active</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="community-feature-banner">
                    <h3>🌍 Community</h3>
                    <p>Share recipes, rate dishes, and connect with food lovers worldwide — available on all plans.</p>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
