import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search by customer name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
);

export default SearchBar;