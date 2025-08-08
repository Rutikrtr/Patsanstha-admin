import React, { useState } from 'react';
import { 
  User, 
  Database, 
  ChevronRight 
} from 'lucide-react';

const SettingsPage = ({ patsansthaData, loading }) => {
  const [activeTab, setActiveTab] = useState('profile');

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
      <h2 className="text-xl font-semibold text-gray-800">Organization Information</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600 font-medium">Organization Name</span>
          <span className="text-gray-900">{patsansthaData?.patname || '-'}</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600 font-medium">Full Name</span>
          <span className="text-gray-900">{patsansthaData?.fullname || '-'}</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600 font-medium">Contact Number</span>
          <span className="text-gray-900">{patsansthaData?.mobilenumber || '-'}</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600 font-medium">Address</span>
          <span className="text-gray-900">{patsansthaData?.address || '-'}</span>
        </div>
      </div>
    </div>
  );


  const AgentManagementSettings = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Database className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Agent Management</h3>
      <p className="text-gray-600">This section is under development.</p>
    </div>
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
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
    </div>
  );
};

export default SettingsPage;
