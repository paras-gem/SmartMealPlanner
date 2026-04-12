import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ user,  children }) => {
    const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [themeColor, setThemeColorState] = useState(() => localStorage.getItem('themeColor') || '#6dba5f');

    const setThemeColor = (hex) => {
        setThemeColorState(hex);
        if (window.ThemeEngine) window.ThemeEngine.setColor(hex);
    };

    const toggleDarkMode = () => {
        const next = !isDark;
        setIsDark(next);
        if (window.ThemeEngine) window.ThemeEngine.setDarkMode(next);
    };

    // Sync on mount in case theme.js ran before React hydrated
    useEffect(() => {
        if (window.ThemeEngine) {
            window.ThemeEngine.setColor(themeColor);
            window.ThemeEngine.setDarkMode(isDark);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ThemeContext.Provider value={{
            isDark, setIsDark, toggleDarkMode,
            themeColor, setThemeColor,
            // keep legacy compat
            previewThemeColor: null,
            setPreviewThemeColor: () => { }
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
