import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';
import './Community.css';

const TAG_COLORS = { "Veg": "var(--accent)", "Non-Veg": "#ef4444", "Vegan": "#a855f7", "Community": "#3b82f6" };

const Community = ({ user, onLogoClick, onAboutClick, onContactClick, onSubscriptionClick, onCommunityClick, onProductsClick, onFamilyClick, isDark, toggleDarkMode }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [likedIds, setLikedIds] = useState([]);
    const [selectedUserPost, setSelectedUserPost] = useState(null);
    const [replyText, setReplyText] = useState('');
    
    // New Thread Modal State
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostRecipe, setNewPostRecipe] = useState('');
    const [newPostRating, setNewPostRating] = useState(5);
    const [postActionHover, setPostActionHover] = useState(0);

    // Edit Modal State
    const [editingPost, setEditingPost] = useState(null);
    const [editingReply, setEditingReply] = useState(null);

    useEffect(() => {
        loadCommunityFeed();
    }, []);

    const loadCommunityFeed = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/community');
            if (!res.ok) throw new Error('Failed to fetch feed');
            const threads = await res.json();
            
            // Format to match UI
            const allPosts = threads.map(t => ({
                id: t._id,
                email: t.email, // Store email for ownership check
                recipeId: t.recipeId || 'custom',
                recipeTitle: t.recipeTitle || 'General Discussion',
                user: t.user || 'Unknown User',
                avatar: t.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.user}`,
                time: new Date(t.createdAt).toLocaleDateString(),
                content: t.content,
                rating: t.rating || 0,
                likes: t.likes || 0,
                tag: t.tag || 'Community',
                replies: t.replies || []
            }));

            setPosts(allPosts);
        } catch (err) {
            setError(err.message);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!user) return alert('Please login to create a post!');
        if (!newPostContent.trim()) return alert('Post content cannot be empty.');

        try {
            const res = await fetch('http://localhost:5000/api/community', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipeTitle: newPostRecipe.trim() ? newPostRecipe : 'General Discussion',
                    user: user.name || 'User',
                    email: user.email,
                    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`,
                    content: newPostContent,
                    tag: 'Community',
                    rating: newPostRating,
                    likes: 0
                })
            });

            if(res.ok) {
                await loadCommunityFeed();
                setShowNewPostModal(false);
                setNewPostContent('');
                setNewPostRecipe('');
                setNewPostRating(5);
                alert('Post created successfully! 🚀');
            } else {
                alert('Failed to create post. Please try again.');
            }
        } catch(err) {
            alert('Failed to post thread.');
        }
    };

    const [submittingEdit, setSubmittingEdit] = useState(false);

    const handleUpdatePost = async () => {
        if (!editingPost) return;
        if (!editingPost.id) {
            alert('Error: Post ID is missing. Please refresh and try again.');
            return;
        }

        setSubmittingEdit(true);
        try {
            const res = await fetch(`http://localhost:5000/api/community/${editingPost.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: editingPost.content,
                    rating: editingPost.rating
                })
            });
            if(res.ok) {
                await loadCommunityFeed();
                setEditingPost(null);
                alert('Changes saved successfully! ✅');
            } else {
                const errorData = await res.json();
                alert(`Server Error: ${errorData.error || 'Failed to update post'}`);
            }
        } catch(err) {
            console.error('Update failed:', err);
            alert('Failed to update post. Make sure your server is running on port 5000.');
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm("Are you sure you want to delete this thread?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/community/${id}`, {
                method: 'DELETE'
            });
            if(res.ok) {
                await loadCommunityFeed();
                if (selectedUserPost?.id === id) setSelectedUserPost(null);
            }
        } catch(err) {
            alert('Failed to delete post.');
        }
    };

    const handleLike = async (id) => {
        if (likedIds.includes(id)) {
            setLikedIds(likedIds.filter(i => i !== id));
        } else {
            setLikedIds([...likedIds, id]);
            try {
                await fetch(`http://localhost:5000/api/community/${id}/like`, { method: 'POST' });
            } catch(err) { console.error('Like failed', err); }
        }
    };

    const handleEditReply = (threadId, reply) => {
        setEditingReply({ threadId, ...reply });
    };

    const handleUpdateReply = async () => {
        if (!editingReply || !user) return;
        try {
            const res = await fetch(`http://localhost:5000/api/community/${editingReply.threadId}/reply/${editingReply._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editingReply.text })
            });
            if (res.ok) {
                const updatedThread = await res.json();
                if (selectedUserPost?.id === editingReply.threadId) {
                    setSelectedUserPost(prev => ({ ...prev, replies: updatedThread.replies }));
                }
                setPosts(posts.map(p => p.id === editingReply.threadId ? { ...p, replies: updatedThread.replies } : p));
                setEditingReply(null);
            }
        } catch (err) { alert('Failed to update reply.'); }
    };

    const handleDeleteReply = async (threadId, replyId) => {
        if (!window.confirm("Delete this reply?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/community/${threadId}/reply/${replyId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const updatedThread = await res.json();
                if (selectedUserPost?.id === threadId) {
                    setSelectedUserPost(prev => ({ ...prev, replies: updatedThread.replies }));
                }
                setPosts(posts.map(p => p.id === threadId ? { ...p, replies: updatedThread.replies } : p));
            }
        } catch (err) { alert('Failed to delete reply.'); }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        if (!user) return alert("Please login to reply!");
        
        try {
            const newReply = { user: user.name || 'User', email: user.email, text: replyText };
            const res = await fetch(`http://localhost:5000/api/community/${selectedUserPost.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReply)
            });

            if(res.ok) {
                const updatedThread = await res.json();
                setSelectedUserPost(prev => ({
                    ...prev,
                    replies: updatedThread.replies
                }));
                // Also update local overall posts
                setPosts(posts.map(p => p.id === selectedUserPost.id ? { ...p, replies: updatedThread.replies } : p));
                setReplyText('');
            }
        } catch(err) {
            alert('Failed to post reply.');
        }
    };

    const filtered = posts.filter(p =>
        p.content.toLowerCase().includes(filter.toLowerCase()) ||
        p.recipeTitle.toLowerCase().includes(filter.toLowerCase()) ||
        p.user.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className={`community-page animate-fade-in ${isDark ? 'dark-mode' : ''}`}>
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
                activePage="community"
            />

            <div className="community-container">
                <div className="community-hero">
                    <h2>🌍 Community Kitchen</h2>
                    <p>Discover what others are cooking and sharing in the SmartMeal community.</p>
                </div>

                <div className="community-filters">
                    <input
                        type="text"
                        placeholder="Search reviews, recipes, or users..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="community-search-bar"
                    />
                </div>

                {!selectedUserPost ? (
                    <div className="feed-view-container">
                        {loading ? (
                            <div className="loading-state">
                                <p>🍽️ Loading fresh stories...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <p>❌ {error}</p>
                                <button onClick={loadCommunityFeed}>Try Again</button>
                            </div>
                        ) : (
                            <div className="posts-grid">
                                {filtered.length > 0 ? filtered.map(post => (
                                    <div key={post.id} className="post-card animate-fade-up">
                                        <div className="post-body">
                                            <div className="post-author" onClick={() => setSelectedUserPost(post)} style={{ cursor: 'pointer' }} title="View Profile & Reply">
                                                <img src={post.avatar} alt={post.user} className="author-avatar" />
                                                <div>
                                                    <strong className="hover-underline">{post.user}</strong>
                                                    <span className="post-time">{post.time}</span>
                                                </div>
                                            </div>
                                            <p className="recipe-ref">on <strong>{post.recipeTitle}</strong></p>
                                            <p className="post-content">"{post.content}"</p>
                                            <div className="post-actions">
                                                <button
                                                    className={`action-btn ${likedIds.includes(post.id) ? 'liked' : ''}`}
                                                    onClick={() => handleLike(post.id)}
                                                >
                                                    {likedIds.includes(post.id) ? '❤️' : '🤍'} {post.likes + (likedIds.includes(post.id) ? 1 : 0)}
                                                </button>
                                                {post.rating > 0 && <span className="post-rating">{'⭐'.repeat(post.rating)}</span>}
                                                <span className="post-tag" style={{ background: TAG_COLORS[post.tag] || 'var(--accent)' }}>{post.tag}</span>
                                                
                                                {user?.email?.toLowerCase() === post?.email?.toLowerCase() && (
                                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', background: 'rgba(109, 186, 95, 0.1)', padding: '5px 10px', borderRadius: '12px' }}>
                                                        <button 
                                                            className="action-btn" 
                                                            onClick={(e) => { e.stopPropagation(); setEditingPost(post); }} 
                                                            title="Edit My Post"
                                                            style={{ padding: '6px 12px', fontSize: '1.1rem', background: 'white' }}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button 
                                                            className="action-btn" 
                                                            onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} 
                                                            title="Delete My Post"
                                                            style={{ padding: '6px 12px', fontSize: '1.1rem', color: '#ef4444', background: 'white' }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">
                                        <p>No reviews found for this category yet. Be the first to start a thread! 💬</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="user-profile-page animate-fade-in" style={{ padding: '20px 0' }}>
                        <button
                            className="back-link"
                            onClick={() => setSelectedUserPost(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color, #6dba5f)', cursor: 'pointer', fontSize: '1.1em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            ← Back to Feed
                        </button>

                        <div style={{ background: 'var(--bg-primary, #fff)', padding: '30px', borderRadius: '15px', boxShadow: 'var(--shadow)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                                <img src={selectedUserPost.avatar} alt={selectedUserPost.user} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--primary-color)' }} />
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{selectedUserPost.user}'s Thread</h2>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Posted on {selectedUserPost.time}</span>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-secondary, #f8f9fa)', padding: '25px', borderRadius: '12px', marginBottom: '30px', borderLeft: '4px solid var(--accent, #6dba5f)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem' }}>
                                    <span>Discussion: <strong>{selectedUserPost.recipeTitle}</strong></span>
                                    {selectedUserPost.rating > 0 && <span className="modal-rating">{'⭐'.repeat(selectedUserPost.rating)}</span>}
                                </div>
                                <p style={{ fontStyle: 'italic', margin: 0, fontSize: '1.2rem', lineHeight: '1.6' }}>"{selectedUserPost.content}"</p>
                            </div>

                            <div style={{ marginTop: '40px' }}>
                                <h3 style={{ marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>Replies</h3>
                                <div style={{ marginBottom: '25px' }}>
                                    {(selectedUserPost.replies || []).map((reply, idx) => (
                                        <div key={reply._id || idx} className="reply-bubble animate-slide-up" style={{ background: 'var(--bg-secondary, #f8f9fa)', padding: '15px', borderRadius: '12px', marginBottom: '12px', fontSize: '1.05em' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <strong style={{ color: 'var(--primary-color)' }}>{reply.user} {user?.email?.toLowerCase() === reply.email?.toLowerCase() && "(You)"}</strong>
                                                {user?.email?.toLowerCase() === reply.email?.toLowerCase() && (
                                                    <div style={{ display: 'flex', gap: '12px', background: 'white', padding: '4px 8px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                        <button className="text-btn" onClick={() => handleEditReply(selectedUserPost.id, reply)} title="Edit My Reply" style={{ fontSize: '1.1rem', cursor: 'pointer' }}>✏️</button>
                                                        <button className="text-btn" onClick={() => handleDeleteReply(selectedUserPost.id, reply._id)} title="Delete My Reply" style={{ fontSize: '1.1rem', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                                                    </div>
                                                )}
                                            </div>
                                            {editingReply?._id === reply._id ? (
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                                    <input 
                                                        type="text" 
                                                        value={editingReply.text} 
                                                        onChange={e => setEditingReply({...editingReply, text: e.target.value})}
                                                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                                    />
                                                    <button onClick={handleUpdateReply} className="action-btn" style={{ background: 'var(--primary-color)', color: 'white' }}>Save</button>
                                                    <button onClick={() => setEditingReply(null)} className="action-btn">Cancel</button>
                                                </div>
                                            ) : (
                                                reply.text
                                            )}
                                        </div>
                                    ))}
                                    {(!selectedUserPost.replies || selectedUserPost.replies.length === 0) &&
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1em', textAlign: 'center', padding: '20px' }}>No replies yet. Be the first to answer or share!</p>
                                    }
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <input
                                        type="text"
                                        placeholder="Add to the discussion..."
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        style={{ flex: 1, padding: '15px 20px', borderRadius: '25px', border: '2px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1em' }}
                                    />
                                    <button
                                        style={{ padding: '0 30px', borderRadius: '25px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em', transition: 'all 0.2s' }}
                                        onClick={handleReply}>Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Action Button for New Post - Always Visible */}
                <div 
                    className="fab-add-post" 
                    onClick={() => user ? setShowNewPostModal(true) : alert('Please login to share your thoughts!')}
                    title="Start a new discussion thread"
                    style={{ 
                        position: 'fixed', 
                        bottom: '30px', 
                        right: '30px', 
                        width: '60px', 
                        height: '60px', 
                        background: 'var(--primary-color, #6dba5f)', 
                        color: 'white', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        fontSize: '2rem', 
                        cursor: 'pointer', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)', 
                        zIndex: 99999, 
                        transition: 'transform 0.2s ease',
                        border: 'none',
                        outline: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    +
                </div>

                {/* New Thread Modal */}
                {showNewPostModal && (
                    <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000 }}>
                        <div className="modal-content animate-slide-up" style={{ background: 'var(--bg-primary, #fff)', color: 'var(--text-primary, #333)', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Start a Discussion</h2>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Topic / Recipe Name (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Baking advice, or a specific recipe" 
                                    value={newPostRecipe} 
                                    onChange={e => setNewPostRecipe(e.target.value)} 
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color, #ccc)' }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Rating (How was it?)</label>
                                <div className="star-rating" style={{ fontSize: '1.5rem', display: 'flex', gap: '5px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span 
                                            key={star} 
                                            style={{ cursor: 'pointer', color: star <= newPostRating ? 'gold' : '#ccc' }}
                                            onClick={() => setNewPostRating(star)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Your Message*</label>
                                <textarea 
                                    placeholder="What's on your mind? Ask a question or share a tip..." 
                                    value={newPostContent} 
                                    onChange={e => setNewPostContent(e.target.value)} 
                                    rows={5}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color, #ccc)', resize: 'vertical' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setShowNewPostModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--bg-secondary, #eee)', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                <button onClick={handleCreatePost} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color, #6dba5f)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Post to Community</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Post Modal */}
                {editingPost && (
                    <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000 }}>
                        <div className="modal-content animate-slide-up" style={{ background: 'var(--bg-primary, #fff)', color: 'var(--text-primary, #333)', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Your Post</h2>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Rating</label>
                                <div className="star-rating" style={{ fontSize: '1.5rem', display: 'flex', gap: '5px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span 
                                            key={star} 
                                            style={{ cursor: 'pointer', color: star <= (editingPost.rating || 0) ? 'gold' : '#ccc' }}
                                            onClick={() => setEditingPost({...editingPost, rating: star})}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Message</label>
                                <textarea 
                                    value={editingPost.content} 
                                    onChange={e => setEditingPost({...editingPost, content: e.target.value})} 
                                    rows={5}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color, #ccc)', resize: 'vertical' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setEditingPost(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--bg-secondary, #eee)', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                <button 
                                    onClick={handleUpdatePost} 
                                    disabled={submittingEdit}
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        background: submittingEdit ? '#ccc' : 'var(--primary-color, #6dba5f)', 
                                        color: 'white', 
                                        cursor: submittingEdit ? 'default' : 'pointer', 
                                        fontWeight: 'bold' 
                                    }}
                                >
                                    {submittingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
