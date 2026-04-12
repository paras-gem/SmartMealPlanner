import React, { useState, useRef, useEffect } from "react";
import "./SmartMealPlanner.css";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import { plannerFeatures, sliderImages, moodOptions, plannerTrending } from "./data.js";

const SmartMealPlanner = ({
    user, onLoginClick, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick,
    onCommunityClick, isDark, toggleDarkMode, onRecipeClick, onProductsClick,
    onLogoutClick, isAIEnabled, toggleAI, saveAIMedia
}) => {
    const [mood, setMood] = useState("");
    const [suggestion, setSuggestion] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [recipes, setRecipes] = useState([]);
    const plannerRef = useRef(null);

    useEffect(() => {
        fetchRecipes();
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const fetchRecipes = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/recipes');
            const data = await res.json();
            setRecipes(data);
        } catch (err) {
            console.error("Failed to fetch recipes", err);
        }
    };
    const suggestMeal = () => {
        const moodLower = mood.toLowerCase().trim();
        if (!moodLower) return setSuggestion({ error: "Please enter a mood first! ✨" });

        const filtered = recipes.filter(r =>
            r.category?.toLowerCase() === moodLower ||
            r.title.toLowerCase().includes(moodLower)
        );
        if (filtered.length > 0) {
            const result = filtered[Math.floor(Math.random() * filtered.length)];
            setSuggestion(result);
            if (saveAIMedia) {
                saveAIMedia('MealPlan', result.imageURL || '', moodLower, { recipeId: result._id });
            }
        } else {
            setSuggestion({ error: "Couldn't find an exact match in our database. Try another mood! ✨" });
        }
    };

    const clearResult = () => {
        setMood("");
        setSuggestion(null);
    };

    const scrollToPlanner = () => {
        plannerRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleConnectGoogleCalendar = async () => {
        if (!user) return alert('Please login first!');
        try {
            const uid = user.firebaseUID || user.email;
            const res = await fetch(`http://localhost:5000/api/calendar/auth-url/${uid}`);
            const data = await res.json();
            if (data.url) {
                window.open(data.url, '_blank', 'width=600,height=600');
            }
        } catch (err) {
            console.error("Failed to get auth URL:", err);
        }
    };

    const handleSyncToGoogle = async (e, r) => {
        e.stopPropagation(); // Don't trigger the recipe click
        if (!user) return alert('Please login first!');
        
        try {
            const res = await fetch('http://localhost:5000/api/calendar/sync-individual', { // Reusing sync logic
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipeId: r._id,
                    recipeTitle: r.title,
                    date: new Date().toISOString().split('T')[0],
                    mealType: 'Planned Meal',
                    // Pass the identifier directly for non-family sync
                    userId: user.firebaseUID || user.email 
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Meal synced to your Google Calendar! 📅');
            } else {
                alert('Connection required or sync failed.');
            }
        } catch (err) {
            console.error("Sync Error:", err);
        }
    };

    const handleSavePreference = async (pref) => {
        if (!user) return alert('Please login to save preferences!');
        try {
            const identifier = user.firebaseUID || user.email;
            const res = await fetch(`http://localhost:5000/api/users/${identifier}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    mealPreference: pref,
                    // Map common terms to goal if applicable
                    ...(pref === 'Healthy' ? { 'profile.goal': 'Weight Loss' } : pref === 'Muscle' ? { 'profile.goal': 'Muscle Gain' } : {}) 
                })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
                alert(`Perfect! Your preferences are now set to ${pref}. 🥗`);
            }
        } catch (err) {
            console.error("Save Preference Error:", err);
        }
    };

    const isDiabetic = user?.healthConditions?.includes('diabetic');
    const subLevel = user?.subscriptionLevel || 'Basic';

    return (
        <div className={`smart-meal-planner animate-fade-in ${isDark ? "dark-mode" : ""}`}>
            <Header user={user}
                onLogoClick={onLogoClick}
                onContactClick={onContactClick}
                onAboutClick={onAboutClick}
                onSubscriptionClick={onSubscriptionClick}
                onCommunityClick={onCommunityClick}
                onProductsClick={onProductsClick}
                onFamilyClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'family' }))}
                onLogoutClick={onLogoutClick}
                isDark={isDark}
                toggleDarkMode={toggleDarkMode}
                isAIEnabled={isAIEnabled}
                toggleAI={toggleAI}
                actionButton={!user ? <button onClick={onLoginClick} className="login-btn">Login</button> : null}
                activePage="home"
            />

            <section className="hero">
                <div className="hero-slider">
                    {sliderImages.map((slide, index) => (
                        <div
                            key={index}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${slide.url})` }}
                        >
                            <div className="hero-overlay"></div>
                        </div>
                    ))}
                </div>
                <div className="hero-content">
                    <h2 key={`title-${currentSlide}`} className="animate-hero-title">
                        {sliderImages[currentSlide].title} ≎
                    </h2>
                    <p key={`text-${currentSlide}`} className="animate-hero-text">
                        {sliderImages[currentSlide].subtitle}
                    </p>
                    <button onClick={scrollToPlanner} className="cta-button animate-hero-btn">
                        <span>Start Planning</span>
                    </button>
                    <div className="slider-dots">
                        {sliderImages.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            ></span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="features">
                {plannerFeatures.map((feature, index) => (
                    <div
                        key={index}
                        className="card animate-fade-up"
                        style={{ animationDelay: `${(index + 1) * 0.2}s` }}
                    >
                        <h3>{feature.icon} {feature.title}</h3>
                        <p>{feature.desc}</p>
                    </div>
                ))}
            </section>

            <section className="trending-section animate-fade-in" style={{ padding: '0 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 className="section-title">Trending This Week ⍋</h2>
                <div className="trending-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {plannerTrending.map((item, idx) => (
                        <div key={idx} className="recipe-card" onClick={() => { if (onProductsClick) onProductsClick(); }}>
                            <div className="recipe-img-wrapper">
                                <img src={item.image} alt={item.title} />
                            </div>
                            <div className="recipe-content">
                                <span className="recipe-badge">{item.icon} Trending</span>
                                <h4>{item.title}</h4>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '15px' }}>{item.desc}</p>
                                <button className="view-details-btn">View All Products →</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="categories-section animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-light)', margin: '40px auto', maxWidth: '800px', borderRadius: '16px' }}>
                <h2 className="section-title" style={{ marginBottom: '15px' }}>Explore All Recipes ≎</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Discover our complete collection of delicious and healthy meals, tailored to your dietary needs and goals.</p>
                <button
                    onClick={() => { if (onProductsClick) onProductsClick(); }}
                    className="cta-button"
                    style={{ background: 'var(--primary-color, #6dba5f)', color: 'var(--primary-text)', padding: '15px 40px', fontSize: '1.1rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    View All Products & Recipes →
                </button>
                                <div className="goal-selection" style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Simplified selection chips here */}
                </div>
            </section>

            {isAIEnabled && (
                <section ref={plannerRef} className="planner animate-fade-in" id="planner">
                    <div className="planner-container">
                        <h2>Quick Meal Suggestion</h2>
                        <div className="goal-selection" style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {["Healthy", "Family", "Veg", "Vegan", "Muscle"].map(goal => (
                                <button
                                    key={goal}
                                    onClick={() => handleSavePreference(goal)}
                                    className="filter-chip"
                                    style={{ 
                                        padding: '8px 16px', 
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        background: user?.mealPreference === goal ? 'var(--primary-color)' : 'transparent',
                                        color: user?.mealPreference === goal ? 'white' : 'inherit',
                                        border: '1.5px solid var(--border)'
                                    }}
                                >
                                    {goal === 'Healthy' ? '🥗' : goal === 'Family' ? '👨‍👩‍👧' : goal === 'Veg' ? '🥦' : goal === 'Vegan' ? '🌱' : '💪'} {goal}
                                </button>
                            ))}
                        </div>
                        <div className="input-group">
                            <div className="search-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search moods (e.g. Healthy, Sweet...)"
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    onKeyPress={(e) => e.key === "Enter" && suggestMeal()}
                                />
                                {isDropdownOpen && (
                                    <div className="mood-dropdown animate-pop-in">
                                        {moodOptions.map((option) => (
                                            <div
                                                key={option}
                                                className="mood-item"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setMood(option);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={suggestMeal} className="suggest-btn">Plan Meal</button>
                            {suggestion && <button onClick={clearResult} className="clear-btn">Clear</button>}
                        </div>

                        {suggestion && (
                            <div className="suggestion-result animate-pop-in">
                                {suggestion.error ? (
                                    <div className="suggestion-error">{suggestion.error}</div>
                                ) : (
                                    <div className="suggested-recipe-card" onClick={() => onRecipeClick(suggestion)}>
                                        <div className="suggested-img">
                                            <img src={suggestion.imageURL || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={suggestion.title} />
                                        </div>
                                        <div className="suggested-content">
                                            <div className="suggested-header">
                                                <h3>Today's Special: {suggestion.title}</h3>
                                                {user && (
                                                    <div className="sync-action">
                                                        {user.googleCalendarTokens?.refreshToken ? (
                                                            <button className="sync-icon-btn active" onClick={(e) => handleSyncToGoogle(e, suggestion)} title="Sync to Google Calendar">📅</button>
                                                        ) : (
                                                            <button className="sync-icon-btn" onClick={(e) => { e.stopPropagation(); handleConnectGoogleCalendar(); }} title="Connect Calendar">🔗</button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p>{suggestion.category}</p>
                                                {user && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleSavePreference(suggestion.category); }}
                                                        className="save-pref-btn"
                                                        title="Set as my default meal category"
                                                    >
                                                        ⭐ Set as Goal
                                                    </button>
                                                )}
                                            </div>
                                            <span className="view-link">View Full Recipe →</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SmartMealPlanner;
