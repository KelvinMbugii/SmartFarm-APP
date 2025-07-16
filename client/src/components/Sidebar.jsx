import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, ShoppingCart, CloudSun, TrendingUp, User, Tractor} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
    { name: "Weather", href: "/weather", icon: CloudSun },
    { name: "Market Prices", href: "/market", icon: TrendingUp },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-lg p-2">
            <Tractor className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SmartFarm</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {user?.role} Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="px-4 pb-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;