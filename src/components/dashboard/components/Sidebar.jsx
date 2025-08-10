import React from "react";
import {
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  X,
} from "lucide-react";
import "../../assets/sidebar.css"; // Import the CSS file
import PigmyProLogo from "../../assets/PigmyPro.png";

const Sidebar = ({
  user,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeSection,
  setActiveSection,
}) => {
  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "agents", icon: Users, label: "Agents" },
    { id: "reports", icon: BarChart3, label: "Transaction" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Close mobile menu when selecting a section
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        sidebar-bg fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10 flex flex-col h-full">
          <div className="px-3 py-4 mt-5">
            <div className="relative bg-gray-800/80 text-white border border-gray-600/50 rounded-xl p-3 shadow-md overflow-hidden">
              {/* Soft background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>

              <div className="relative flex items-center justify-between">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-sm">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    {/* Status */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border border-white/30 shadow"></div>
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {user?.patname || "Patsanstha Name"}
                    </h3>
                  </div>
                </div>

                {/* Close Button (Mobile) */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden ml-2 p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Thin separator */}
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSectionChange(item.id)}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group backdrop-blur-sm
                  ${
                    activeSection === item.id
                      ? "bg-gray-800/80 text-white shadow-lg border border-gray-600/50"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/60 hover:backdrop-blur-md"
                  }
                `}
              >
                <div
                  className={`
                  mr-3 transition-all duration-200
                  ${
                    activeSection === item.id
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white"
                  }
                `}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                {item.label}
                {/* Active indicator */}
                {activeSection === item.id && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto px-3 py-3 mb-4">
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-md overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-40"></div>

              {/* Content */}
              <div className="relative flex flex-col justify-center items-center">
                {/* Logo */}
                <div className="group cursor-pointer hover:scale-105 transition-transform duration-300">
                  <div className="relative">
                    {/* Glow on hover */}
                    <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <img
                      src={PigmyProLogo}
                      alt="PigmyPro Logo"
                      className="relative h-8 w-auto object-contain drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Copyright */}
                <div className="mt-2 text-center">
                  <p className="text-[8px] text-white/60 font-medium">
                    © TechyVerve
                  </p>
                  <p className="text-[7px] text-white/40 mt-0.5">
                    All rights reserved 2024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
