import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({
    onLogoClick, onAboutClick, onContactClick, onSubscriptionClick,
    onCommunityClick, onSettingsClick, onProductsClick, onFamilyClick, onLogoutClick, activePage, actionButton,
    user
}) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setIsInstallable(false);
        });
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Install prompt outcome: ${outcome}`);
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const navigate = (page, propFunc) => {
        if (propFunc) {
            propFunc();
        } else {
            window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
        }
        setUserMenuOpen(false);
    };

    return (
        <header className="site-header glass-header">
            <h1 className="logo-text" onClick={() => navigate('planner', onLogoClick)}>SmartMeal</h1>

            <nav className="nav-links">
                <span className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={() => navigate('planner', onLogoClick)}>Home</span>
                <span className={`nav-link ${activePage === 'products' ? 'active' : ''}`} onClick={() => navigate('products', onProductsClick)}>Products</span>
                <span className={`nav-link ${activePage === 'community' ? 'active' : ''}`} onClick={() => navigate('community', onCommunityClick)}>Community</span>
                <span className={`nav-link ${activePage === 'contact' ? 'active' : ''}`} onClick={() => navigate('contact', onContactClick)}>Contact</span>
                <span className={`nav-link ${activePage === 'about' ? 'active' : ''}`} onClick={() => navigate('about', onAboutClick)}>About</span>
                <span className={`nav-link ${activePage === 'family' ? 'active' : ''}`} onClick={() => navigate('family', onFamilyClick)}>Family Sync</span>
                <span className={`nav-link premium-link ${activePage === 'subscription' ? 'active' : ''}`} onClick={() => navigate('subscription', onSubscriptionClick)}>💎 Premium</span>
            </nav>

            <div className="header-actions">
                {isInstallable && (
                    <button
                        className="nav-link install-btn"
                        onClick={handleInstallClick}
                        style={{ background: 'var(--primary-color, #6dba5f)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        📱 Install
                    </button>
                )}

                {user && (
                    <span className="nav-link settings-link" onClick={() => navigate('settings', onSettingsClick)} title="Settings">⚙️</span>
                )}

                {user ? (
                    <div style={{ position: 'relative' }}>
                        <div className="user-badge" title={user.name} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                user.name ? user.name[0].toUpperCase() : '👤'
                            )}
                        </div>
                        {userMenuOpen && (
                            <div className="lang-dropdown animate-fade-in" style={{ padding: '0', minWidth: '180px', right: '-10px' }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{user.name || "User"}</strong>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.subscriptionLevel || 'Basic'} Plan</span>
                                </div>
                                <div className="lang-option" onClick={() => navigate('dashboard')}>🏠 Dashboard</div>
                                <div className="lang-option" onClick={() => navigate('family', onFamilyClick)}>👨‍👩‍👧 Family Sync</div>
                                <div className="lang-option" onClick={() => navigate('settings', onSettingsClick)}>⚙️ Settings</div>
                                <div className="lang-option" onClick={() => { setUserMenuOpen(false); window.dispatchEvent(new Event('logoutTriggered')); }} style={{ color: '#ef4444', borderTop: '1px solid var(--border)' }}>
                                    🚪 Logout
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    actionButton
                )}
            </div>
        </header>
    );
};

export default Header;
