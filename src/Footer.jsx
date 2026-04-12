import React from 'react';

const Footer = ({ user,  tagline = "Better Meals, Better Life ✨" }) => {
    return (
        <footer className="site-footer">
            © 2026 SmartMeal Planner | {tagline}
        </footer>
    );
};

export default Footer;
