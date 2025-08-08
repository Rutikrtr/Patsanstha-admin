import React from 'react';
import AgentsTable from './components/AgentsTable';

const AgentsPage = ({ 
  patsansthaData, 
  filteredAgents, 
  searchTerm, 
  setSearchTerm, 
  setShowAddForm, 
  setEditingAgent, 
  handleDeleteAgent,
  loading,
  onDataUpdate
}) => {



  return (
    <div>
      {/* Agents Table Card */}
      <AgentsTable
        filteredAgents={filteredAgents}
        patsansthaData={patsansthaData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setShowAddForm={setShowAddForm}
        setEditingAgent={setEditingAgent}
        handleDeleteAgent={handleDeleteAgent}
        onRefreshData={onDataUpdate}
      />
    </div>
  );
};

export default AgentsPage;