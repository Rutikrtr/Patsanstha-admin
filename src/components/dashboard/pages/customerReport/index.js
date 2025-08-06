// File: components/reports/CustomerReport/index.js
import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, XCircle } from 'lucide-react';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import OrganizationInfo from './components/OrganizationInfo';
import CollectionsList from './components/CollectionsList';
import { useCustomerReportData } from './hooks/useCustomerReportData';
import { filterCollectionsByCustomer } from './utils/filterUtils';

const CustomerReport = () => {
  const { 
    patsansthaData, 
    loading, 
    error, 
    handleRefreshData 
  } = useCustomerReportData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAgent, setExpandedAgent] = useState(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRefreshData} />;
  }

  const filteredCollections = filterCollectionsByCustomer(patsansthaData, searchTerm);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reports</h1>
          <p className="text-gray-600">View customer data and collection activities</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefreshData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Print Report
          </button>
        </div>
      </div>

      <OrganizationInfo patsansthaData={patsansthaData} />
      <CollectionsList 
        collections={filteredCollections}
        expandedAgent={expandedAgent}
        onToggleExpand={setExpandedAgent}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        patsansthaData={patsansthaData}
      />
    </div>
  );
};

export default CustomerReport;