const { useState } = require("react")
const { useEffect } = require("react")
const { useContext } = require("react")
const { createContext } = require("react")

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () =>{
    const context = useContext(ThemeContext);
    if(!context){
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [ theme, setTheme ] = useState(() => {
        const savedTheme = localStorage.getItem('agriculture-theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        localStorage.setItem('agriculture-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    },[theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,
        toggleTheme,
        isLight: theme === 'light',
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
