import React, { useState } from "react";
import { useCustomerReportData } from "./hooks/useCustomerReportData";
import { filterCollectionsByCustomer } from "./utils/filterUtils";
import CollectionsList from "./components/CollectionsList";

const CustomerReport = () => {
  const {
    patsansthaData,
    transactionData,
    loading,
    error,
    handleRefreshData,
  } = useCustomerReportData();

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAgent, setExpandedAgent] = useState(null);

  if (loading && !patsansthaData && !transactionData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            Transactions
          </h1>
          <p className="text-gray-600">Detailed collection data per customer</p>
        </div>

        {/* <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading Transactions...</span>
          </div>
        </div> */}
      </div>
    );
  }

  if (error && !patsansthaData && !transactionData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            Transactions
          </h1>
          <p className="text-gray-600">Detailed collection data per customer</p>
        </div>

        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredCollections = filterCollectionsByCustomer(
    patsansthaData,
    searchTerm
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">
          Transactions
        </h1>
        <p className="text-gray-600">Detailed collection data per customer</p>
      </div>

      <CollectionsList
        collections={filteredCollections}
        expandedAgent={expandedAgent}
        onToggleExpand={setExpandedAgent}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        patsansthaData={patsansthaData}
        showInternalLoading={false}
        parentLoading={loading}
        parentError={error}
      />
    </div>
  );
};

export default CustomerReport;
