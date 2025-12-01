import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate,} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

import { Toaster } from "@/components/ui/sonner";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";



import Chat from "./pages/Chat";
import Marketplace from "./pages/MarketPlace";
import Market from "./pages/Market";
import Weather from "./pages/Weather";
import Profile from "./pages/Profile";
import Knowledge from "./pages/Knowledge";
import Consultations from "./pages/Consultations";
import Forums from "./pages/Forums";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

 import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark text-neutral-dark dark:text-neutral-light transition-colors duration-300">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                <Route path="/" element={<Navigate to="/login" replace />} />
                

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="knowledge" element={<Knowledge />} />
                  <Route path="consultations" element={<Consultations />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="market" element={<Market />} />
                  <Route path="MarketPlace" element={<Marketplace/>}/>
                  <Route path="forums" element={<Forums />} />
                  <Route path="weather" element={<Weather />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Routes>
              <Toaster />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;