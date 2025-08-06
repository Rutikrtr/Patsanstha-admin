// File: components/reports/CustomerReport/components/ErrorDisplay.js
import React from 'react';
import { XCircle } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 mb-4">Error: {error}</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorDisplay;
