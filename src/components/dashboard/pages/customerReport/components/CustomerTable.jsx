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
  X,
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
  parentError = null,
}) => {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [retryCount, setRetryCount] = useState(0);

  const [selectedAgent, setSelectedAgent] = useState("");

  const {
    patsansthaData,
    transactionData,
    loading,
    error,
    handleRefreshData,
  } = useCustomerReportData();

  // Auto-refresh logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastRefresh > 10000) {
        setShowRefreshButton(true);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastRefresh]);

  const handleRefreshClick = useCallback(async () => {
    try {
      await handleRefreshData();
      setLastRefresh(Date.now());
      setShowRefreshButton(false);
      setRetryCount(0);
    } catch (err) {
      console.error("Refresh failed:", err);
      setRetryCount((prev) => prev + 1);
    }
  }, [handleRefreshData]);

  const allTransactions = useMemo(() => {
    if (
      !transactionData?.transactions ||
      !Array.isArray(transactionData.transactions)
    ) {
      return [];
    }
    return transactionData.transactions;
  }, [transactionData]);

  const uniqueAgents = useMemo(() => {
    const agents = new Map();
    allTransactions.forEach((transaction) => {
      if (transaction?.agentId?.agentname && transaction?.agentId?.agentno) {
        const key = `${transaction.agentId.agentno}`;
        if (!agents.has(key)) {
          agents.set(key, {
            agentno: transaction.agentId.agentno,
            agentname: transaction.agentId.agentname,
            count: 0,
          });
        }
        agents.get(key).count++;
      }
    });
    return Array.from(agents.values()).sort((a, b) =>
      a.agentname.localeCompare(b.agentname)
    );
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((transaction) => {
        if (!transaction) return false;
        const searchFields = [
          transaction.name?.toLowerCase(),
          transaction.accountNo?.toLowerCase(),
          transaction.mobileNumber?.toString(),
          transaction.agentId?.agentname?.toLowerCase(),
          transaction.agentId?.agentno?.toLowerCase(),
        ];
        return searchFields.some(
          (field) => field && field.includes(searchLower)
        );
      });
    }

    if (selectedAgent) {
      filtered = filtered.filter((t) => t.agentId?.agentno === selectedAgent);
    }
    return filtered;
  }, [allTransactions, searchTerm, selectedAgent]);

  const sortedTransactions = useMemo(() => {
    try {
      return [...filteredTransactions].sort((a, b) => {
        let aValue = a?.[sortField];
        let bValue = b?.[sortField];

        if (sortField === "agentName") {
          aValue = a?.agentId?.agentname || "";
          bValue = b?.agentId?.agentname || "";
        } else if (sortField === "agentNo") {
          aValue = a?.agentId?.agentno || "";
          bValue = b?.agentId?.agentno || "";
        }

        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";

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
    } catch {
      return filteredTransactions;
    }
  }, [filteredTransactions, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalCollection = useMemo(() => {
    return sortedTransactions.reduce(
      (sum, t) => sum + (parseFloat(t?.collAmt) || 0),
      0
    );
  }, [sortedTransactions]);

  const clearAgentFilter = () => setSelectedAgent("");

  const isInitialLoad =
    (loading || parentLoading) && allTransactions.length === 0;
  const hasError = (error || parentError) && allTransactions.length === 0;

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

  if (hasError && showInitialLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm h-96">
        <ErrorDisplay
          error={error || parentError}
          onRetry={handleRefreshClick}
          title="Failed to load transactions"
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-full max-h-[calc(107vh-220px)] max-w-6xl mx-auto -mt-4">
      {/* Refresh */}
      <div className="px-3 py-1 flex items-center justify-end border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <button
          onClick={handleRefreshClick}
          disabled={!showRefreshButton || loading || parentLoading}
          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors
            ${
              showRefreshButton
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }
            ${loading || parentLoading ? "opacity-50" : ""}`}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          {loading || parentLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Top Controls */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="p-3 flex flex-wrap gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, account, mobile, or agent..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading || parentLoading}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Agent Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Agents</option>
              {uniqueAgents.map((agent) => (
                <option key={agent.agentno} value={agent.agentno}>
                  {agent.agentname} ({agent.agentno})
                </option>
              ))}
            </select>
            {selectedAgent && (
              <button
                onClick={clearAgentFilter}
                className="text-gray-600 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="flex">
            {[
              {
                key: "accountNo",
                label: "Account No",
                icon: CreditCard,
                minWidth: "min-w-[120px]",
              },
              {
                key: "name",
                label: "Customer Name",
                icon: User,
                minWidth: "min-w-[160px]",
              },
              {
                key: "mobileNumber",
                label: "Mobile",
                icon: Phone,
                minWidth: "min-w-[120px]",
                sortable: false,
              },
              {
                key: "collAmt",
                label: "Collection",
                icon: IndianRupee,
                minWidth: "min-w-[120px]",
              },
              {
                key: "agentName",
                label: "Agent",
                icon: Users,
                minWidth: "min-w-[140px]",
                sortable: false,
              },
              {
                key: "time",
                label: "Time",
                icon: Calendar,
                minWidth: "min-w-[140px]",
              },
            ].map(({ key, label, icon: Icon, minWidth, sortable = true }) => (
              <div
                key={key}
                className={`flex-1 ${minWidth} px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  sortable ? "cursor-pointer hover:bg-gray-100" : ""
                }`}
                onClick={sortable ? () => handleSort(key) : undefined}
              >
                <div className="flex items-center space-x-1">
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                  {sortable && (
                    <span className="text-gray-400">{getSortIcon(key)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {sortedTransactions.length === 0 ? (
            <EmptyState
              type={searchTerm || selectedAgent ? "no-search-results" : "no-data"}
              searchTerm={searchTerm}
              onClearSearch={
                searchTerm || selectedAgent
                  ? () => {
                      onSearchChange("");
                      setSelectedAgent("");
                    }
                  : undefined
              }
            />
          ) : (
            sortedTransactions.map((t, i) => (
              <div key={t._id || i} className="flex hover:bg-gray-50">
                <div className="flex-1 min-w-[120px] px-4 py-2">
                  <span className="text-sm font-medium">
                    {t.accountNo || "N/A"}
                  </span>
                </div>
                <div className="flex-1 min-w-[160px] px-4 py-2">
                  <span className="text-sm font-medium">
                    {t.name || "Unknown"}
                  </span>
                </div>
                <div className="flex-1 min-w-[120px] px-4 py-2">
                  {t.mobileNumber || "N/A"}
                </div>
                <div className="flex-1 min-w-[120px] px-4 py-2 text-green-600 font-medium">
                  {formatCurrency(t.collAmt || 0)}
                </div>
                <div className="flex-1 min-w-[140px] px-4 py-2">
                  {t.agentId?.agentname || "Unknown"}
                </div>
                <div className="flex-1 min-w-[140px] px-4 py-2">
                  {t.time ? (
                    <>
                      <div className="text-sm">{t.time}</div>
                      <div className="text-xs text-gray-400">
                        {formatDate(t.date)}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400 text-sm">
                        Not collected
                      </span>
                      <div className="text-xs invisible">placeholder</div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      {sortedTransactions.length > 0 && (
        <div className="sticky bottom-0 px-4 py-2 border-t border-gray-200 bg-gray-50 rounded-b-xl flex flex-wrap justify-between items-center text-sm text-gray-600 gap-3">
          <span>
            Showing {sortedTransactions.length} of {allTransactions.length}
            {(searchTerm || selectedAgent) && ` (filtered)`}
          </span>
          <div className="flex items-center gap-4">
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                Updated: {new Date(lastRefresh).toLocaleTimeString()}
              </span>
            )}
            <span className="font-semibold text-green-600">
              Total: {formatCurrency(totalCollection)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
