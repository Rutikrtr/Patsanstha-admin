// File: components/reports/CustomerReport/components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading reports...</p>
    </div>
  </div>
);

export default LoadingSpinner;