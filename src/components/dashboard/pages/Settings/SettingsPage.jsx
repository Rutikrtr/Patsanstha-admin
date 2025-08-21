import React, { useState } from "react";
import {
  User,
  Database,
  ChevronRight,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { authAPI } from "../api/../../../../services/api";
import AgentManagement from "./components/AgentManagement";

const SettingsPage = () => {
  const patsansthaData = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      setShowLogoutConfirm(false);
      await authAPI.logoutPatsanstha(dispatch);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "data", label: "Agent Management", icon: Database },
  ];

  const Profile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Organization Information
      </h2>
      <div className="space-y-6">
        <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Organization Name</span>
          <span className="text-gray-900">{patsansthaData?.patname || "-"}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Full Name</span>
          <span className="text-gray-900">{patsansthaData?.fullname || "-"}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Contact Number</span>
          <span className="text-gray-900">{patsansthaData?.mobilenumber || "-"}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-4 mb-4">
          <span className="text-gray-600 font-medium">Address</span>
          <span className="text-gray-900">{patsansthaData?.address || "-"}</span>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "data":
        return <AgentManagement patsansthaData={patsansthaData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* ✅ Fullscreen Logout Confirmation Modal (Always on Top) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="bg-white w-full max-w-md mx-auto rounded-2xl shadow-2xl p-8 relative">
            {/* Icon */}
            <AlertTriangle className="mx-auto text-yellow-500 h-12 w-12 mb-4" />

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Confirm Logout
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to log out of your account?
            </p>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
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
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
      <div className="fixed bottom-12 right-10 mr-3 z-40">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          disabled={isLoggingOut}
          className={`flex items-center px-3 py-2 rounded-lg shadow-lg transition-all duration-200 ${
            isLoggingOut
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 hover:shadow-xl transform hover:scale-105"
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
