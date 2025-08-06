import React from 'react';
import { Menu } from 'lucide-react';

const MobileHeader = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      >
        <Menu className="h-6 w-6" />
      </button>
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <div className="w-10"></div>
    </div>
  );
};

export default MobileHeader;