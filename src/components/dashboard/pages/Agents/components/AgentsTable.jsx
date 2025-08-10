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
} from "lucide-react";
import { patsansthaAPI } from "../../../../../services/api";
import toast from "react-hot-toast";

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

  // Helper function to extract and display proper error messages
  const handleApiError = (error, defaultMessage = "An error occurred") => {
    console.error("API Error:", error);

    if (error?.message) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.data?.message) {
      return error.data.message;
    }

    return defaultMessage;
  };

  // Auto refresh button visibility
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastRefresh;
      if (timeSinceLastRefresh > 10000) {
        setShowRefreshButton(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastRefresh]);

  // Fetch collection status from API
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
      const errorMessage = handleApiError(
        error,
        "Failed to fetch collection status"
      );
      console.error("Error fetching collection status:", error);
      toast.error(errorMessage);
      setCollectionStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Call APIs directly
      const promises = [
        fetchCollectionStatus(),
        patsansthaAPI.viewData()
      ];

      const [, freshDataResponse] = await Promise.all(promises);

      // Notify parent with fresh data
      if (onRefreshData && typeof onRefreshData === "function") {
        onRefreshData(freshDataResponse?.data || freshDataResponse);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to refresh data");
      toast.error(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle file upload for agent
  const handleFileUpload = async (agentno) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".txt")) {
        toast.error("Please select a .txt file");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size too large. Maximum size allowed is 5MB");
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

        const response = await patsansthaAPI.uploadAgentFile(agentno, formData);

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [agentno]: 100 }));

        const successMessage =
          response?.message ||
          `File uploaded successfully for Agent ${agentno}`;
        toast.success(successMessage);

        // Refresh data after upload
        const refreshPromises = [
          fetchCollectionStatus(),
          patsansthaAPI.viewData()
        ];

        const [, freshDataResponse] = await Promise.all(refreshPromises);

        // Notify parent with fresh data
        if (onRefreshData && typeof onRefreshData === "function") {
          onRefreshData(freshDataResponse?.data || freshDataResponse);
        }

      } catch (error) {
        const errorMessage = handleApiError(error, "Failed to upload file");
        console.error("Upload error:", error);
        toast.error(errorMessage);
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

  // Handle download collection file
  const handleDownloadCollection = async (agentno) => {
    setDownloadingAgent(agentno);
    try {
      const today = new Date().toISOString().split("T")[0];
      const fileContent = await patsansthaAPI.downloadAgentCollection(
        agentno,
        today
      );

      if (!fileContent) {
        throw new Error("No file content received from server");
      }

      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${
        patsansthaData?.patname || "collection"
      }_${agentno}_${today}.txt`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Collection file downloaded successfully");
      
      // Refresh collection status after download
      await fetchCollectionStatus();
      
    } catch (error) {
      const errorMessage = handleApiError(
        error,
        "Failed to download collection file"
      );
      console.error("Download error:", error);
      toast.error(errorMessage);
    } finally {
      setDownloadingAgent(null);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchCollectionStatus();
  }, []);

  // Get collection info for specific agent
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
      {/* Header Section */}
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          {/* Page Title */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">Agent Management</h1>
            <p className="text-gray-600 mt-1">View and manage agent collection data</p>
          </div>
          
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Manual Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || loadingStatus}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  showRefreshButton 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>
                  {refreshing ? "Updating..." : showRefreshButton ? "Refresh" : "Refresh"}
                </span>
              </button>
            </div>
          </div>
          
          {/* Status indicator */}
          {loadingStatus && (
            <div className="flex items-center space-x-2 text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span>Loading collection status...</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Agent Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Agent ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mobile Number
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Collection Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredAgents.map((agent, index) => {
              const collectionInfo = getAgentCollectionInfo(agent.agentno);

              return (
                <tr
                  key={agent.agentno}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-base">
                            {agent.agentname?.charAt(0)?.toUpperCase() || "A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-base font-semibold text-gray-900">
                          {agent.agentname || "Unknown Agent"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Agent #{String(index + 1).padStart(3, "0")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="inline-flex items-center">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 font-medium text-sm rounded-full">
                        {agent.agentno || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {agent.mobileNumber
                          ? `+91 ${agent.mobileNumber.slice(
                              0,
                              5
                            )} ${agent.mobileNumber.slice(5)}`
                          : "Not provided"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    {collectionInfo ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          {collectionInfo.submitted ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-700 text-sm font-medium">
                                Submitted
                              </span>
                            </>
                          ) : collectionInfo.hasData ? (
                            <>
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span className="text-yellow-700 text-sm font-medium">
                                Data Uploaded
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-700 text-sm font-medium">
                                No Data
                              </span>
                            </>
                          )}
                        </div>
                        {collectionInfo.hasData && (
                          <div className="text-xs text-gray-500">
                            {collectionInfo.totalTransactions || 0}{" "}
                            transactions
                            <br />
                            {formatCurrency(collectionInfo.totalAmount || 0)}
                          </div>
                        )}
                        {collectionInfo.submittedAt && (
                          <div className="text-xs text-green-600">
                            {new Date(
                              collectionInfo.submittedAt
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
                        <span className="text-gray-400 text-sm">
                          Loading...
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {/* File Upload Button */}
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
                            <Upload className="h-4 w-4 animate-spin" />
                            {uploadProgress[agent.agentno] && (
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
                                {uploadProgress[agent.agentno]}%
                              </div>
                            )}
                          </div>
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </button>
                      
                      {/* Download Collection Button */}
                      {collectionInfo?.submitted && collectionInfo?.hasData ? (
                        <button
                          onClick={() =>
                            handleDownloadCollection(agent.agentno)
                          }
                          disabled={downloadingAgent === agent.agentno}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-105 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            collectionInfo.downloaded
                              ? "Re-download Collection File"
                              : "Download Collection File"
                          }
                        >
                          {downloadingAgent === agent.agentno ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-2 text-gray-400 rounded-lg border border-gray-200 opacity-50 cursor-not-allowed"
                          title="Collection not available for download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-16 bg-white">
          <div className="mx-auto mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No agents found
          </h3>
          <p className="text-gray-500 mb-8 text-base">
            {searchTerm
              ? "Try adjusting your search criteria to find agents."
              : "No agents are currently available in the system."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentsTable;