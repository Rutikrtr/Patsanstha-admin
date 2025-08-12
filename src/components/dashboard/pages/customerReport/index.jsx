// File: components/reports/CustomerReport/index.js
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import CollectionsList from './components/CollectionsList';
import { useCustomerReportData } from './hooks/useCustomerReportData';
import { filterCollectionsByCustomer } from './utils/filterUtils';

const CustomerReport = () => {
  const { 
    patsansthaData, 
    transactionData,
    loading, 
    error,
    handleRefreshData
  } = useCustomerReportData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAgent, setExpandedAgent] = useState(null);

  const handleRetry = () => {
    handleRefreshData();
  };

  // Show loading state only for initial load
  if (loading && !patsansthaData && !transactionData) {
    return (
      <div className="min-h-[60vh]">
        <LoadingSpinner 
          size="large"
          message="Loading customer report data..."
          className="h-full"
        />
      </div>
    );
  }

  // Show error state only if no data is available
  if (error && !patsansthaData && !transactionData) {
    return (
      <div className="min-h-[60vh]">
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          title="Failed to load customer report"
          className="h-full"
        />
      </div>
    );
  }

  const filteredCollections = filterCollectionsByCustomer(patsansthaData, searchTerm);

  return (
    <div className="space-y-8">
      <CollectionsList 
        collections={filteredCollections}
        expandedAgent={expandedAgent}
        onToggleExpand={setExpandedAgent}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        patsansthaData={patsansthaData}
        // Pass loading and error states to prevent duplicate loading
        showInternalLoading={false}
        parentLoading={loading}
        parentError={error}
      />
    </div>
  );
};

export default CustomerReport;