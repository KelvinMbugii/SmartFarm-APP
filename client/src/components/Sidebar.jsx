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
  CreditCard,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

/* ---------------------------------- Utils --------------------------------- */

const getRoleHomePath = (role) => {
  switch (role) {
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

const isAdminLinkActive = (location, href) => {
  const [pathname, query = ""] = href.split("?");

  if (location.pathname !== pathname) return false;
  if (!query) return location.search === "";

  return location.search === `?${query}`;
};

/* ---------------------------------- Menus --------------------------------- */

const roleMenus = (role) => ({
  farmer: [
    {
      title: "Dashboard",
      links: [{ name: "Overview", icon: Home, href: getRoleHomePath(role) }],
    },
    {
      title: "Core Features",
      links: [
        { name: "Sell Produce", icon: Package, href: "/sell-produce" },
        { name: "My Orders", icon: ShoppingCart, href: "/my-orders" },
        { name: "Marketplace", icon: ShoppingCart, href: "/marketplace" },
      ],
    },
    {
      title: "Consultations & AI",
      links: [
        { name: "Chats", icon: MessageCircle, href: "/chat" },
        { name: "Consultations", icon: Calendar, href: "/consultations" },
        { name: "AI Assistant", icon: BarChart3, href: "/ai-assistant" },
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
        { name: "Notifications", icon: MessageCircle, href: "/notifications" },
      ],
    },
    {
      title: "Settings",
      links: [
        { name: "Profile & Settings", icon: User, href: "/profile" },
        { name: "Payment Methods", icon: CreditCard, href: "/payment-methods" },
      ],
    },
  ],

  agripreneur: [
    {
      title: "Dashboard",
      links: [{ name: "Overview", icon: Home, href: getRoleHomePath(role) }],
    },
    {
      title: "Core Features",
      links: [
        { name: "My Products", icon: Package, href: "/agripreneur-dashboard" },
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
        { name: "Customer Messages", icon: MessageCircle, href: "/chat" },
      ],
    },
    {
      title: "Settings",
      links: [
        { name: "Profile & Payments", icon: User, href: "/profile" },
        { name: "Payment Methods", icon: CreditCard, href: "/payment-methods" },
      ],
    },
  ],

  officer: [
    {
      title: "Dashboard",
      links: [{ name: "Overview", icon: Home, href: getRoleHomePath(role) }],
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
      links: [
        { name: "Weather Advisory", icon: CloudSun, href: "/weather" },
        { name: "Notifications", icon: MessageCircle, href: "/notifications" },
      ],
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
          href: "/marketplace-control",
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
        { name: "System Alerts", icon: Siren, href: "/system-alerts" },
      ],
    },
    {
      title: "Settings",
      links: [{ name: "System Settings", icon: User, href: "/profile" }],
    },
  ],
});

/* -------------------------------- Component ------------------------------- */

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const role = (user?.role || "default").toLowerCase();
  const sections = roleMenus(role)[role] || [];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold text-brand dark:text-green-400">
          SmartFarm
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {role} Portal
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">
              {section.title}
            </h3>

            <ul className="space-y-1">
              {section.links.map(({ name, icon: Icon, href }) => (
                <li key={name}>
                  <NavLink
                    to={href}
                    className={({ isActive }) => {
                      const active =
                        role === "admin" && href.startsWith("/IT-dashboard")
                          ? isAdminLinkActive(location, href)
                          : isActive;

                      return cn(
                        "flex items-center gap-3 px-6 py-2 rounded-md text-sm font-medium transition-colors",
                        active
                          ? "bg-green-100 dark:bg-green-900/30 text-brand dark:text-green-300"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand dark:hover:text-green-300",
                      );
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
