import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

const Chatbot = ({ user, isDark, trialDaysLeft, isPremium }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm NutriBot 🤖 Your personal nutrition assistant. What can I help you cook or plan today?", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const fileInputRef = useRef(null);

    // Load Chat History from MongoDB
    useEffect(() => {
        if (user && isOpen) {
            const uid = user.email || user.firebaseUID;
            fetch(`http://localhost:5000/api/chat/${uid}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const loaded = data.map(m => ({ text: m.text, isBot: m.role === 'bot' }));
                        setMessages(loaded);
                    }
                })
                .catch(err => console.error("Error loading chat history:", err));
        }
    }, [user, isOpen]);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        const userMsg = { text: userMessage, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    userId: user?.email || user?.firebaseUID
                })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { text: data.text || "I'm having a bit of trouble connecting to my AI brain. Let me check the web for you!", isBot: true }]);
            
            // Fallback to scraper ONLY if AI response is completely missing or very broken
            if (!data.text) {
                const scrapeRes = await fetch('http://localhost:5000/api/scrape', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: userMessage,
                        userId: user?.email || user?.firebaseUID
                    })
                });
                if (scrapeRes.ok) {
                    const scrapeData = await scrapeRes.json();
                    if (scrapeData.results?.length > 0) {
                        const tr = scrapeData.results[0];
                        setMessages(prev => [...prev, { text: `Found a great recipe on the web: ${tr.title}! View it here: ${tr.url}`, isBot: true }]);
                    }
                }
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { text: "Connection error. Please ensure the backend is running!", isBot: true }]);
        }
    };

    const handleFridgeVision = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMessages(prev => [...prev, { text: "📷 Uploading Fridge Photo...", isBot: false }]);
        setMessages(prev => [...prev, { text: "🧠 Analyzing with Google Genkit Vision...", isBot: true }]);

        try {
            const base64 = await convertToBase64(file);
            const response = await fetch('http://localhost:5000/api/ai-media/identify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64 })
            });

            if (response.ok) {
                const data = await response.json();
                const ingredientList = data.ingredients.length > 0 ? data.ingredients.join(", ") : "items";
                setMessages(prev => [...prev, { 
                    text: `✨ Analysis Complete! I found: ${ingredientList}. ${data.suggestion}`, 
                    isBot: true 
                }]);
            } else {
                setMessages(prev => [...prev, { text: "❌ Failed to analyze image. Please try again.", isBot: true }]);
            }
        } catch (err) {
            console.error("Vision Error:", err);
            setMessages(prev => [...prev, { text: "❌ Error connecting to Vision AI.", isBot: true }]);
        }
    };

    return (
        <div className={`chatbot-container ${isDark ? "dark-mode" : ""}`}>
            <div
                className={`fab-ai ${isOpen ? "active" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Close AI" : "Ask NutriBot"}
            >
                {isOpen ? "✕" : "🤖"}
            </div>

            {isOpen && (
                <div className="chatbot-window animate-pop-in">
                    <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span>NutriBot 🤖</span>
                            {!isPremium && <span style={{ fontSize: '0.7em', background: 'var(--accent)', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px' }}>{trialDaysLeft} Days Trial</span>}
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.isBot ? "bot-message" : "user-message"}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chatbot-input" style={{ display: 'flex', gap: '8px', padding: '10px' }}>
                        {!user ? (
                            <div style={{ flex: 1, padding: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '15px' }}>
                                🔒 Please <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }))}>Login</span> to chat with NutriBot.
                            </div>
                        ) : (
                            <>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFridgeVision} 
                                />
                                <button 
                                    className="vision-btn" 
                                    onClick={() => fileInputRef.current.click()} 
                                    title="Fridge Vision AI - Upload a photo of your fridge!"
                                    style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    📷
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                    style={{ flex: 1 }}
                                />
                                <button className="send-btn" onClick={handleSend}>Send</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
