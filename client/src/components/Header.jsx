import React, { useState } from "react";
import {
  Menu,
  Bell,
  Settings,
  Search,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import profileImage from "@/assets/logo.jpeg";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = ({ isSidebarOpen, setIsSidebarOpen, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white dark:bg-[#2D5A45] shadow-sm border-b border-[#E0DCD7] dark:border-[#3D6A55]">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-[#F8F5F2] dark:hover:bg-white/10 md:hidden"
          >
            <Menu className="w-6 h-6 text-[#1B4332] dark:text-white" />
          </button>

          <div className="flex items-center bg-[#F8F5F2] dark:bg-white/10 px-3 md:px-4 py-2 rounded-full">
            <Search className="w-4 h-4 text-[#1B4332]/50 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-24 md:w-48 text-[#1B4332] dark:text-white placeholder:text-[#1B4332]/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-[#F8F5F2] dark:hover:bg-white/10"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-[#E9B44C]" />
            ) : (
              <Moon className="w-5 h-5 text-[#1B4332]" />
            )}
          </button>

          <button className="p-2 rounded-xl hover:bg-[#F8F5F2] dark:hover:bg-white/10 relative">
            <Bell className="w-5 h-5 text-[#1B4332] dark:text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E9B44C] rounded-full"></span>
          </button>

          <button className="p-2 rounded-xl hover:bg-[#F8F5F2] dark:hover:bg-white/10">
            <Settings className="w-5 h-5 text-[#1B4332] dark:text-white" />
          </button>

          <div className="relative ml-1 md:ml-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F8F5F2] dark:hover:bg-white/10"
            >
              <img
                src={profileImage}
                alt="Profile"
                className="w-8 md:w-10 h-8 md:h-10 rounded-full object-cover border-2 border-[#E9B44C]"
              />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-[#1B4332] dark:text-white font-heading">
                  {user?.name || "Guest"}
                </span>
                <span className="text-xs text-[#1B4332]/60 dark:text-white/60 capitalize font-body">
                  {user?.role || "user"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#1B4332]/60 dark:text-white/60" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2D5A45] border border-[#E0DCD7] dark:border-[#3D6A55] rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-[#1B4332] dark:text-white hover:bg-[#F8F5F2] dark:hover:bg-white/10 font-body"
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
