import React from 'react';
import './RecipeModal.css';

const RecipeModal = ({ user,  isOpen, onClose, recipe, isDark }) => {
    if (!isOpen || !recipe) return null;

    return (
        <div className={`recipe-modal-overlay ${isDark ? 'dark' : ''}`} onClick={onClose}>
            <div className="recipe-modal-content animate-pop-in" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                
                <div className="recipe-modal-header">
                    <img src={recipe.image} alt={recipe.title} className="recipe-header-image" />
                    <div className="recipe-header-info">
                        <h2>{recipe.title}</h2>
                        {recipe.tag && <span className="recipe-tag">{recipe.tag}</span>}
                        <div className="recipe-meta">
                            <span>⏱ {recipe.time}</span>
                            <span>📊 {recipe.difficulty}</span>
                        </div>
                    </div>
                </div>

                <div className="recipe-modal-body">
                    <p className="recipe-description">{recipe.desc || recipe.title}</p>
                    
                    <div className="recipe-details-grid">
                        <div className="ingredients-section">
                            <h3>Ingredients</h3>
                            <ul>
                                {recipe.ingredients && recipe.ingredients.map((ing, idx) => (
                                    <li key={idx}>{ing}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="instructions-section">
                            <h3>Instructions</h3>
                            <ol>
                                {recipe.instructions && recipe.instructions.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeModal;
