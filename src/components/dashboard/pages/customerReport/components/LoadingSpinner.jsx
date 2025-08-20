// File: components/reports/CustomerReport/components/LoadingSpinner.js
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
        {message && (
          <p className="mt-3 text-gray-600 text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
