// File: components/reports/CustomerReport/components/CollectionsList.js
import React from 'react';
import CustomerTable from './CustomerTable';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const CollectionsList = ({ 
  searchTerm, 
  onSearchChange, 
  patsansthaData,
  showInternalLoading = true, // New prop to control internal loading
  parentLoading = false,
  parentError = null,
  loading = false,
  error = null,
  onRetry = null
}) => {
  // Don't show internal loading if parent is handling it
  const shouldShowLoading = showInternalLoading && loading && !patsansthaData;
  const shouldShowError = showInternalLoading && error && !patsansthaData;

  // Handle loading state (only if not handled by parent)
  if (shouldShowLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner 
          size="large" 
          message="Loading collections data..." 
        />
      </div>
    );
  }

  // Handle error state (only if not handled by parent)
  if (shouldShowError) {
    return (
      <div className="space-y-6">
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          title="Failed to load collections"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Table */}
      <CustomerTable 
        patsansthaData={patsansthaData}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        // Prevent duplicate loading states
        showInitialLoading={showInternalLoading}
        parentLoading={parentLoading}
        parentError={parentError}
      />
    </div>
  );
};

export default CollectionsList;
