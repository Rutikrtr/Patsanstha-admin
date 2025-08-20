// File: components/reports/CustomerReport/components/ErrorDisplay.js
import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

const ErrorDisplay = ({ error, onRetry, onHome, showHomeButton = false }) => {
  const getErrorMessage = (err) => {
    if (typeof err === "string") return err;
    if (err?.message) return err.message;
    if (err?.error) return err.error;
    return "An unexpected error occurred. Please try again.";
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {getErrorMessage(error)}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}

          {showHomeButton && onHome && (
            <button
              onClick={onHome}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
