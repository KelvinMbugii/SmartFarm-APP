import React from "react";
import { NavLink } from "react-router-dom";
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
        links: [
          { name: "Overview", icon: Home, href: roleHomePath("agripreneur") },
        ],
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
          { name: "Customer Messages", icon: MessageCircle, href: "/customer-messages" },
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
        links: [{ name: "Overview", icon: Home, href: roleHomePath("officer") }],
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
        ],
      },
      {
        title: "Settings",
        links: [
          {
            name: "Availability & Settings",
            icon: User,
            href: "/profile",
          },
        ],
      },
    ],
    admin: [
      {
        title: "Dashboard",
        links: [{ name: "Admin Overview", icon: Home, href: roleHomePath("admin") }],
      },
      {
        title: "Governance",
        links: [
          { name: "User Management", icon: Users, href: "/dashboard" },
          { name: "Marketplace Control", icon: ShoppingCart, href: "/marketplace" },
        ],
      },
      {
        title: "Monitoring",
        links: [
          {
            name: "Consultations Monitoring",
            icon: Calendar,
            href: "/consultations",
          },
          { name: "Content Moderation", icon: BookOpen, href: "/forums" },
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

  return (
    // <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between">
    //   <div>
    //     <div className="p-6 border-b border-gray-100">
    //       <h1 className="text-xl font-bold text-brand">SmartFarm</h1>
    //       <p className="text-sm text-gray-500 capitalize">
    //         {user?.role} Portal
    //       </p>
    //     </div>

    //     <nav className="mt-4 flex-1 overflow-y-auto">
    //       {sections.map((section) => (
    //         <div key={section.title} className="mb-6">
    //           <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase mb-2">
    //             {section.title}
    //           </h3>
    //           <ul className="space-y-1">
    //             {section.links.map((item) => {
    //               const Icon = item.icon;
    //               return (
    //                 <li key={item.name}>
    //                   <NavLink
    //                     to={item.href}
    //                     className={({ isActive }) =>
    //                       cn(
    //                         "flex items-center gap-3 px-6 py-2 rounded-md text-sm font-medium transition-colors",
    //                         isActive
    //                           ? "bg-green-100 text-brand"
    //                           : "text-gray-600 hover:bg-gray-50 hover:text-brand"
    //                       )
    //                     }
    //                   >
    //                     <Icon className="h-5 w-5" />
    //                     {item.name}
    //                   </NavLink>
    //                 </li>
    //               );
    //             })}
    //           </ul>
    //         </div>
    //       ))}
    //     </nav>
    //   </div>

    //   <div className="p-4 border-t border-gray-100">
    //     <div className="bg-green-50 p-4 rounded-lg text-sm text-gray-700">
    //       <div className="flex items-center gap-2 mb-2">
    //         <HelpCircle className="h-4 w-4 text-brand" />
    //         <span className="font-semibold">Need expert help?</span>
    //       </div>
    //       <p>Connect with agricultural experts for personalized advice.</p>
    //     </div>
    //   </div>
    //   {/* Footer / Logout */}
    //   <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-5">
    //     <button
    //       onClick={logout}
    //       className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors w-full"
    //     >
    //       <LogOut className="h-5 w-5" />
    //       <span>Logout</span>
    //     </button>
    //   </div>
    // </aside>

    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-xl font-bold text-brand dark:text-green-400">
            SmartFarm
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {user?.role} Portal
          </p>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-6 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-6 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                              ? "bg-green-100 dark:bg-green-900/30 text-brand dark:text-green-300"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand dark:hover:text-green-300"
                          )
                        }
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

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-brand dark:text-green-300" />
            <span className="font-semibold">Need expert help?</span>
          </div>
          <p>Connect with agricultural experts for personalized advice.</p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-5">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

  );
};

export default Sidebar;

// import React from "react";
// import { NavLink } from "react-router-dom";
// import {
//   Home,
//   BookOpen,
//   Calendar,
//   MessageCircle,
//   TrendingUp,
//   LogOut,
//   CloudSun,
//   ShoppingCart,
//   Bot,
//   Package,
//   Users,
//   User,
//   HelpCircle,
// } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { useAuth } from "@/contexts/AuthContext";

// /* ---------------------------------- */
// /* Role Home Path Helper */
// /* ---------------------------------- */
// const getRoleHomePath = (role) => {
//   switch (String(role || "").toLowerCase()) {
//     case "farmer":
//       return "/farmer-dashboard";
//     case "agripreneur":
//       return "/agripreneur-dashboard";
//     case "officer":
//       return "/officer-dashboard";
//     case "admin":
//       return "/IT-dashboard";
//     default:
//       return "/dashboard";
//   }
// };

// /* ---------------------------------- */
// /* Sidebar Component */
// /* ---------------------------------- */
// const Sidebar = () => {
//   const { user, logout } = useAuth();

//   const sections = [
//     {
//       title: "Main",
//       links: [
//         { name: "Dashboard", icon: Home, href: getRoleHomePath(user?.role) },
//         { name: "AI Assistant", icon: Bot, href: "/ai-assistant" },
//         { name: "Knowledge Base", icon: BookOpen, href: "/knowledge" },
//         { name: "Consultations", icon: Calendar, href: "/consultations" },
//         { name: "Weather", icon: CloudSun, href: "/weather" },
//       ],
//     },
//     {
//       title: "Community",
//       links: [
//         { name: "Marketplace", icon: ShoppingCart, href: "/marketplace" },
//         { name: "My Orders", icon: Package, href: "/my-orders" },
//         { name: "Market Prices", icon: TrendingUp, href: "/market" },
//         { name: "Forums", icon: Users, href: "/forums" },
//       ],
//     },
//     {
//       title: "Settings",
//       links: [{ name: "Profile & Settings", icon: User, href: "/profile" }],
//     },
//   ];

//   return (
//     <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between">
//       {/* Top Section */}
//       <div>
//         {/* Logo */}
//         <div className="p-6 border-b border-gray-100 dark:border-gray-800">
//           <h1 className="text-xl font-bold text-brand dark:text-green-400">
//             SmartFarm
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
//             {user?.role} Portal
//           </p>
//         </div>

//         {/* Navigation */}
//         <nav className="mt-4 flex-1 overflow-y-auto">
//           {sections.map((section) => (
//             <div key={section.title} className="mb-6">
//               <h3 className="px-6 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">
//                 {section.title}
//               </h3>

//               <ul className="space-y-1">
//                 {section.links.map((item) => {
//                   const Icon = item.icon;

//                   return (
//                     <li key={item.name}>
//                       <NavLink
//                         to={item.href}
//                         className={({ isActive }) =>
//                           cn(
//                             "flex items-center gap-3 px-6 py-2 rounded-md text-sm font-medium transition-colors",
//                             isActive
//                               ? "bg-green-100 dark:bg-green-900/30 text-brand dark:text-green-300"
//                               : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand dark:hover:text-green-300",
//                           )
//                         }
//                       >
//                         <Icon className="h-5 w-5" />
//                         {item.name}
//                       </NavLink>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           ))}
//         </nav>
//       </div>

//       {/* Help Card */}
//       <div className="p-4 border-t border-gray-100 dark:border-gray-800">
//         <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300">
//           <div className="flex items-center gap-2 mb-2">
//             <HelpCircle className="h-4 w-4 text-brand dark:text-green-300" />
//             <span className="font-semibold">Need expert help?</span>
//           </div>
//           <p>Connect with agricultural experts for personalized advice.</p>
//         </div>
//       </div>

//       {/* Logout */}
//       <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-5">
//         <button
//           onClick={logout}
//           className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors w-full"
//         >
//           <LogOut className="h-5 w-5" />
//           <span>Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;