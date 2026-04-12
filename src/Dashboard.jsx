import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Header from "./Header.jsx";
import { dashboardStats } from "./data.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const Dashboard = ({ user, onLogoClick, onLogout, onAboutClick, onContactClick, onSubscriptionClick, onCommunityClick, isDark, toggleDarkMode, isAIEnabled, toggleAI, onRecipeClick, language, setLanguage }) => {
    const [aiVisionEnabled, setAiVisionEnabled] = useState(false);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groceryItems, setGroceryItems] = useState([]);
    const [newGrocery, setNewGrocery] = useState("");

    // Mock Real-time Chart Data
    const parseStat = (label) => {
        const item = dashboardStats.find(s => s.label === label);
        return item ? parseInt(item.value) : 0;
    };

    const macroData = {
        labels: ['Protein', 'Carbs', 'Fats'],
        datasets: [{
            data: [parseStat('Protein'), parseStat('Carbs'), parseStat('Fats')],
            backgroundColor: ['#ef4444', '#3b82f6', '#eab308'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const calorieData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Calories Consumed',
            data: [1900, 2100, 2000, 1800, parseStat('Calories') > 0 ? parseStat('Calories') : 2200, 0, 0],
            borderColor: 'var(--primary-color, #6dba5f)',
            backgroundColor: 'var(--primary-color, #6dba5f)',
            tension: 0.4,
            pointRadius: 5
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: isDark ? '#fff' : '#333' }
            }
        },
        scales: {
            x: { ticks: { color: isDark ? '#ccc' : '#666' }, grid: { color: isDark ? '#333' : '#eee' } },
            y: { ticks: { color: isDark ? '#ccc' : '#666' }, grid: { color: isDark ? '#333' : '#eee' } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'right', labels: { color: isDark ? '#fff' : '#333' } }
        }
    };

    useEffect(() => {
        fetchSuggestions();
        if (user?.firebaseUID || user?.email) {
            fetchGrocery();
            
            // Listen for sync events from other components
            const handleSync = () => fetchGrocery();
            window.addEventListener('groceryUpdated', handleSync);
            return () => window.removeEventListener('groceryUpdated', handleSync);
        }
    }, [user]);

    const fetchGrocery = async () => {
        try {
            const uid = user?.firebaseUID || user?.email;
            if (!uid) return;
            const res = await fetch(`http://localhost:5000/api/grocery/${uid}`);
            const data = await res.json();
            if (data.items) setGroceryItems(data.items);
        } catch (err) { console.error('Fetch grocery error', err); }
    };

    const handleAddGrocery = async () => {
        if (!newGrocery.trim() || !user) return;
        const updated = [...groceryItems, { name: newGrocery, checked: false }];
        try {
            const uid = user?.firebaseUID || user?.email;
            await fetch('http://localhost:5000/api/grocery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseUID: uid, items: updated })
            });
            setGroceryItems(updated);
            setNewGrocery("");
        } catch (err) { console.error(err); }
    };

    const handleToggleGrocery = (idx) => {
        const newItems = [...groceryItems];
        newItems[idx].checked = !newItems[idx].checked;
        setGroceryItems(newItems);
    };

    const downloadPDF = () => {
        const input = document.getElementById('dashboard-export-area');
        if (!input) return;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${user?.name || 'My'}_MealPlan.pdf`);
        });
    };

    const downloadShoppingList = () => {
        if (!groceryItems.length) return alert("Your shopping list is empty!");
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.setFontSize(22);
        pdf.setTextColor(46, 204, 113);
        pdf.text('🛒 My SmartMeal Shopping List', 20, 30);

        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);

        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, 45, 190, 45);

        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        let y = 60;
        groceryItems.forEach((item, index) => {
            if (y > 270) {
                pdf.addPage();
                y = 30;
            }
            pdf.text(`${index + 1}. ${item.name} ${item.checked ? '(Checked)' : ''}`, 25, y);
            y += 12;
        });

        pdf.save(`${user?.name || 'My'}_ShoppingList.pdf`);
    };

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const pref = user?.mealPreference || 'Veg';
            const res = await fetch(`http://localhost:5000/api/recipes/by-category?category=${encodeURIComponent(pref)}&number=3`);
            const data = await res.json();

            let filtered = data;
            if (user?.profile?.goal === 'Weight Loss') {
                filtered = data.filter(r => r.calories < 500);
            } else if (user?.profile?.goal === 'Muscle Gain') {
                filtered = data.filter(r => r.calories > 600);
            } else if (user?.healthConditions?.includes('diabetic')) {
                filtered = data.filter(r => r.category === 'Veg' || r.category === 'Vegan');
            }

            setRecipes((filtered.length > 0 ? filtered : data).slice(0, 3));
        } catch (err) {
            console.error("Failed to fetch suggestions", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`dashboard-container animate-fade-in ${isDark ? "dark-mode" : ""}`}>
            <div className="bg-decoration"></div>

            <Header user={user}
                onLogoClick={onLogoClick}
                onContactClick={onContactClick}
                onAboutClick={onAboutClick}
                onSubscriptionClick={onSubscriptionClick}
                onCommunityClick={onCommunityClick}
                onFamilyClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'family' }))}
                onLogoutClick={onLogout}
                isDark={isDark}
                toggleDarkMode={toggleDarkMode}
                activePage="dashboard"
            />

            <main className="dashboard-content" id="dashboard-export-area">
                <section className="welcome-section animate-slide-up">
                    <div className="welcome-header">
                        <div>
                            <h2>Hello, {user?.name || "Explorer"}!</h2>
                            <p>
                                {user?.profile?.goal
                                    ? `Discovering new flavors for your ${user.profile.goal} lifestyle.`
                                    : "Find your next favorite dish based on your mood."}
                            </p>
                        </div>
                        <div className="daily-tip-box">
                            <span className="tip-icon">✦</span>
                            <div>
                                <strong>Kitchen Secret:</strong>
                                <p>Adding a pinch of salt to your coffee can cut the bitterness!</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="suggestions-section animate-fade-in" style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🎯 {user?.mealPreference ? `Recommended ${user.mealPreference} recipes for you` : 'Recommended for You'}
                    </h3>
                    {loading ? (
                        <p>Loading personalized suggestions...</p>
                    ) : (
                        <div className="recipe-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {recipes.map(recipe => (
                                <div key={recipe._id} className="recipe-card" onClick={() => onRecipeClick(recipe)}>
                                    <div className="recipe-img-wrapper">
                                        <img src={recipe.imageURL || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={recipe.title} />
                                    </div>
                                    <div className="recipe-content">
                                        <span className={`recipe-badge ${recipe.category?.toLowerCase()}`}>{recipe.category}</span>
                                        <h4>{recipe.title}</h4>
                                        <div className="recipe-meta">
                                            <span>🔥 {recipe.calories} kcal</span>
                                            <span>⭐ {recipe.averageRating?.toFixed(1) || 'New'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="charts-section animate-slide-up" data-html2canvas-ignore="true" style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                    <div className="chart-card" style={{ flex: '1', minWidth: '300px', background: 'var(--bg-card)', padding: '2rem', borderRadius: '15px' }}>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>📊 Weekly Calories</h3>
                        <div style={{ position: 'relative', height: '250px' }}>
                            <Line data={calorieData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="chart-card" style={{ flex: '1', minWidth: '300px', background: 'var(--bg-card)', padding: '2rem', borderRadius: '15px' }}>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>🥑 Macro Distribution</h3>
                        <div style={{ position: 'relative', height: '250px', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut data={macroData} options={doughnutOptions} />
                        </div>
                    </div>
                </section>

                <section className="dashboard-widgets" style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                    <div className="grocery-widget" style={{ flex: '1', minWidth: '300px', background: 'var(--bg-card)', padding: '2rem', borderRadius: '15px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>🛒 Personal Shopping List</h3>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                value={newGrocery}
                                onChange={e => setNewGrocery(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAddGrocery()}
                                placeholder="Add grocery item..."
                                style={{ flex: '1', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                            />
                            <button onClick={handleAddGrocery} style={{ padding: '10px 15px', borderRadius: '8px', background: 'var(--theme-color)', color: 'white', border: 'none', cursor: 'pointer' }}>Add</button>
                        </div>
                        <ul style={{ listStyle: 'none', padding: '0' }}>
                            {groceryItems.map((item, idx) => (
                                <li key={idx} onClick={() => handleToggleGrocery(idx)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-main)', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                                    <span>{item.checked ? '☑️' : '◻️'}</span>
                                    <span style={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--text-muted)' : 'var(--text-main)' }}>{item.name}</span>
                                </li>
                            ))}
                        </ul>
                        {groceryItems.length > 0 && (
                            <button onClick={downloadShoppingList} style={{ width: '100%', marginTop: '15px', padding: '12px', borderRadius: '8px', background: 'var(--theme-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                📄 Download Shopping List (PDF)
                            </button>
                        )}
                    </div>

                    <div className="action-widget" style={{ flex: '1', minWidth: '300px', background: 'var(--bg-card)', padding: '2rem', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center' }}>
                        <h3>🛠️ Quick Actions</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Export your plans or sync with your family.</p>
                        <button onClick={downloadPDF} style={{ width: '100%', padding: '15px', borderRadius: '10px', background: 'var(--theme-color)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
                            📄 Download Meal Plan (PDF)
                        </button>
                        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'family' }))} style={{ width: '100%', padding: '15px', borderRadius: '10px', background: 'transparent', border: '2px solid var(--theme-color)', color: 'var(--theme-color)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
                            👨‍👩‍👧 Family Sync Portal
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
