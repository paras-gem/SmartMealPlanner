import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';
import './SmartMealPlanner.css';

const CATEGORIES = [
    { key: 'All', icon: '🍽️', label: 'All Recipes' },
    { key: 'Veg', icon: '🥗', label: 'Vegetarian' },
    { key: 'Non-Veg', icon: '🍗', label: 'Non-Vegetarian' },
    { key: 'Vegan', icon: '🌱', label: 'Vegan' },
    { key: 'Sweet', icon: '🍩', label: 'Desserts & Sweets' },
];

const Products = ({
    user, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick,
    onCommunityClick, onProductsClick, onFamilyClick, isDark, toggleDarkMode, onRecipeClick
}) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');
    const [fetchSource, setFetchSource] = useState('');

    useEffect(() => {
        fetchByCategory(filterCategory);
    }, [filterCategory]);

    const fetchByCategory = async (category) => {
        try {
            setLoading(true);
            setRecipes([]);

            // First try live Spoonacular via our pipeline
            const spoonRes = await fetch(
                `http://localhost:5000/api/recipes/by-category?category=${encodeURIComponent(category)}&number=12`
            );
            if (spoonRes.ok) {
                const spoonData = await spoonRes.json();
                if (spoonData.length > 0) {
                    setRecipes(spoonData);
                    setFetchSource('🌐 Live from Spoonacular');
                    return;
                }
            }

            // Fallback to local DB
            const dbRes = await fetch(
                `http://localhost:5000/api/recipes${category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`
            );
            if (!dbRes.ok) {
                const dbErr = await dbRes.json();
                throw new Error(dbErr.error || 'Database fetch failed');
            }
            const dbData = await dbRes.json();
            setRecipes(Array.isArray(dbData) ? dbData : []);
            setFetchSource('📂 From Local Database');
        } catch (err) {
            console.error("Failed to fetch recipes:", err);
            setRecipes([]);
            setFetchSource('❌ Connection Error');
        } finally {
            setLoading(false);
        }
    };

    const subLevel = user?.subscriptionLevel || 'Basic';
    const isDiabetic = user?.healthConditions?.includes('diabetic');

    return (
        <div className={`products-page animate-fade-in ${isDark ? 'dark-mode' : ''}`} style={{ minHeight: '100vh', paddingTop: '80px' }}>
            <Header
                user={user}
                onLogoClick={onLogoClick}
                onContactClick={onContactClick}
                onAboutClick={onAboutClick}
                onSubscriptionClick={onSubscriptionClick}
                onCommunityClick={onCommunityClick}
                onProductsClick={onProductsClick}
                onFamilyClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'family' }))}
                isDark={isDark}
                toggleDarkMode={toggleDarkMode}
                activePage="products"
            />

            <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 className="section-title">Explore Recipes</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Browse our curated collection of healthy and delicious meals powered by Spoonacular.
                    </p>
                    {fetchSource && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginTop: '8px' }}>
                            {fetchSource}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    {/* ── CATEGORY SIDEBAR ─────────────────────────────────────────── */}
                    <div className="products-sidebar" style={{
                        width: '220px', flexShrink: 0, background: 'var(--bg-secondary)',
                        padding: '20px', borderRadius: '15px', position: 'sticky', top: '100px'
                    }}>
                        <h3 style={{ marginBottom: '15px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', fontSize: '1rem' }}>
                            Categories
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {CATEGORIES.map(cat => (
                                <li
                                    key={cat.key}
                                    onClick={() => setFilterCategory(cat.key)}
                                    style={{
                                        padding: '10px 14px',
                                        background: filterCategory === cat.key ? 'var(--primary-color)' : 'var(--bg-primary)',
                                        color: filterCategory === cat.key ? 'white' : 'inherit',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: filterCategory === cat.key ? 'bold' : 'normal',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── RECIPE GRID ───────────────────────────────────────────────── */}
                    <div style={{ flex: 1 }}>
                        {loading ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} style={{
                                        height: '280px', background: 'var(--bg-secondary)',
                                        borderRadius: '15px', animation: 'pulse 1.5s infinite'
                                    }} />
                                ))}
                            </div>
                        ) : (
                            <div className="recipe-grid">
                                {recipes.map((recipe) => {
                                    const isLocked = recipe.isPremium && subLevel === 'Basic';
                                    return (
                                        <div
                                            key={recipe._id}
                                            className={`recipe-card ${isLocked ? 'locked' : ''}`}
                                            onClick={() => onRecipeClick && onRecipeClick(recipe)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="recipe-img-wrapper">
                                                <img
                                                    src={recipe.imageURL || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                                                    alt={recipe.title}
                                                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"; }}
                                                />
                                                {isLocked && <div className="premium-lock">🔒 Pro Only</div>}
                                                {isDiabetic && recipe.diabeticFlag && (
                                                    <div className="health-flag">⚠️ High Sugar — {recipe.diabeticSafeQty}</div>
                                                )}
                                                {recipe.scrapedFromWeb && (
                                                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                                                        🌐 Live
                                                    </div>
                                                )}
                                            </div>
                                            <div className="recipe-content">
                                                <span className={`recipe-badge ${recipe.category?.toLowerCase().replace(/-/g, '')}`}>{recipe.category}</span>
                                                <h4>{recipe.title}</h4>
                                                <div className="recipe-meta">
                                                    <span>🔥 {typeof recipe.calories === 'number' ? Math.round(recipe.calories) : recipe.calories} kcal</span>
                                                    <span>⭐ {recipe.averageRating?.toFixed(1) || 'New'}</span>
                                                    {recipe.readyInMinutes && <span>⏱ {recipe.readyInMinutes} min</span>}
                                                </div>
                                                <button className="view-details-btn" disabled={isLocked}>
                                                    {isLocked ? 'Upgrade to View' : 'View Details →'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {recipes.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', borderRadius: '15px' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🍽️</div>
                                        <h3>No recipes found!</h3>
                                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Try a different category or check your connection.</p>
                                        <button className="save-btn" style={{ marginTop: '20px' }} onClick={() => fetchByCategory(filterCategory)}>Retry →</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
