// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate,} from "react-router-dom";
// import { AuthProvider } from "./contexts/AuthContext";
// import { SocketProvider } from "./contexts/SocketContext";
// import { ThemeProvider } from "./contexts/ThemeContext";
// import { Toaster } from "@/components/ui/sonner";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Chat from "./pages/Chat";
// import Market from "./pages/Market";
// import Weather from "./pages/Weather";
// import Profile from "./pages/Profile";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Layout from "./components/Layout";
// import "./App.css";

// function App() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <SocketProvider>
//           <Router>
//             <div className="min-h-screen bg-background">
//               <Routes>
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/" element={<Navigate to="/login" replace />} />

//                 <Route
//                   path="/"
//                   element={
//                     <ProtectedRoute>
//                       <Layout />
//                     </ProtectedRoute>
//                   }
//                 >
//                   <Route path="dashboard" element={<Dashboard />} />
//                   <Route path="chat" element={<Chat />} />
//                   <Route path="market" element={<Market />} />
//                   <Route path="weather" element={<Weather />} />
//                   <Route path="market" element={<Market />} />
//                   <Route path="profile" element={<Profile />} />
//                 </Route>
//               </Routes>
//               <Toaster />
//             </div>
//           </Router>
//         </SocketProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }

// export default App;


// import React from "react";
// import { ThemeProvider } from "./contexts/ThemeContext";
// import Header from "./components/Header";
// import Navigation from "./components/Navigation";
// import Dashboard from "./components/Dashboard";
// import "./App.css";

// function App() {
//   return (
//     <ThemeProvider>
//       <div className="app">
//         <Header />
//         <div className="app-body">
//           <Navigation />
//           <main className="main-content">
//             <Dashboard />
//           </main>
//         </div>
//       </div>
//     </ThemeProvider>
//   );
// }

// export default App;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

import { Toaster } from "@/components/ui/sonner";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Marketplace from "./pages/MarketPlace";
import Market from "./pages/Market";
import Weather from "./pages/Weather";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
                  <Route path="chat" element={<Chat />} />
                  <Route path="market" element={<Market />} />
                  <Route path="MarketPlace" element={<Marketplace/>}/>
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
