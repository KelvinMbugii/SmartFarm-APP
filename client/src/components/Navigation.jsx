import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; 
import  {Home, TrendingUp, CloudSun, ShoppingCart, MessageCircle, BarChart3, Leaf, Users,} from "lucide-react";

const Navigation = () => {
  const location = useLocation(); // Get current location from React Router
  const [activeItem, setActiveItem] = useState("dashboard"); 

  const navItems = [
    // Add 'path' property that matches your React Router paths
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "marketPrice", label: "Market Prices", icon: TrendingUp, path: "/market" },
    { id: "weather", label: "Weather", icon: CloudSun, path: "/weather" },
    { id: "marketPlace", label: "Marketplace", icon: ShoppingCart, path: "/marketPlace",}, 
    
    // { id: "community", label: "Community", icon: Users, path: "/community" },
    // { id: "messages", label: "Messages", icon: MessageCircle, path: "/chat" },
    // {
    //   id: "analytics",
    //   label: "Analytics",
    //   icon: BarChart3,
    //   path: "/analytics",
    // },
  ];

  useEffect(() => {
    
    const currentPath = location.pathname;
    const matchedItem = navItems.find((item) =>
      currentPath.startsWith(item.path)
    );
    if (matchedItem) {
      setActiveItem(matchedItem.id);
    } else if (currentPath === "/") {
      
      setActiveItem("dashboard");
    }
  }, [location.pathname, navItems]); 

  return (
    <nav className="navigation">
      <div className="nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              to={item.path}
              key={item.id}
              
              className={`nav-item ${
                activeItem === item.id ? "nav-item-active" : ""
              }`}
              aria-label={item.label}
              
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
