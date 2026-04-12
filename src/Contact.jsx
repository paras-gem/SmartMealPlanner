import React, { useState } from 'react';
import './Contact.css';
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const Contact = ({ user, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick, onCommunityClick, onProductsClick, onFamilyClick, isDark, toggleDarkMode, onLoginClick, isAIEnabled, toggleAI }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.firebaseUID || 'guest',
                    ...formData
                })
            });
            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 5000);
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (err) {
            console.error("Feedback submit error:", err);
        }
    };

    return (
        <div className={`contact-page ${isDark ? "dark-mode" : ""}`}>
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
                activePage="contact"
                isAIEnabled={isAIEnabled}
                toggleAI={toggleAI}
                actionButton={<button onClick={onLoginClick} className="login-btn">Login</button>}
            />

            <main className="contact-content animate-fade-in">
                <div className="contact-container">
                    <section className="contact-info">
                        <h2>Get in Touch ✉️</h2>
                        <p>Have questions, suggestions, or just want to say hi? We're here for you.</p>

                        <div className="info-list">
                            <div className="info-item">
                                <span className="icon">⌂</span>
                                <div>
                                    <h4>Our HQ</h4>
                                    <p>123 Nutrition Way, Wellness City</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <span className="icon">✉</span>
                                <div>
                                    <h4>Email Us</h4>
                                    <p>hello@smartmeal.ai</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <span className="icon">☏</span>
                                <div>
                                    <h4>Call Us</h4>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="feedback-section">
                        <div className="feedback-card">
                            <h3>Send Your Feedback</h3>
                            {submitted ? (
                                <div className="success-message animate-pop-in">
                                    <span>✅</span>
                                    <p>Thank you! Your feedback has been received.</p>
                                </div>
                            ) : (
                                <form className="feedback-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            placeholder="Your Email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <select
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="">Select Topic</option>
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Feature Request">Feature Request</option>
                                            <option value="Bug Report">Bug Report</option>
                                            <option value="Feedback">Feedback</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <textarea
                                            placeholder="Your Message"
                                            rows="5"
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="submit-feedback-btn">
                                        Submit Feedback
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Contact;
