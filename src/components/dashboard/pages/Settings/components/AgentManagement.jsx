// AgentManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { patsansthaAPI } from "../../../../../services/api";
import { updateAgentCount } from "../../../../../store/authSlice";

const AgentManagement = ({ patsansthaData }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({ agentname: "", mobileNumber: "", password: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const firstInputRef = useRef(null);
  const dispatch = useDispatch();

  // Get patsanstha data from Redux store
  const patsansthaFromRedux = useSelector((state) => state.auth?.user);
  
  // Use Redux data or fallback to props
  const currentPatsanstha = patsansthaFromRedux || patsansthaData;
  
  // Check if agent limit is reached
  const isAgentLimitReached = currentPatsanstha && 
    currentPatsanstha.currentAgentCount >= currentPatsanstha.noOfAgent;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await patsansthaAPI.viewData();
      if (res?.success) {
        setAgents(res.data.agents || []);
      } else {
        showToast(res?.message || "Failed to load agents", "error");
      }
    } catch (err) {
      console.error("loadData error", err);
      showToast(err?.message || "Failed to load agents", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({ agentname: "", mobileNumber: "", password: "" });
    setSelectedAgent(null);
  };

  const openAdd = () => {
    if (isAgentLimitReached) {
      showToast(`Agent limit reached (${currentPatsanstha.noOfAgent}/${currentPatsanstha.noOfAgent})`, "error");
      return;
    }
    resetForm();
    setShowAddModal(true);
  };

  const openEdit = (agent) => {
    setSelectedAgent(agent);
    setFormData({ agentname: agent.agentname || "", mobileNumber: agent.mobileNumber || "", password: "" });
    setShowEditModal(true);
  };

  useEffect(() => {
    if ((showAddModal || showEditModal) && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showAddModal, showEditModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (selectedAgent) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const response = await patsansthaAPI.editAgent(selectedAgent.agentno, payload);
        if (response?.success) {
          showToast("Agent updated successfully", "success");
          setShowEditModal(false);
          resetForm();
          await loadData();
        } else {
          showToast(response?.message || "Update failed", "error");
        }
      } else {
        // Add agent
        if (!formData.agentname.trim() || !formData.mobileNumber.trim() || !formData.password) {
          showToast("Please fill all required fields", "error");
          return;
        }
        const response = await patsansthaAPI.addAgent(formData);
        if (response?.success) {
          showToast("Agent added successfully", "success");
          setShowAddModal(false);
          resetForm();
          await loadData();
          
          // Update Redux store - increment currentAgentCount
          if (currentPatsanstha && dispatch) {
            dispatch(updateAgentCount({ 
              currentAgentCount: (currentPatsanstha.currentAgentCount || 0) + 1 
            }));
          }
        } else {
          showToast(response?.message || "Add failed", "error");
        }
      }
    } catch (err) {
      console.error("submit error", err);
      showToast(err?.message || "Operation failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const checkAgentDownloaded = async (agentno) => {
    try {
      // Preferred API (single-agent check)
      if (typeof patsansthaAPI.isAgentDataDownloaded === "function") {
        const res = await patsansthaAPI.isAgentDataDownloaded(agentno);
        if (res?.success) {
          const downloaded = !!res.data?.downloaded;
          return {
            allowed: downloaded,
            message: downloaded ? null : "Agent data not downloaded yet.",
          };
        }
        // if API responded but not success, treat as unknown
        return { allowed: null };
      }

      // Fallback: getAgentCollectionStatus which returns a list
      if (typeof patsansthaAPI.getAgentCollectionStatus === "function") {
        const res = await patsansthaAPI.getAgentCollectionStatus();
        if (res?.success) {
          const list = res.data?.agents || [];
          const found = list.find((a) => String(a.agentno) === String(agentno));
          // assume field is downloaded or has collectionComplete/hasData flags
          const downloaded = !!(found?.downloaded || found?.collectionComplete || found?.hasData);
          return {
            allowed: downloaded,
            message: downloaded ? null : "Agent data not downloaded yet.",
          };
        }
        return { allowed: null };
      }

      // No suitable API available => unknown
      return { allowed: null };
    } catch (err) {
      console.error("checkAgentDownloaded error", err);
      return { allowed: null };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-60 px-4 py-2 rounded shadow ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Agent Management</h2>
          <p className="text-sm text-gray-600">
            Manage agents (Add / Edit)
            {currentPatsanstha && (
              <span className="ml-2 text-xs text-gray-500">
                ({currentPatsanstha.currentAgentCount || 0}/{currentPatsanstha.noOfAgent || 0} agents)
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={openAdd} 
          disabled={isAgentLimitReached}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
            isAgentLimitReached 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
          }`}
          title={isAgentLimitReached ? 'Agent limit reached' : 'Add new agent'}
        >
          <Plus className={`w-4 h-4 ${isAgentLimitReached ? 'opacity-50' : ''}`} /> 
          Add Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No agents yet — add one using the button above.</div>
      ) : (
        <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
          {agents.map((agent) => (
            <div key={agent.agentno || agent._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">{agent.agentname}</div>
                <div className="text-xs text-gray-500">{agent.agentno} • {agent.mobileNumber}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(agent)} title="Edit" className="p-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal show={showAddModal} title="Add Agent" onClose={() => setShowAddModal(false)}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
              <input
                ref={firstInputRef}
                value={formData.agentname}
                onChange={(e) => setFormData({ ...formData, agentname: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
              <input
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, "") })}
                className="w-full px-3 py-2 border rounded"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                type="password"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="px-4 py-2">Cancel</button>
            <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">{formLoading ? "Adding..." : "Add"}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} title="Edit Agent" onClose={() => { setShowEditModal(false); resetForm(); }}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input
                ref={firstInputRef}
                value={formData.agentname}
                onChange={(e) => setFormData({ ...formData, agentname: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, "") })}
                className="w-full px-3 py-2 border rounded"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
              <input
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                type="password"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="px-4 py-2">Cancel</button>
            <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">{formLoading ? "Updating..." : "Update"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Minimal Modal component used in the JSX above
const Modal = ({ show, title, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AgentManagement;