import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {isSidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background transition-colors duration-300">
          <div className="max-w-container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
