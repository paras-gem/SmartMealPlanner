import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import { useTheme } from "./ThemeContext.jsx";
import SmartMealPlanner from "./SmartMealPlanner.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import ProfileSetup from "./ProfileSetup.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import RecipeDetails from "./RecipeDetails.jsx";
import Chatbot from "./Chatbot.jsx";
import Settings from "./Settings.jsx";
import Subscription from "./Subscription.jsx";
import FamilySync from "./FamilySync.jsx";
import Community from "./Community.jsx";
import Products from "./Products.jsx";
import Footer from "./Footer.jsx";

function App() {
    const [view, setView] = useState("planner");
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loginMode, setLoginMode] = useState("login");
    const [isAIEnabled, setIsAIEnabled] = useState(true);
    const { isDark, toggleDarkMode, setThemeColor } = useTheme();

    useEffect(() => {
        if (user?.themeColor) {
            setThemeColor(user.themeColor);
        }
    }, [user?.themeColor, setThemeColor]);

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    // Sync from Compass on mount or identity change
    useEffect(() => {
        const syncUser = async () => {
            if (user?.email) {
                try {
                    const identifier = user.firebaseUID || user.email;
                    const res = await fetch(`http://localhost:5000/api/users/${identifier}`);
                    if (res.ok) {
                        const latestUser = await res.json();
                        // Only update if data is meaningfully different to avoid loops
                        if (JSON.stringify(latestUser) !== JSON.stringify(user)) {
                            setUser(latestUser);
                            localStorage.setItem("user", JSON.stringify(latestUser));
                            console.log("[App] Synced with Compass & LocalStorage:", latestUser.email);
                        }
                    }
                } catch (err) {
                    console.error("[App] Compass sync failed:", err);
                }
            }
        };
        syncUser();
    }, [user?.email, user?.firebaseUID]); // Run whenever identity changes


    useEffect(() => {
        const handleNav = (e) => setView(e.detail);
        const handleForceLogout = () => {
            handleLogout();
        };
        const handleUserUpdate = (e) => {
            setUser(e.detail);
            localStorage.setItem("user", JSON.stringify(e.detail));
        };

        window.addEventListener('navigate', handleNav);
        window.addEventListener('logoutTriggered', handleForceLogout);
        window.addEventListener('userUpdated', handleUserUpdate);
        return () => {
            window.removeEventListener('navigate', handleNav);
            window.removeEventListener('logoutTriggered', handleForceLogout);
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, []);

    const handleLogin = (userData) => {
        console.log("Logged in user:", userData);
        setUser(userData);
        setView("onboarding");
    };

    const handleOnboardingComplete = (updatedUser) => {
        setUser(updatedUser);
        setView("dashboard");
    };

    const handleGoHome = () => {
        setView("planner");
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("user");
        setView("planner");
    };

    // Compute effective subscription level BEFORE navProps uses it
    const subLevel = user?.subscriptionLevel || 'Basic';
    const trialDaysLeft = Math.max(0, 30 - (user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 30));
    const isOnTrial = user?.trialActive || trialDaysLeft > 0;
    const effectiveLevel = subLevel === 'Premium' || isOnTrial ? 'Premium' : 'Basic';
    const hasAIAccess = effectiveLevel === 'Premium';

    const navProps = {
        onLogoClick: handleGoHome,
        onAboutClick: () => setView("about"),
        onContactClick: () => setView("contact"),
        onSettingsClick: () => setView("settings"),
        onSubscriptionClick: () => setView("subscription"),
        onProductsClick: () => setView("products"),
        onFamilyClick: () => setView("family"),
        onCommunityClick: () => setView("community"),
        user: user ? { ...user, subscriptionLevel: effectiveLevel } : null,
        isDark,
        toggleDarkMode,
        onLoginClick: () => {
            setLoginMode("login");
            setView("login");
        },
        onLogoutClick: handleLogout,
        onRecipeClick: (recipe) => {
            if (!user) {
                setLoginMode("signup");
                setView("login");
            } else {
                setSelectedRecipe(recipe);
                setView("recipe-details");
            }
        },
        isAIEnabled,
        toggleAI: () => setIsAIEnabled(!isAIEnabled),
        saveAIMedia: async (type, url, prompt, meta) => {
            if (!user) return;
            try {
                await fetch('http://localhost:5000/api/ai-media', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.firebaseUID,
                        contentType: type,
                        contentUrl: url,
                        promptUsed: prompt,
                        metadata: meta
                    })
                });
            } catch (err) {
                console.error("AI Media save error:", err);
            }
        }
    };



    return (
        <GoogleOAuthProvider clientId="620129041083-6td11htrb3guebr1n2bngokeb6f0nsk8.apps.googleusercontent.com">
            <div className={`App ${isDark ? "dark-mode" : ""}`} style={{ fontSize: user?.fontSize === 'large' ? '1.1rem' : user?.fontSize === 'small' ? '0.9rem' : '1rem' }}>
                {view === "planner" && (
                    <SmartMealPlanner {...navProps} />
                )}

                {view === "login" && (
                    <Login
                        {...navProps}
                        onBack={() => setView("planner")}
                        onLogin={handleLogin}
                        initialMode={loginMode}
                    />
                )}

                {view === "onboarding" && (
                    <ProfileSetup
                        {...navProps}
                        user={user}
                        onComplete={handleOnboardingComplete}
                    />
                )}

                {view === "dashboard" && (
                    <Dashboard
                        {...navProps}
                        user={user}
                        onLogout={handleLogout}
                    />
                )}

                {view === "about" && (
                    <About {...navProps} />
                )}

                {view === "contact" && (
                    <Contact {...navProps} user={user} />
                )}

                {view === "products" && (
                    <Products {...navProps} user={user} />
                )}

                {view === "recipe-details" && (
                    <RecipeDetails
                        {...navProps}
                        user={user}
                        recipe={selectedRecipe}
                        onBack={() => setView("planner")}
                    />
                )}

                {view === "settings" && (
                    <Settings
                        {...navProps}
                        user={user}
                        onUpdateUser={(updatedUser) => setUser(updatedUser)}
                    />
                )}

                {view === "subscription" && (
                    <Subscription
                        {...navProps}
                        user={user}
                        onUpdateUser={(updatedUser) => setUser(updatedUser)}
                    />
                )}

                {view === "family" && (
                    <FamilySync
                        {...navProps}
                        user={user}
                    />
                )}

                {view === "community" && (
                    <Community
                        {...navProps}
                        user={user}
                    />
                )}

                {isAIEnabled && <Chatbot user={user} isDark={isDark} trialDaysLeft={trialDaysLeft} isPremium={effectiveLevel === 'Premium'} />}

                {/* Floating Settings Button (bottom left) */}
                <div
                    className={`fab-settings ${view === 'settings' ? 'active' : ''}`}
                    onClick={() => setView("settings")}
                    title="Settings"
                >
                    ⚙️
                </div>

                {view !== 'login' && view !== 'onboarding' && <Footer />}
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;
