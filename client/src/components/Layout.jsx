import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatBotOverlay from "./ChatBotOverlay";
import { Menu } from "lucide-react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"}
          ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
          transition-transform duration-300 ease-in-out
        `}
      >
        <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background transition-colors duration-300">
          <div className="max-w-container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatBotOverlay />
    </div>
  );
};

export default Layout;
