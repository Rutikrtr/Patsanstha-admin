import React, { useState } from 'react';
import { patsansthaAPI } from '../../../services/api';
import AgentsTable from '../components/AgentsTable';

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
  const [uploadingAgent, setUploadingAgent] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileUpload = async (agentno, file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.txt')) {
      alert('Please select a .txt file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploadingAgent(agentno);
    setUploadProgress(prev => ({ ...prev, [agentno]: 0 }));

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [agentno]: Math.min((prev[agentno] || 0) + 10, 90)
        }));
      }, 100);

      const response = await patsansthaAPI.uploadAgentFile(agentno, file);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [agentno]: 100 }));

      // Show success message
      alert(`File uploaded successfully! Processed ${response.data.customersCount} customers for Agent ${response.data.agentNo}`);
      
      // Refresh data if callback provided
      if (onDataUpdate) {
        onDataUpdate();
      }

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[agentno];
          return newProgress;
        });
      }, 1000);

    } catch (error) {
      console.error('File upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[agentno];
        return newProgress;
      });
    } finally {
      setUploadingAgent(null);
    }
  };

  const triggerFileInput = (agentno) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(agentno, file);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#5C4F6E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-[#B3A8C9]">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Management</h1>
        <p className="text-gray-600">Manage your agents and their details efficiently</p>
      </div>

      {/* Agents Table */}
      <AgentsTable
        filteredAgents={filteredAgents}
        patsansthaData={patsansthaData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setShowAddForm={setShowAddForm}
        setEditingAgent={setEditingAgent}
        handleDeleteAgent={handleDeleteAgent}
        uploadingAgent={uploadingAgent}
        uploadProgress={uploadProgress}
        onFileUpload={triggerFileInput}
      />
    </div>
  );
};

export default AgentsPage;