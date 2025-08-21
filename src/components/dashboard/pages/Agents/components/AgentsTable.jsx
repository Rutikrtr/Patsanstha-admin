import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Upload,
  FileText,
  Phone,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { patsansthaAPI } from "../../../../../services/api";

// Error Popup Modal Component
const ErrorModal = ({ isOpen, onClose, errorMessage }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      {/* Backdrop - Non-clickable */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all animate-pulse-once"
           style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Error</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {errorMessage}
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const AgentsTable = ({
  filteredAgents,
  patsansthaData,
  searchTerm,
  setSearchTerm,
  onRefreshData,
}) => {
  const [collectionStatus, setCollectionStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [downloadingAgent, setDownloadingAgent] = useState(null);
  const [uploadingAgent, setUploadingAgent] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleApiError = (error, defaultMessage = "An error occurred") => {
    console.error("API Error:", error);

    let message = defaultMessage;

    if (error?.message) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.data?.message) {
      message = error.data.message;
    }

    setErrorMessage(message);
    setShowErrorModal(true);
    return message;
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastRefresh;
      if (timeSinceLastRefresh > 10000) {
        setShowRefreshButton(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastRefresh]);

  const fetchCollectionStatus = async () => {
    setLoadingStatus(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await patsansthaAPI.getAgentCollectionStatus(today);

      if (response && response.data) {
        setCollectionStatus(response.data);
        setLastRefresh(Date.now());
        setShowRefreshButton(false);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch collection status");
      setCollectionStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const promises = [fetchCollectionStatus(), patsansthaAPI.viewData()];
      const [, freshDataResponse] = await Promise.all(promises);

      if (onRefreshData && typeof onRefreshData === "function") {
        onRefreshData(freshDataResponse?.data || freshDataResponse);
      }
    } catch (error) {
      handleApiError(error, "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileUpload = async (agentno) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".txt")) {
        handleApiError("Please select a .txt file");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        handleApiError("File size too large. Maximum size allowed is 5MB");
        return;
      }

      setUploadingAgent(agentno);
      setUploadProgress((prev) => ({ ...prev, [agentno]: 0 }));

      try {
        const formData = new FormData();
        formData.append("file", file);

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [agentno]: Math.min((prev[agentno] || 0) + 10, 90),
          }));
        }, 100);

        await patsansthaAPI.uploadAgentFile(agentno, formData);

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [agentno]: 100 }));

        const refreshPromises = [fetchCollectionStatus(), patsansthaAPI.viewData()];
        const [, freshDataResponse] = await Promise.all(refreshPromises);

        if (onRefreshData && typeof onRefreshData === "function") {
          onRefreshData(freshDataResponse?.data || freshDataResponse);
        }
      } catch (error) {
        handleApiError(error, "Upload failed");
      } finally {
        setUploadingAgent(null);
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[agentno];
            return newProgress;
          });
        }, 2000);
      }
    };

    input.click();
  };

  const handleDownloadCollection = async (agentno) => {
  setDownloadingAgent(agentno);
  try {
    const response = await patsansthaAPI.downloadAgentCollection(agentno);

    if (!response || !response.fileContent) {
      throw new Error("No file content received from server");
    }

    const { filename, fileContent } = response;

    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename; // ✅ Use filename from backend

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    await fetchCollectionStatus();
  } catch (error) {
    handleApiError(error, "Download failed");
  } finally {
    setDownloadingAgent(null);
  }
};


  useEffect(() => {
    fetchCollectionStatus();
  }, []);

  const getAgentCollectionInfo = (agentno) => {
    if (!collectionStatus?.agents) return null;
    return collectionStatus.agents.find((agent) => agent.agentno === agentno);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div>
      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={closeErrorModal}
        errorMessage={errorMessage}
      />

      {/* TABLE CONTAINER WITH FIXED HEIGHT AND SCROLLABLE BODY */}
      <div className="h-[34rem] overflow-hidden border border-gray-200 rounded-lg">
        {/* TOP BAR - INSIDE BORDER */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing || loadingStatus}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    showRefreshButton
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="min-w-[4.5rem] text-left">{refreshing ? "Updating..." : "Refresh"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <table className="w-full">
          {/* FIXED HEADER */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Agent Details
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Agent ID
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mobile Number
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Collection Status
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
        </table>

        {/* SCROLLABLE BODY */}
        <div className="h-[27rem] overflow-y-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAgents.map((agent, index) => {
                const collectionInfo = getAgentCollectionInfo(agent.agentno);

                return (
                  <tr
                    key={agent.agentno}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-5 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-semibold text-sm">
                              {agent.agentname?.charAt(0)?.toUpperCase() || "A"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {agent.agentname || "Unknown Agent"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Agent #{String(index + 1).padStart(3, "0")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="inline-flex items-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 font-medium text-xs rounded-full">
                          {agent.agentno || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {agent.mobileNumber
                            ? `+91 ${agent.mobileNumber.slice(0, 5)} ${agent.mobileNumber.slice(5)}`
                            : "Not provided"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center">
                      {collectionInfo ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-center space-x-2">
                            {collectionInfo.submitted ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-700 text-xs font-medium">
                                  Submitted
                                </span>
                              </>
                            ) : collectionInfo.hasData ? (
                              <>
                                <Clock className="h-3 w-3 text-yellow-500" />
                                <span className="text-yellow-700 text-xs font-medium">
                                  Data Uploaded
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="text-red-700 text-xs font-medium">
                                  No Data
                                </span>
                              </>
                            )}
                          </div>
                          {collectionInfo.hasData && (
                            <div className="text-xs text-gray-500">
                              {collectionInfo.totalTransactions || 0} transactions
                              <br />
                              {formatCurrency(collectionInfo.totalAmount || 0)}
                            </div>
                          )}
                          {collectionInfo.submittedAt && (
                            <div className="text-xs text-green-600">
                              {new Date(collectionInfo.submittedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                          <span className="text-gray-400 text-xs">Loading...</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleFileUpload(agent.agentno)}
                          disabled={uploadingAgent === agent.agentno}
                          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                            collectionInfo?.hasData
                              ? "text-green-600 hover:bg-green-50 border border-green-200"
                              : "text-blue-600 hover:bg-blue-50 border border-blue-200"
                          }`}
                          title="Upload Data File"
                        >
                          {uploadingAgent === agent.agentno ? (
                            <div className="relative">
                              <Upload className="h-3 w-3 animate-spin" />
                              {uploadProgress[agent.agentno] && (
                                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
                                  {uploadProgress[agent.agentno]}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <FileText className="h-3 w-3" />
                          )}
                        </button>

                        {collectionInfo?.submitted && collectionInfo?.hasData ? (
                          <button
                            onClick={() => handleDownloadCollection(agent.agentno)}
                            disabled={downloadingAgent === agent.agentno}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-105 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              collectionInfo.downloaded
                                ? "Re-download Collection File"
                                : "Download Collection File"
                            }
                          >
                            {downloadingAgent === agent.agentno ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-2 text-gray-400 rounded-lg border border-gray-200 opacity-50 cursor-not-allowed"
                            title="Collection not available for download"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* EMPTY STATE - Inside scrollable area */}
          {filteredAgents.length === 0 && (
            <div className="text-center py-12 bg-white">
              <div className="mx-auto mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? "Try adjusting your search criteria to find agents."
                  : "No agents are currently available in the system."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentsTable;