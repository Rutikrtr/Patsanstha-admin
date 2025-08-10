
// File: components/reports/CustomerReport/components/CustomerTable.js
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Users,
  Phone,
  CreditCard,
  IndianRupee,
  User,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "../utils/formatUtils";
import { useCustomerReportData } from "../hooks/useCustomerReportData";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";
import EmptyState from "./EmptyState";

const CustomerTable = ({ 
  searchTerm, 
  onSearchChange, 
  showInitialLoading = true,
  parentLoading = false,
  parentError = null
}) => {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [retryCount, setRetryCount] = useState(0);

  const {
    patsansthaData,
    transactionData,
    loading,
    error,
    handleRefreshData
  } = useCustomerReportData();

  // Auto-refresh logic
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastRefresh;
      if (timeSinceLastRefresh > 30000) { // 30 seconds
        setShowRefreshButton(true);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [lastRefresh]);

  const handleRefreshClick = useCallback(async () => {
    try {
      await handleRefreshData();
      setLastRefresh(Date.now());
      setShowRefreshButton(false);
      setRetryCount(0);
    } catch (err) {
      console.error('Refresh failed:', err);
      setRetryCount(prev => prev + 1);
    }
  }, [handleRefreshData]);

  const handleRetry = useCallback(() => {
    handleRefreshClick();
  }, [handleRefreshClick]);

  const handleClearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  // Get all transactions with error handling
  const allTransactions = useMemo(() => {
    try {
      if (!transactionData?.transactions || !Array.isArray(transactionData.transactions)) {
        return [];
      }
      return transactionData.transactions;
    } catch (err) {
      console.error('Error processing transactions:', err);
      return [];
    }
  }, [transactionData]);

  // Filter transactions with improved search
  const filteredTransactions = useMemo(() => {
    try {
      if (!searchTerm.trim()) return allTransactions;

      const searchLower = searchTerm.toLowerCase().trim();
      return allTransactions.filter((transaction) => {
        if (!transaction) return false;
        
        const searchFields = [
          transaction.name?.toLowerCase(),
          transaction.accountNo?.toLowerCase(),
          transaction.mobileNumber?.toString(),
          transaction.agentId?.agentname?.toLowerCase(),
          transaction.agentId?.agentno?.toLowerCase()
        ];

        return searchFields.some(field => 
          field && field.includes(searchLower)
        );
      });
    } catch (err) {
      console.error('Error filtering transactions:', err);
      return allTransactions;
    }
  }, [allTransactions, searchTerm]);

  // Sort transactions with improved error handling
  const sortedTransactions = useMemo(() => {
    try {
      return [...filteredTransactions].sort((a, b) => {
        let aValue = a?.[sortField];
        let bValue = b?.[sortField];

        // Handle nested fields
        if (sortField === "agentName") {
          aValue = a?.agentId?.agentname || "";
          bValue = b?.agentId?.agentname || "";
        } else if (sortField === "agentNo") {
          aValue = a?.agentId?.agentno || "";
          bValue = b?.agentId?.agentno || "";
        }

        // Handle null/undefined values
        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";

        // Handle numeric fields
        if (sortField === "prevBalance" || sortField === "collAmt") {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else {
          aValue = aValue.toString().toLowerCase();
          bValue = bValue.toString().toLowerCase();
        }

        const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    } catch (err) {
      console.error('Error sorting transactions:', err);
      return filteredTransactions;
    }
  }, [filteredTransactions, sortField, sortDirection]);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const getSortIcon = useCallback((field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  }, [sortField, sortDirection]);

  const formatDate = useCallback((dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid Date';
    }
  }, []);

  const totalCollection = useMemo(() => {
    try {
      return sortedTransactions.reduce(
        (sum, transaction) => sum + (parseFloat(transaction?.collAmt) || 0),
        0
      );
    } catch (err) {
      console.error('Error calculating total collection:', err);
      return 0;
    }
  }, [sortedTransactions]);

  // Determine which loading/error state to show
  const isInitialLoad = (loading || parentLoading) && allTransactions.length === 0;
  const hasError = (error || parentError) && allTransactions.length === 0;

  // Loading state - only show if parent allows and it's initial load
  if (isInitialLoad && showInitialLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm h-96">
        <LoadingSpinner 
          size="large" 
          message="Loading transactions..." 
          className="h-full"
        />
      </div>
    );
  }

  // Error state - only show if parent allows and no data exists
  if (hasError && showInitialLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm h-96">
        <ErrorDisplay 
          error={error || parentError}
          onRetry={handleRetry}
          title="Failed to load transactions"
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-full max-h-[calc(100vh-120px)] w-full">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-white rounded-t-xl border-b border-gray-200">
        {/* Table Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                Transactions
                {(error || parentError) && allTransactions.length > 0 && (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 ml-2" title="Some data may be outdated" />
                )}
                {(loading || parentLoading) && allTransactions.length > 0 && (
                  <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                Customer transaction data
                {lastRefresh && (
                  <span className="text-xs ml-2">
                    (Last updated: {new Date(lastRefresh).toLocaleTimeString()})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{sortedTransactions.length} Transactions</span>
                {retryCount > 0 && (
                  <span className="text-yellow-600">({retryCount} retries)</span>
                )}
              </div>

              {showRefreshButton && (
                <button
                  onClick={handleRefreshClick}
                  disabled={loading || parentLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {(loading || parentLoading) ? 'Refreshing...' : 'Refresh'}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, account number, mobile, or agent name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading || parentLoading}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            {(loading || parentLoading) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Table Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="w-full">
            <div className="flex">
              {[
                { key: "accountNo", label: "Account No", icon: CreditCard, width: "w-48" },
                { key: "name", label: "Customer Name", icon: User, width: "w-56" },
                { key: "mobileNumber", label: "Mobile", icon: Phone, width: "w-48", sortable: false },
                { key: "collAmt", label: "Collection", icon: IndianRupee, width: "w-48" },
                { key: "agentName", label: "Agent", icon: Users, width: "w-48", sortable: false },
                { key: "time", label: "Time", icon: Calendar, width: "w-48", sortable: false },
              ].map(({ key, label, icon: Icon, width, sortable = true }) => (
                <div
                  key={key}
                  className={`flex-none ${width} px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={sortable ? () => handleSort(key) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    {sortable && (
                      <span className="text-gray-400">
                        {getSortIcon(key)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Table Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full bg-white">
          {sortedTransactions.length === 0 ? (
            <EmptyState
              type={searchTerm ? 'no-search-results' : 'no-data'}
              searchTerm={searchTerm}
              onClearSearch={searchTerm ? handleClearSearch : undefined}
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedTransactions.map((transaction, index) => {
                if (!transaction) return null;
                
                return (
                  <div
                    key={`${transaction._id || index}-${index}`}
                    className="flex hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex-none w-48 px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {transaction.accountNo || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-none w-56 px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {transaction.name || 'Unknown'}
                      </div>
                    </div>
                    <div className="flex-none w-48 px-6 py-4">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate">
                          {transaction.mobileNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-none w-48 px-6 py-4">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium truncate ${
                            (transaction.collAmt || 0) > 0
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {formatCurrency(transaction.collAmt || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-none w-48 px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium truncate">
                          {transaction.agentId?.agentname || 'Unknown'}
                        </div>
                        <div className="text-gray-500 truncate">
                          ({transaction.agentId?.agentno || 'N/A'})
                        </div>
                      </div>
                    </div>
                    <div className="flex-none w-48 px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {transaction.time ? (
                          <div>
                            <div className="truncate">{transaction.time}</div>
                            <div className="text-xs text-gray-400 truncate">
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not collected</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      {sortedTransactions.length > 0 && (
        <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {sortedTransactions.length} of {allTransactions.length} transactions
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            <div className="flex items-center space-x-4">
              <span>Total Collection: </span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalCollection)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;