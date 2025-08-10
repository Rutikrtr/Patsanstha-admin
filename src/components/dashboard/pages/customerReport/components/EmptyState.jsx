// File: components/reports/CustomerReport/components/EmptyState.js
import React from 'react';
import { Users, Search, Database } from 'lucide-react';

const EmptyState = ({ 
  type = 'no-data',
  searchTerm = '',
  onClearSearch,
  className = ''
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'no-search-results':
        return {
          icon: Search,
          title: 'No transactions found',
          description: `No transactions match "${searchTerm}". Try adjusting your search criteria.`,
          action: onClearSearch && (
            <button
              onClick={onClearSearch}
              className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Clear Search
            </button>
          )
        };
      case 'no-data':
        return {
          icon: Database,
          title: 'No data available',
          description: 'There are no transactions to display at this time.',
          action: null
        };
      default:
        return {
          icon: Users,
          title: 'No transactions found',
          description: 'No transaction data available.',
          action: null
        };
    }
  };

  const { icon: Icon, title, description, action } = getEmptyStateContent();

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-4">{description}</p>
        {action}
      </div>
    </div>
  );
};

export default EmptyState;
