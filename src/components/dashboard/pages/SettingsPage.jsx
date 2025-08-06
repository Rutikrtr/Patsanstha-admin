import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  HelpCircle,
  ChevronRight,
  Save,
  RefreshCw
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
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: Settings }
  ];

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={patsansthaData?.patname || ''}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={patsansthaData?.fullname || ''}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={patsansthaData?.contactno || ''}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={patsansthaData?.address || ''}
            disabled
          />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">Profile settings are read-only</p>
        <button className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          { title: 'Agent Registration', description: 'Get notified when new agents register' },
          { title: 'System Updates', description: 'Receive notifications about system updates' },
          { title: 'Security Alerts', description: 'Important security notifications' },
          { title: 'Reports Ready', description: 'Get notified when reports are generated' }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked={index < 2}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </button>
      </div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Security Status</h4>
          <p className="text-sm text-yellow-700">Your account security settings are managed by the system administrator.</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Session Timeout</h4>
              <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              30 minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">This settings section is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and system preferences</p>
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