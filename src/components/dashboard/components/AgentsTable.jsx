import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Users,
  Upload,
  FileText,
  Phone,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { patsansthaAPI } from "../../../services/api";
import toast from "react-hot-toast";

const AgentsTable = ({
  filteredAgents,
  patsansthaData,
  searchTerm,
  setSearchTerm,
  setShowAddForm,
  setEditingAgent,
  handleDeleteAgent,
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

    // If error has a message property, use it
    if (error?.message) {
      return error.message;
    }

    // If error is a string, use it directly
    if (typeof error === "string") {
      return error;
    }

    // If error has response data with message
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    // If error has data with message
    if (error?.data?.message) {
      return error.data.message;
    }

    // Fallback to default message
    return defaultMessage;
  };

  // Auto refresh button visibility
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastRefresh;
      // Show refresh button after 10 seconds
      if (timeSinceLastRefresh > 10000) {
        setShowRefreshButton(true);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [lastRefresh]);

  // Fetch collection status from API with proper error handling
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

  // Handle refresh button click with proper error handling
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const promises = [fetchCollectionStatus()];

      if (onRefreshData && typeof onRefreshData === "function") {
        promises.push(onRefreshData());
      }

      await Promise.all(promises);
      toast.success("Data refreshed successfully");
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to refresh data");
      toast.error(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle file upload for agent with enhanced error handling
  const handleFileUpload = async (agentno) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.name.toLowerCase().endsWith(".txt")) {
        toast.error("Please select a .txt file");
        return;
      }

      // Validate file size (e.g., max 5MB)
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

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [agentno]: Math.min((prev[agentno] || 0) + 10, 90),
          }));
        }, 100);

        const response = await patsansthaAPI.uploadAgentFile(agentno, formData);

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [agentno]: 100 }));

        // Show success message from backend if available
        const successMessage =
          response?.message ||
          `File uploaded successfully for Agent ${agentno}`;
        toast.success(successMessage);

        // Refresh both parent data and collection status
        const refreshPromises = [];
        if (onRefreshData && typeof onRefreshData === "function") {
          refreshPromises.push(onRefreshData());
        }
        refreshPromises.push(fetchCollectionStatus());

        await Promise.all(refreshPromises);
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

  // Handle download collection file with enhanced error handling
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

      // Create blob from response
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${
        patsansthaData?.patname || "collection"
      }_${agentno}_${today}.txt`;

      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Collection file downloaded successfully");

      // Refresh collection status after successful download
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

  // Handle delete agent with enhanced error handling
  const handleDeleteAgentWithToast = async (agentno) => {
    try {
      await handleDeleteAgent(agentno);
      toast.success(`Agent ${agentno} deleted successfully`);

      // Refresh collection status after successful deletion
      await fetchCollectionStatus();
    } catch (error) {
      const errorMessage = handleApiError(
        error,
        `Failed to delete agent ${agentno}`
      );
      console.error("Delete error:", error);
      toast.error(errorMessage);
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

  const getTotalCollectionAmount = () => {
    if (!collectionStatus?.agents) return 0;
    return collectionStatus.agents.reduce(
      (sum, agent) => sum + (agent.totalAmount || 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Collection Overview Card */}
      {collectionStatus && (
        <div className="bg-[#1E1A2E] rounded-xl shadow-2xl border border-[#5C4F6E] overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#1E1A2E] to-[#5C4F6E] border-b border-[#B3A8C9]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white">
                Collection Overview
              </h3>
              <div className="flex items-center space-x-3">
                {/* Refresh Button */}
                {showRefreshButton && (
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing || loadingStatus}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    <span>
                      {refreshing ? "Updating..." : "Click to Update"}
                    </span>
                  </button>
                )}

                {loadingStatus && !refreshing && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#B3A8C9]"></div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[#5C4F6E]/20 to-[#B3A8C9]/20 rounded-lg p-4 border border-[#B3A8C9]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#B3A8C9] text-sm font-medium">
                      Total Agents
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {collectionStatus.totalAgents || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-[#B3A8C9]" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">
                      Submitted
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {collectionStatus.submittedAgents || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">
                      Downloadable
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {collectionStatus.downloadableAgents || 0}
                    </p>
                  </div>
                  <Download className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(getTotalCollectionAmount())}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Agents Table */}
      <div className="bg-[#1E1A2E] rounded-xl shadow-2xl border border-[#5C4F6E] overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1E1A2E] to-[#5C4F6E] border-b border-[#B3A8C9]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Agents Management</h2>
            <div className="flex items-center space-x-3">
              {/* Manual Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || loadingStatus}
                className="bg-gradient-to-r from-[#5C4F6E]/60 to-[#B3A8C9]/60 text-white px-4 py-2.5 rounded-lg hover:from-[#5C4F6E] hover:to-[#B3A8C9] flex items-center space-x-2 transition-all duration-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B3A8C9] h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-[#5C4F6E]/20 border border-[#B3A8C9]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B3A8C9] focus:border-[#B3A8C9] text-sm text-white placeholder-[#B3A8C9] backdrop-blur-sm"
                />
              </div>
              {/* Add Agent Button */}
              <button
                onClick={() => setShowAddForm(true)}
                disabled={
                  patsansthaData?.agents?.length >= patsansthaData?.noOfAgent
                }
                className="bg-gradient-to-r from-[#5C4F6E] to-[#B3A8C9] text-white px-5 py-2.5 rounded-lg hover:from-[#B3A8C9] hover:to-[#5C4F6E] flex items-center space-x-2 transition-all duration-300 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#5C4F6E] to-[#B3A8C9]/80 border-b border-[#B3A8C9]/30">
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Agent Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Agent Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Mobile Number
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  Collection Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5C4F6E]/30">
              {filteredAgents.map((agent, index) => {
                const collectionInfo = getAgentCollectionInfo(agent.agentno);

                return (
                  <tr
                    key={agent.agentno}
                    className="bg-[#1E1A2E] hover:bg-gradient-to-r hover:from-[#5C4F6E]/20 hover:to-[#B3A8C9]/10 transition-all duration-300 group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#5C4F6E] to-[#B3A8C9] rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#B3A8C9]/30 group-hover:ring-[#B3A8C9]/60 transition-all duration-300">
                            <span className="text-white font-bold text-base">
                              {agent.agentname?.charAt(0)?.toUpperCase() || "A"}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#B3A8C9] rounded-full border-2 border-[#1E1A2E]"></div>
                        </div>
                        <div>
                          <div className="text-base font-semibold text-white group-hover:text-[#B3A8C9] transition-colors duration-300">
                            {agent.agentname || "Unknown Agent"}
                          </div>
                          <div className="text-sm text-[#B3A8C9] font-medium">
                            Agent #{String(index + 1).padStart(3, "0")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="inline-flex items-center">
                        <span className="px-4 py-2 bg-gradient-to-r from-[#5C4F6E]/40 to-[#B3A8C9]/40 text-white font-semibold text-sm rounded-full border border-[#B3A8C9]/30 backdrop-blur-sm">
                          {agent.agentno || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-[#B3A8C9]" />
                        <span className="text-white font-medium">
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
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span className="text-green-400 text-sm font-medium">
                                  Submitted
                                </span>
                              </>
                            ) : collectionInfo.hasData ? (
                              <>
                                <Clock className="h-4 w-4 text-yellow-400" />
                                <span className="text-yellow-400 text-sm font-medium">
                                  Data Uploaded
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">
                                  No Data
                                </span>
                              </>
                            )}
                          </div>
                          {collectionInfo.hasData && (
                            <div className="text-xs text-[#B3A8C9]">
                              {collectionInfo.totalTransactions || 0}{" "}
                              transactions
                              <br />
                              {formatCurrency(collectionInfo.totalAmount || 0)}
                            </div>
                          )}
                          {collectionInfo.submittedAt && (
                            <div className="text-xs text-green-400">
                              {new Date(
                                collectionInfo.submittedAt
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
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
                          className={`p-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border disabled:opacity-50 disabled:cursor-not-allowed relative ${
                            collectionInfo?.hasData
                              ? "text-green-400 hover:text-white hover:bg-green-600 border-green-400/30 hover:border-green-600"
                              : "text-[#B3A8C9] hover:text-white hover:bg-blue-600 border-blue-400/30 hover:border-blue-600"
                          }`}
                          title="Upload Data File"
                        >
                          {uploadingAgent === agent.agentno ? (
                            <div className="relative">
                              <Upload className="h-4 w-4 animate-spin" />
                              {uploadProgress[agent.agentno] && (
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 font-medium whitespace-nowrap">
                                  {uploadProgress[agent.agentno]}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </button>
                        {/* Download Collection Button - Only show if agent has submitted data */}
                        {collectionInfo?.submitted &&
                        collectionInfo?.hasData ? (
                          <button
                            onClick={() =>
                              handleDownloadCollection(agent.agentno)
                            }
                            disabled={downloadingAgent === agent.agentno}
                            className="p-3 text-green-400 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border border-green-400/30 hover:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              collectionInfo.downloaded
                                ? "Re-download Collection File"
                                : "Download Collection File"
                            }
                          >
                            {downloadingAgent === agent.agentno ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-3 text-gray-500 rounded-lg border border-gray-500/30 opacity-50 cursor-not-allowed"
                            title="Collection not available for download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                       
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingAgent(agent)}
                          className="p-3 text-[#B3A8C9] hover:text-white hover:bg-[#5C4F6E] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border border-[#5C4F6E]/30 hover:border-[#B3A8C9]"
                          title="Edit Agent"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDeleteAgentWithToast(agent.agentno)
                          }
                          className="p-3 text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 border border-red-400/30 hover:border-red-600"
                          title="Delete Agent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
          <div className="text-center py-16 bg-gradient-to-br from-[#1E1A2E] to-[#5C4F6E]/50">
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#5C4F6E] to-[#B3A8C9] rounded-full flex items-center justify-center shadow-2xl ring-4 ring-[#B3A8C9]/20">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#B3A8C9] rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              No agents found
            </h3>
            <p className="text-[#B3A8C9] mb-8 text-base">
              {searchTerm
                ? "Try adjusting your search criteria to find agents."
                : "Get started by adding your first agent to the system."}
            </p>
            {!searchTerm &&
              patsansthaData?.agents?.length < patsansthaData?.noOfAgent && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-[#5C4F6E] to-[#B3A8C9] hover:from-[#B3A8C9] hover:to-[#5C4F6E] text-white px-8 py-4 rounded-lg transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 border border-[#B3A8C9]/30"
                >
                  <UserPlus className="h-5 w-5 inline mr-3" />
                  Add Your First Agent
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsTable;
