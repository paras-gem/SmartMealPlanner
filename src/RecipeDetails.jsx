import React, { useState, useEffect } from 'react';
import './RecipeDetails.css';
import Header from './Header.jsx';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const RecipeDetails = ({ user, recipe, onBack, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick, onCommunityClick, isDark, toggleDarkMode, onLoginClick, isAIEnabled, toggleAI }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [localRatings, setLocalRatings] = useState(recipe?.ratings || []);
    const [submitting, setSubmitting] = useState(false);
    const [orderingGroceries, setOrderingGroceries] = useState(false);
    const [groceriesOrdered, setGroceriesOrdered] = useState(false);

    const [family, setFamily] = useState(null);
    const [personalGrocery, setPersonalGrocery] = useState({ items: [] });

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadContextData = async () => {
            if (!user) return;
            const uid = user.firebaseUID || user.email;
            try {
                // Load personal grocery
                const gRes = await fetch(`http://localhost:5000/api/grocery/${uid}`);
                if (gRes.ok) setPersonalGrocery(await gRes.json());

                // Load family group
                const fRes = await fetch(`http://localhost:5000/api/family/user/${uid}`);
                if (fRes.ok) setFamily(await fRes.json());
            } catch (err) { console.error("Sync data load error:", err); }
        };
        loadContextData();
    }, [user, recipe]);

    const handleInstacartOrder = async () => {
        if (!user) return alert("Please log in to add items to your cart!");
        setOrderingGroceries(true);
        
        try {
            const uid = user.firebaseUID || user.email;
            const newItems = (recipe.ingredients || []).map(ing => ({
                name: typeof ing === 'string' ? ing : `${ing.qty} ${ing.unit} ${ing.name}`,
                checked: false
            }));

            // 1. Sync Peripheral (Personal) Grocery List
            const mergedPersonal = [...(personalGrocery.items || []), ...newItems];
            await fetch('http://localhost:5000/api/grocery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseUID: uid, items: mergedPersonal })
            });

            // 2. Sync Shared Family List (if applicable)
            if (family) {
                const mergedFamily = [...(family.sharedGroceryList || []), ...newItems];
                await fetch(`http://localhost:5000/api/family/${family._id}/grocery`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sharedGroceryList: mergedFamily })
                });
            }

            setOrderingGroceries(false);
            setGroceriesOrdered(true);
            setTimeout(() => setGroceriesOrdered(false), 5000);
            
            // Dispatch event to refresh other components (like Dashboard)
            window.dispatchEvent(new CustomEvent('groceryUpdated'));
        } catch (err) {
            console.error("Instacart sync error:", err);
            setOrderingGroceries(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!user) return alert("Please log in to leave a review!");
        if (rating === 0) return alert("Please select a star rating.");
        if (!reviewText.trim()) return alert("Please write a short review.");
        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/recipes/${recipe._id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.firebaseUID,
                    userName: user.name,
                    userPhoto: user.photoURL,
                    score: rating,
                    review: reviewText
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setLocalRatings(updated.ratings);
                setSubmitted(true);
                setReviewText("");
                setRating(0);
            }
        } catch (err) {
            console.error("Review error:", err);
        }
        setSubmitting(false);
    };

    const downloadRecipe = () => {
        // Since we've added professional @media print styles to RecipeDetails.css,
        // window.print() is now the most robust way to generate a clean PDF.
        if (window.confirm("Prepare recipe for download/print?")) {
            window.print();
        }
    };

    if (!recipe) return null;

    const isDiabetic = user?.healthConditions?.includes('diabetic');
    const isHypertensive = user?.healthConditions?.includes('hypertension');

    return (
        <div className={`recipe-details-page ${isDark ? 'dark-mode' : ''}`}>
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
                isAIEnabled={isAIEnabled}
                toggleAI={toggleAI}
                actionButton={!user ? <button onClick={onLoginClick} className="login-btn">Login</button> : null}
            />

            <main className="recipe-container" id="recipe-export-area">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="back-link" onClick={onBack}>
                        ← Back to Planner
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleInstacartOrder}
                            disabled={orderingGroceries || groceriesOrdered}
                            style={{
                                padding: '8px 15px', 
                                background: groceriesOrdered ? '#2ecc71' : '#43b02a', 
                                color: 'white', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: (orderingGroceries || groceriesOrdered) ? 'default' : 'pointer', 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background 0.3s'
                            }}
                        >
                            {orderingGroceries ? '🛒 Syncing...' : groceriesOrdered ? '✅ Added' : '🛒 Order ingredients'}
                        </button>
                        <button 
                            onClick={downloadRecipe} 
                            style={{ padding: '8px 15px', background: 'var(--primary-color, #6dba5f)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                            📄 PDF
                        </button>
                    </div>
                </div>

                <div className="recipe-hero animate-fade-in">
                    <div className="recipe-hero-image">
                        <img
                            src={recipe.image || recipe.imageURL || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"}
                            alt={recipe.title}
                            crossOrigin="anonymous"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"; }}
                        />
                    </div>
                    <div className="recipe-hero-content">
                        <span className="recipe-badge">{recipe.tag || recipe.category}</span>
                        <h1>{recipe.title}</h1>
                        <p className="recipe-description">{recipe.desc || ""}</p>

                        {isDiabetic && recipe.diabeticFlag && (
                            <div className="health-flag diabetic">
                                ⚠️ High Sugar — Diabetic users: {recipe.diabeticSafeQty}
                            </div>
                        )}
                        {isHypertensive && recipe.sodiumContent > 600 && (
                            <div className="health-flag hypertension">
                                ⚠️ High Sodium — Limit to half serving
                            </div>
                        )}

                        <div className="recipe-meta-row">
                            <div className="meta-item">
                                <span className="meta-icon">⏱</span>
                                <div className="meta-text">
                                    <label>Time</label>
                                    <span>{recipe.time || '30 mins'}</span>
                                </div>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">📊</span>
                                <div className="meta-text">
                                    <label>Difficulty</label>
                                    <span>{recipe.difficulty || 'Medium'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rating-section" data-html2canvas-ignore="true">
                            <label>Recipe Rating:</label>
                            <div className="star-display">
                                {'★'.repeat(Math.round(recipe.averageRating || 0))}{'☆'.repeat(5 - Math.round(recipe.averageRating || 0))}
                                <span className="rating-count">({recipe.totalRatings || localRatings.length})</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="recipe-content-grid animate-fade-up">
                    <section className="ingredients-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Ingredients</h2>
                        </div>
                        <ul className="ingredients-list" style={{ marginTop: '15px' }}>
                            {(recipe.ingredients || []).map((ing, idx) => (
                                <li key={idx}>
                                    <span className="dot"></span>
                                    {typeof ing === 'string' ? ing : `${ing.qty} ${ing.unit} ${ing.name}`}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="instructions-card">
                        <h2>Instructions</h2>
                        <div className="instructions-text-block">
                            <ol>
                                {(recipe.steps || []).map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        </div>
                    </section>

                    <section className="reviews-card" style={{ gridColumn: '1 / -1', marginTop: '20px' }} data-html2canvas-ignore="true">
                        <h2>Community Reviews</h2>

                        {!submitted && user && (
                            <div className="review-submission">
                                <h3>Leave a Review</h3>
                                <div className="star-rating">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={star <= (hover || rating) ? "on" : "off"}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(rating)}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    placeholder="Share your experience with this recipe..."
                                    rows={3}
                                />
                                <button
                                    className="submit-review-btn"
                                    onClick={handleSubmitReview}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review →'}
                                </button>
                            </div>
                        )}

                        {submitted && <p className="success-msg">✓ Review submitted! Thank you.</p>}

                        <div className="reviews-list">
                            {localRatings && localRatings.length > 0 ? (
                                localRatings.map((r, idx) => (
                                    <div key={idx} className="review-item">
                                        <img src={r.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.userName}`} alt={r.userName} className="reviewer-avatar" />
                                        <div className="review-body">
                                            <div className="reviewer-meta">
                                                <strong>{r.userName}</strong>
                                                <span className="review-stars">{'★'.repeat(r.score)}</span>
                                            </div>
                                            <p className="review-text">{r.review}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-reviews">No reviews yet. Be the first to rate this recipe!</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default RecipeDetails;
