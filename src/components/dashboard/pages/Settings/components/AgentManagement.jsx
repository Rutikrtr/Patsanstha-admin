import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Pencil } from "lucide-react";
import { patsansthaAPI } from "../../../../../services/api";
import { updateAgentCount } from "../../../../../store/authSlice";

const AgentManagement = ({ patsansthaData }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({
    agentname: "",
    mobileNumber: "",
    password: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const firstInputRef = useRef(null);
  const dispatch = useDispatch();

  const patsansthaFromRedux = useSelector((state) => state.auth?.user);
  const currentPatsanstha = patsansthaFromRedux || patsansthaData;

  const isAgentLimitReached =
    currentPatsanstha &&
    currentPatsanstha.currentAgentCount >= currentPatsanstha.noOfAgent;

  // 🔹 Helper to extract backend error messages
  const extractErrorMessage = (res, fallback = "Something went wrong") => {
    if (!res) return fallback;
    return (
      res.message ||
      res.error ||
      res.errors?.[0]?.msg ||
      res.errors?.[0] ||
      fallback
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await patsansthaAPI.viewData();
      if (res?.success) {
        setAgents(res.data.agents || []);
      } else {
        setErrorMessage(extractErrorMessage(res, "Failed to load agents"));
      }
    } catch (err) {
      setErrorMessage("Something went wrong while loading data");
      console.error("loadData error", err);
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
    setErrorMessage("");
  };

  const openAdd = () => {
    if (isAgentLimitReached) {
      setErrorMessage(
        `Agent limit reached (${currentPatsanstha.noOfAgent}/${currentPatsanstha.noOfAgent})`
      );
      return;
    }
    resetForm();
    setShowAddModal(true);
  };

  const openEdit = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      agentname: agent.agentname || "",
      mobileNumber: agent.mobileNumber || "",
      password: "",
    });
    setErrorMessage("");
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
    setErrorMessage("");

    try {
      if (selectedAgent) {
        // Edit flow
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        const response = await patsansthaAPI.editAgent(
          selectedAgent.agentno,
          payload
        );

        if (response?.success) {
          setShowEditModal(false);
          resetForm();
          await loadData();
        } else {
          setErrorMessage(extractErrorMessage(response, "Update failed"));
        }
      } else {
        // Add flow
        if (
          !formData.agentname.trim() ||
          !formData.mobileNumber.trim() ||
          !formData.password
        ) {
          setErrorMessage("Please fill all required fields");
          return;
        }
        const response = await patsansthaAPI.addAgent(formData);
        if (response?.success) {
          setShowAddModal(false);
          resetForm();
          await loadData();

          if (currentPatsanstha && dispatch) {
            dispatch(
              updateAgentCount({
                currentAgentCount:
                  (currentPatsanstha.currentAgentCount || 0) + 1,
              })
            );
          }
        } else {
          setErrorMessage(extractErrorMessage(response, "Add failed"));
        }
      }
    } catch (err) {
      console.error("submit error", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setFormLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Agent Management
          </h2>
          <p className="text-sm text-gray-600">
            Manage agents (Add / Edit)
            {currentPatsanstha && (
              <span className="ml-2 text-xs text-gray-500">
                ({currentPatsanstha.currentAgentCount || 0}/
                {currentPatsanstha.noOfAgent || 0} agents)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={isAgentLimitReached}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
            isAgentLimitReached
              ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
              : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          }`}
          title={isAgentLimitReached ? "Agent limit reached" : "Add new agent"}
        >
          <Plus
            className={`w-4 h-4 ${isAgentLimitReached ? "opacity-50" : ""}`}
          />
          Add Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No agents yet — add one using the button above.
        </div>
      ) : (
        <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
          {agents.map((agent) => (
            <div
              key={agent.agentno || agent._id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-gray-900">
                  {agent.agentname}
                </div>
                <div className="text-xs text-gray-500">
                  {agent.agentno} • {agent.mobileNumber}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(agent)}
                  title="Edit"
                  className="p-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Agent Modal */}
      <Modal
        show={showAddModal}
        title="Add Agent"
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name *
              </label>
              <input
                ref={firstInputRef}
                value={formData.agentname}
                onChange={(e) =>
                  setFormData({ ...formData, agentname: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                value={formData.mobileNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobileNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full px-3 py-2 border rounded"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
                type="password"
                required
              />
            </div>
          </div>

          {/* 🔹 Error Message */}
          {errorMessage && (
            <div className="mt-4 text-sm text-red-600 bg-red-100 px-3 py-2 rounded">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {formLoading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Agent Modal */}
      <Modal
        show={showEditModal}
        title="Edit Agent"
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <input
                ref={firstInputRef}
                value={formData.agentname}
                onChange={(e) =>
                  setFormData({ ...formData, agentname: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                value={formData.mobileNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobileNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full px-3 py-2 border rounded"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (leave blank to keep current)
              </label>
              <input
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
                type="password"
              />
            </div>
          </div>

          {/* 🔹 Error Message */}
          {errorMessage && (
            <div className="mt-4 text-sm text-red-600 bg-red-100 px-3 py-2 rounded">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
            >
              {formLoading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Reusable modal
const Modal = ({ show, title, onClose, children }) => {
  if (!show) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default AgentManagement;
