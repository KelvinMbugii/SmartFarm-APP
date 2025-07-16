import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { Sprout, Bell, User, Search } from 'lucide-react';

const Header = () => {
    const { theme } = useTheme();

    return (
      <header className="app-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <Sprout className="logo-icon" />
              <span className="logo-text">AgriConnect</span>
            </div>
          </div>

          <div className="header-center">
                <div className="search-container">
                <Search className="search-icon" />
                <input
                    type="text"
                    placeholder="Search crops, markets, weather..."
                    className="search-input"
                />
                </div>
          </div>
            <div className="header-right">
                <button className="icon-btn" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                </button>
                <button className="icon-btn" aria-label="Profile">
                <User className="w-5 h-5" />
                </button>
                <ThemeToggle />
            </div>
        </div>
      </header>
    );
};

export default Header;