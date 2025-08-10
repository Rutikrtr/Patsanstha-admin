import React, { useState } from 'react';
import { 
  User, 
  Database, 
  ChevronRight,
  LogOut,
  Check,
  X
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { authAPI } from '../api/../../../../services/api'; // Import the API file
import AgentManagement from './components/AgentManagement';

const SettingsPage = ({ loading }) => {
  const patsansthaData = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState(null);

  // Toast component
  const Toast = ({ message, type, onClose }) => (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <Check className="h-5 w-5 mr-2" />
        ) : (
          <X className="h-5 w-5 mr-2" />
        )}
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-white/80 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Call the logout API with Redux dispatch
      await authAPI.logoutPatsanstha(dispatch);
      
      showToast('Logged out successfully!', 'success');
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/login';
        // or if using React Router:
        // navigate('/login');
      }, 1000);
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Show success message anyway since logout always clears data
      showToast('Logged out successfully!', 'success');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'data', label: 'Agent Management', icon: Database }
  ];

  const Profile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">Organization Information</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Organization Name</span>
          <span className="text-gray-900">{patsansthaData?.patname || '-'}</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Full Name</span>
          <span className="text-gray-900">{patsansthaData?.fullname || '-'}</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Contact Number</span>
          <span className="text-gray-900">{patsansthaData?.mobilenumber || '-'}</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Address</span>
          <span className="text-gray-900">{patsansthaData?.address || '-'}</span>
        </div>
      </div>
    </div>
  );

  const AgentManagementSettings = () => (
    <AgentManagement patsansthaData={patsansthaData} />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'data':
        return <AgentManagementSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Logout Button - Bottom Right Corner */}
      <div className="fixed bottom-12 right-12 z-40">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center px-4 py-3 rounded-lg shadow-lg transition-all duration-200 ${
            isLoggingOut
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 hover:shadow-xl transform hover:scale-105'
          } text-white font-medium`}
        >
          {isLoggingOut ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;