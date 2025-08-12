import React, { useState } from 'react';
import { User, Database, ChevronRight, LogOut, Check, AlertTriangle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from '../api/../../../../services/api';
import AgentManagement from './components/AgentManagement';

const SettingsPage = ({ loading }) => {
  const patsansthaData = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // NEW

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      setShowLogoutConfirm(false); // Hide confirmation popup

      await authAPI.logoutPatsanstha(dispatch);

      setShowLogoutToast(true);

      setTimeout(() => {
        setFadeOut(true);
      }, 1000);

      setTimeout(() => {
        window.location.href = '/login';
      }, 1800);
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutToast(true);
      setTimeout(() => {
        setFadeOut(true);
      }, 1000);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1800);
    }
  };

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'data', label: 'Agent Management', icon: Database }
  ];

  const Profile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Organization Information</h2>
      <div className="space-y-6">
        <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Organization Name</span>
          <span className="text-gray-900">{patsansthaData?.patname || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Full Name</span>
          <span className="text-gray-900">{patsansthaData?.fullname || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Contact Number</span>
          <span className="text-gray-900">{patsansthaData?.mobilenumber || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Address</span>
          <span className="text-gray-900">{patsansthaData?.address || '-'}</span>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'data':
        return <AgentManagement patsansthaData={patsansthaData} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`space-y-8 relative transition-opacity duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logout Success Toast */}
      {showLogoutToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg bg-green-500 text-white animate-fadeIn">
          <Check className="h-5 w-5 mr-2" />
          <span className="font-medium">Logged out successfully!</span>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
            <AlertTriangle className="mx-auto text-yellow-500 h-10 w-10 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
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

      {/* Logout Button */}
      <div className="fixed bottom-12 right-12 z-40">
        <button
          onClick={() => setShowLogoutConfirm(true)} // Show confirmation modal
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

      {/* Animation CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
