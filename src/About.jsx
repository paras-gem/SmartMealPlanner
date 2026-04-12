import React from 'react';
import './About.css';
import Header from "./Header.jsx";

const About = ({ user, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick, onCommunityClick, onProductsClick, onFamilyClick, isDark, toggleDarkMode, onLoginClick, isAIEnabled, toggleAI }) => {
    return (
        <div className={`about-page ${isDark ? "dark-mode" : ""}`}>
            <Header user={user}
                onLogoClick={onLogoClick}
                onContactClick={onContactClick}
                onAboutClick={onAboutClick}
                onSubscriptionClick={onSubscriptionClick}
                onCommunityClick={onCommunityClick}
                onProductsClick={onProductsClick}
                onFamilyClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'family' }))}
                isDark={isDark}
                toggleDarkMode={toggleDarkMode}
                isAIEnabled={isAIEnabled}
                toggleAI={toggleAI}
                activePage="about"
                actionButton={<button onClick={onLoginClick} className="login-btn">Login</button>}
            />

            <main className="about-content animate-fade-in">
                <section className="about-hero">
                    <h2>Explore Your Palate 🎨</h2>
                    <p>Inspiring home cooks to discover new flavors and celebrate every meal, one mood at a time.</p>
                </section>

                <section className="about-grid">
                    <div className="about-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <span className="about-icon">✧</span>
                        <h3>Flavor Curation</h3>
                        <p>Our smart engine learns your tastes to suggest dishes you'll truly love, not just what's "good" for you.</p>
                    </div>
                    <div className="about-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <span className="about-icon">⌬</span>
                        <h3>Nutrition First</h3>
                        <p>Every recipe is vetted for nutritional balance, ensuring you get the right macros every single day.</p>
                    </div>
                    <div className="about-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <span className="about-icon">⌘</span>
                        <h3>Global Cuisine</h3>
                        <p>Discover traditional classics and modern fusions from cultures around the world.</p>
                    </div>
                </section>

                <section className="about-story">
                    <h3>Beyond Just Eating</h3>
                    <p>
                        Started in 2026, SmartMeal was born from a love for variety.
                        We believe food should be an adventure, not a chore. Our
                        platform is designed to help you break out of your food rut
                        and find joy in every single bite.
                    </p>
                </section>
            </main>
        </div>
    );
};

export default About;
