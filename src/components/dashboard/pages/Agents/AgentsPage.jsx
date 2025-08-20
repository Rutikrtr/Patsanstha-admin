import React, { useState, useEffect } from "react";
import { patsansthaAPI } from "../../../../services/api";
import AgentsTable from "./components/AgentsTable";

const AgentsPage = () => {
  const [patsansthaData, setPatsansthaData] = useState(null);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await patsansthaAPI.viewData();

      if (response.success && response.data) {
        setPatsansthaData(response.data);
        setFilteredAgents(response.data.agents || []);
      } else {
        throw new Error(response.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching patsanstha data:", error);
      setError(error.message || "Failed to fetch agent data");
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    if (!patsansthaData?.agents) return;

    let filtered = patsansthaData.agents;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.agentname.toLowerCase().includes(searchLower) ||
          agent.agentno.toLowerCase().includes(searchLower) ||
          agent.mobileNumber.includes(searchTerm.trim())
      );
    }

    setFilteredAgents(filtered);
  };

  const handleRefreshData = async (updatedData = null) => {
    if (updatedData) {
      setPatsansthaData(updatedData);
      setFilteredAgents(updatedData.agents || []);
    } else {
      await fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [patsansthaData, searchTerm]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            Agents
          </h1>
          <p className="text-gray-600">Manage your field agents here</p>
        </div>

        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading agents...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            Agents
          </h1>
          <p className="text-gray-600">Manage your field agents here</p>
        </div>

        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">
          Agents
        </h1>
        <p className="text-gray-600">Manage your field agents here</p>
      </div>

      <AgentsTable
        filteredAgents={filteredAgents}
        patsansthaData={patsansthaData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
};

export default AgentsPage;
