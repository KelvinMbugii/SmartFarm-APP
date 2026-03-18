import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Calendar,
  MessageCircle,
  TrendingUp,
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
import logoImage from "@/assets/logo.jpeg";

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

const Sidebar = ({ onLinkClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const role = (user?.role || "default").toLowerCase();
  const sections = roleMenus(role)[role] || [];

  const handleNavClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#1B4332] flex flex-col shadow-xl">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={logoImage}
            alt="SmartFarm Logo"
            className="w-12 h-12 rounded-xl object-cover shadow-md"
          />
          <h1 className="text-2xl font-bold text-white font-heading tracking-wide">
            SmartFarm
          </h1>
        </div>
        <p className="text-sm text-white/60 capitalize font-body">
          {role} Portal
        </p>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-white/40 uppercase mb-3 tracking-wider font-heading">
              {section.title}
            </h3>

            <ul className="space-y-1">
              {section.links.map(({ name, icon: Icon, href }) => (
                <li key={name}>
                  <NavLink
                    to={href}
                    onClick={handleNavClick}
                    className={({ isActive }) => {
                      const active =
                        role === "admin" && href.startsWith("/IT-dashboard")
                          ? isAdminLinkActive(location, href)
                          : isActive;

                      return cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all",
                        active
                          ? "bg-[#E9B44C] text-[#1B4332] rounded-full font-semibold"
                          : "text-white/80 hover:bg-white/10 hover:text-white rounded-lg",
                      );
                    }}
                  >
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full bg-white/10",
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-body">{name}</span>
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
