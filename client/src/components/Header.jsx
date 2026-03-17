import React, { useState } from "react";
import {
  Menu,
  Bell,
  Settings,
  Search,
  Sun,
  Moon,
  ChevronDown,
  User,
} from "lucide-react";
import profileImage from "@/assets/logo.png";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-primary dark:bg-[#1F3A1C] text-white shadow-md">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">
            <Search className="w-4 h-4 text-white/70 mr-2" />
            <input
              type="text"
              placeholder="Search crops, weather, markets..."
              className="bg-transparent outline-none text-sm w-48 text-white placeholder:text-white/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-white/10 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-accent" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </button>

          <button className="p-2 rounded-md hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </button>

          <button className="p-2 rounded-md hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-white/10"
            >
              <img
                src={profileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
              />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-white">
                  {user?.name || "Guest"}
                </span>
                <span className="text-xs text-white/70 capitalize">
                  {user?.role || "user"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/70" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
