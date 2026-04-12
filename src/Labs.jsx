import React from "react";
import "./Labs.css";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const Labs = ({ user,  onLogoClick, onAboutClick, onContactClick, onLabsClick, isDark, toggleDarkMode }) => {

    return (
        <div className={`labs-container animate-fade-in ${isDark ? "dark-mode" : ""}`}>
            <div className="bg-decoration"></div>

            <Header user={user} 
                onLogoClick={onLogoClick}
                onLabsClick={onLabsClick}
                onContactClick={onContactClick}
                onAboutClick={onAboutClick}
                isDark={isDark}
                toggleDarkMode={toggleDarkMode}
                activePage="labs"
            />

            <main className="labs-content">
                <section className="labs-hero animate-slide-up">
                    <span className="labs-icon-large">⚗️</span>
                    <h2>SmartMeal Labs</h2>
                    <p>Welcome to our feature testing ground. Access advanced configurations and upcoming tools.</p>
                </section>

                <div className="labs-grid">
                    <div className="labs-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="labs-card-header">
                            <div>
                                <h3>⚙️ Account Settings</h3>
                            </div>
                            <button className="settings-action-btn">Manage ⍈</button>
                        </div>
                        <p>Customize your profile, update your dietary preferences, and manage your subscription details. <i>Options will be available soon.</i></p>
                    </div>

                    <div className="labs-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="labs-card-header">
                            <div>
                                <h3>🔒 Privacy & Security</h3>
                            </div>
                            <button className="settings-action-btn">Manage ⍈</button>
                        </div>
                        <p>Control your data, manage connected accounts, and review your security history. <i>Options will be available soon.</i></p>
                    </div>

                    <div className="labs-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="labs-card-header">
                            <div>
                                <h3>✨ App Preferences</h3>
                            </div>
                            <button className="settings-action-btn">Manage ⍈</button>
                        </div>
                        <p>Adjust notification frequencies, theme settings, and measurement units. <i>Options will be available soon.</i></p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Labs;
