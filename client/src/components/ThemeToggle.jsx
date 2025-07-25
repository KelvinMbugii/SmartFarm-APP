import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme, isLight } = useTheme();

    return (
        <button 
            onClick={toggleTheme}
            className='theme-toggle-btn'
            aria-label = {`Switch to ${isLight ? 'dark' :
                'light'} theme`}
            title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
        >
            <div className="theme-toggle-icon">
                {isLight ?(
                    <Moon className="w-5 h-5"/>
                ):(
                    <Sun className="w-5 h-5"/>
                )}

            </div>
            <span className='theme-toggle-text'>
                {isLight ? 'Dark' : 'Light'} Mode
            </span>

        </button>
    );
};

export default ThemeToggle;