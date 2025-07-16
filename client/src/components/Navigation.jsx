import React, { useState } from "react";
import { Home, TrendingUp, CloudSun, ShoppingCart, MessageCircle, BarChart3, Leaf, Users, } from "lucide-react";

const Navigation = () => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "crops", label: "My Crops", icon: Leaf },
    { id: "market", label: "Market Prices", icon: TrendingUp },
    { id: "weather", label: "Weather", icon: CloudSun },
    { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
    { id: "community", label: "Community", icon: Users },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`nav-item ${
                activeItem === item.id ? "nav-item-active" : ""
              }`}
              aria-label={item.label}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
