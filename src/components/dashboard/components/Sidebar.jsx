import React from 'react';
import { Home, Users, BarChart3, Settings, LogOut, Building2, X } from 'lucide-react';
import '../../assets/sidebar.css'; // Import the CSS file
import PigmyProLogo from '../../assets/PigmyPro.png';

const Sidebar = ({ user, onLogout, isMobileMenuOpen, setIsMobileMenuOpen, activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'agents', icon: Users, label: 'Agents' },
    { id: 'reports', icon: BarChart3, label: 'Customer Feed' },
    { id: 'settings', icon: Settings, label: 'Settings' }
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
      <aside className={`
        sidebar-bg fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        {/* Content wrapper with relative positioning */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header - User Info at TOP - Modern Design */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-black shadow-lg animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-base font-bold text-white truncate bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      {user?.patname}
                    </p>
                  </div>
                  <p className="text-xs text-gray-300 truncate font-medium tracking-wide uppercase">
                    {user?.fullname}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden ml-3 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300 flex-shrink-0 backdrop-blur-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSectionChange(item.id)}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group backdrop-blur-sm
                  ${activeSection === item.id 
                    ? 'bg-gray-800/80 text-white shadow-lg border border-gray-600/50' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 hover:backdrop-blur-md'
                  }
                `}
              >
                <div className={`
                  mr-3 transition-all duration-200
                  ${activeSection === item.id 
                    ? 'text-white' 
                    : 'text-gray-300 group-hover:text-white'
                  }
                `}>
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

          {/* PigmyPro Name & Logout - MOVED TO BOTTOM */}
          <div className="border-t border-gray-600/50 mt-auto backdrop-blur-sm">
            <div className="p-4 space-y-4">
              {/* PigmyPro Branding */}
              <div className="flex items-center space-x-3 p-4 bg-gray-800/80 rounded-lg backdrop-blur-sm border border-gray-600/30">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                    <img 
                      src={PigmyProLogo} 
                      alt="PigmyPro Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  </div>
                <div>
                  <h1 className="text-sm font-bold text-white">Pigmy Pro</h1>
                  <p className="text-xs text-gray-300 font-medium">Agent Management System</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:text-white hover:bg-red-600/30 transition-all duration-200 border border-red-400/20 hover:border-red-400/60 group backdrop-blur-sm"
              >
                <div className="mr-3 group-hover:text-white transition-all duration-200">
                  <LogOut className="h-5 w-5" />
                </div>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;