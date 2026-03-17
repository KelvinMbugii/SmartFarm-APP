import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Calendar,
  MessageCircle,
  TrendingUp,
  LogOut,
  CloudSun,
  ShoppingCart,
  BarChart3,
  Package,
  Users,
  User,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const roleHomePath = (role) => {
    switch (String(role || "").toLowerCase()) {
      case "farmer":
        return "/farmer-dashboard";
      case "agripreneur":
        return "/agripreneur-dashboard";
      case "officer":
        return "/officer-dashboard";
      case "admin":
        return "/IT-dashboard";
      default:
        return "/dashboard";
    }
  };

  const role = String(user?.role || "default").toLowerCase();

  const roleMenus = {
    farmer: [
      {
        title: "Dashboard",
        links: [{ name: "Overview", icon: Home, href: roleHomePath("farmer") }],
      },
      {
        title: "Core Features",
        links: [
          { name: "Sell Produce", icon: Package, href: "/sell-produce" },
          { name: "My Orders", icon: ShoppingCart, href: "/my-orders" },
        ],
      },
      {
        title: "Consultations & AI",
        links: [
          { name: "Consultations", icon: Calendar, href: "/consultations" },
          { name: "AI Assistant", icon: BarChart3, href: "/analytics" },
        ],
      },
      {
        title: "Insights",
        links: [
          { name: "Weather Insights", icon: CloudSun, href: "/weather" },
          { name: "Market Prices", icon: TrendingUp, href: "/market" },
        ],
      },
      {
        title: "Community",
        links: [
          { name: "Community Forum", icon: Users, href: "/forums" },
          {
            name: "Notifications",
            icon: MessageCircle,
            href: "/notifications",
          },
        ],
      },
      {
        title: "Settings",
        links: [
          { name: "Profile & Settings", icon: User, href: "/profile" },
          {
            name: "Payment Methods",
            icon: CreditCard,
            href: "/payment-methods",
          },
        ],
      },
    ],
    agripreneur: [
      {
        title: "Dashboard",
        links: [
          { name: "Overview", icon: Home, href: roleHomePath("agripreneur") },
        ],
      },
      {
        title: "Core Features",
        links: [
          {
            name: "My Products",
            icon: Package,
            href: "/agripreneur-dashboard",
          },
          { name: "Orders", icon: ShoppingCart, href: "/my-orders" },
        ],
      },
      {
        title: "Marketplace & Insights",
        links: [
          { name: "Marketplace", icon: ShoppingCart, href: "/marketplace" },
          { name: "Marketplace Insights", icon: TrendingUp, href: "/market" },
        ],
      },
      {
        title: "Customers",
        links: [
          {
            name: "Customer Messages",
            icon: MessageCircle,
            href: "/customer-messages",
          },
        ],
      },
      {
        title: "Settings",
        links: [
          { name: "Profile & Payments", icon: User, href: "/profile" },
          {
            name: "Payment Methods",
            icon: CreditCard,
            href: "/payment-methods",
          },
        ],
      },
    ],
    officer: [
      {
        title: "Dashboard",
        links: [
          { name: "Overview", icon: Home, href: roleHomePath("officer") },
        ],
      },
      {
        title: "Consultations",
        links: [
          {
            name: "Consultation Management",
            icon: Calendar,
            href: "/consultations",
          },
          { name: "Farmer Requests", icon: MessageCircle, href: "/chat" },
        ],
      },
      {
        title: "Advisory Content",
        links: [
          { name: "Articles & Guides", icon: BookOpen, href: "/knowledge" },
          { name: "Community Forum", icon: Users, href: "/forums" },
        ],
      },
      {
        title: "Insights",
        links: [{ name: "Weather Advisory", icon: CloudSun, href: "/weather" }],
      },
      {
        title: "Settings",
        links: [
          {
            name: "Availability & Settings",
            icon: User,
            href: "/officer-settings",
          },
        ],
      },
    ],
    admin: [
      {
        title: "Dashboard",
        links: [{ name: "Admin Overview", icon: Home, href: "/IT-dashboard" }],
      },
      {
        title: "Governance",
        links: [
          {
            name: "User Management",
            icon: Users,
            href: "/IT-dashboard?view=users",
          },
          {
            name: "Marketplace Control",
            icon: ShoppingCart,
            href: "/marketplace",
          },
        ],
      },
      {
        title: "Monitoring",
        links: [
          {
            name: "Post Moderation",
            icon: BookOpen,
            href: "/IT-dashboard?view=posts",
          },
          {
            name: "Consultations Monitoring",
            icon: Calendar,
            href: "/consultations",
          },
        ],
      },
      {
        title: "Insights",
        links: [
          { name: "Analytics", icon: BarChart3, href: "/analytics" },
          { name: "System Alerts", icon: CloudSun, href: "/weather" },
        ],
      },
      {
        title: "Settings",
        links: [{ name: "System Settings", icon: User, href: "/profile" }],
      },
    ],
  };

  const defaultSections = [
    {
      title: "Main",
      links: [
        { name: "Dashboard", icon: Home, href: roleHomePath(user?.role) },
        { name: "AI Assistant", icon: BarChart3, href: "/analytics" },
        { name: "Knowledge Base", icon: BookOpen, href: "/knowledge" },
        { name: "Consultations", icon: Calendar, href: "/consultations" },
        { name: "Chat", icon: MessageCircle, href: "/chat" },
        { name: "Weather", icon: CloudSun, href: "/weather" },
      ],
    },
    {
      title: "Community",
      links: [
        { name: "Marketplace", icon: ShoppingCart, href: "/marketplace" },
        { name: "My Orders", icon: Package, href: "/my-orders" },
        { name: "Market Prices", icon: TrendingUp, href: "/market" },
        { name: "Forums", icon: Users, href: "/forums" },
      ],
    },
    {
      title: "Settings",
      links: [{ name: "Profile & Settings", icon: User, href: "/profile" }],
    },
  ];

  const sections = roleMenus[role] || defaultSections;

  const isAdminQueryLinkActive = (href) => {
    const [pathname, search = ""] = href.split("?");
    if (location.pathname !== pathname) {
      return false;
    }

    if (!search) {
      return location.search === "";
    }

    return location.search === `?${search}`;
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-lg">
      <div>
        <div className="p-6 bg-primary">
          <h1 className="text-xl font-bold text-white font-heading">
            SmartFarm
          </h1>
          <p className="text-sm text-white/70 capitalize mt-1">
            {user?.role} Portal
          </p>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <h3 className="px-6 text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) => {
                          const active =
                            role === "admin" &&
                            item.href.startsWith("/IT-dashboard")
                              ? isAdminQueryLinkActive(item.href)
                              : isActive;

                          return cn(
                            "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-300",
                            active
                                ? "bg-primary/10 text-primary border-r-4 border-primary"
                                : "text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-green-600 dark:hover:text-green-400",
                          );
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="bg-secondary/10 dark:bg-secondary/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary dark:text-secondary font-heading">Need expert help?</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect with agricultural experts for personalized advice.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors w-full py-2"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
