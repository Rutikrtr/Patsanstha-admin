import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { patsansthaAPI } from '../../../services/api';

const AddAgentForm = ({ onClose, editData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    agentname: editData?.agentname || '',
    agentno: editData?.agentno || '',
    mobileNumber: editData?.mobileNumber || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData) {
        const updateData = {
          agentname: formData.agentname,
          mobileNumber: formData.mobileNumber,
          ...(formData.password && { password: formData.password })
        };
        await patsansthaAPI.editAgent(editData.agentno, updateData);
        toast.success('Agent updated successfully');
      } else {
        await patsansthaAPI.addAgent(formData);
        toast.success('Agent added successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setFormData({ ...formData, mobileNumber: value });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {editData ? 'Edit Agent' : 'Add New Agent'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={formData.agentname}
              onChange={(e) => setFormData({ ...formData, agentname: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter agent name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Number *
            </label>
            <input
              type="text"
              value={formData.agentno}
              onChange={(e) => setFormData({ ...formData, agentno: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50"
              placeholder="Enter agent number"
              required
              disabled={editData || loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={handleMobileNumberChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter 10-digit mobile number"
              required
              disabled={loading}
              maxLength={10}
            />
            {formData.mobileNumber && formData.mobileNumber.length !== 10 && (
              <p className="text-red-500 text-xs mt-1">Mobile number must be 10 digits</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {editData ? '(Leave empty to keep current)' : '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter password"
                required={!editData}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              type="submit"
              disabled={loading || (formData.mobileNumber && formData.mobileNumber.length !== 10)}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                editData ? 'Update Agent' : 'Add Agent'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAgentForm;