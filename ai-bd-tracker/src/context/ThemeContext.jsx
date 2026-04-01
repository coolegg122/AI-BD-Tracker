import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const { user, updateUserProfile } = useAuth();
    // Default to 'light' or stored/user preference
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Effect to apply theme class and persist to localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Update theme when user preference changes after login
    useEffect(() => {
        if (user && user.theme && user.theme !== theme) {
            setTheme(user.theme);
        }
    }, [user]);

    const toggleTheme = async (newTheme = null) => {
        const nextTheme = newTheme || (theme === 'light' ? 'dark' : 'light');
        setTheme(nextTheme);
        
        // If logged in, sync with backend
        if (user) {
            try {
                // We'll use a specialized endpoint or general profile update
                await fetch('/api/v1/users/me/preferences', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ theme: nextTheme })
                });
            } catch (err) {
                console.error('Failed to sync theme preference:', err);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
