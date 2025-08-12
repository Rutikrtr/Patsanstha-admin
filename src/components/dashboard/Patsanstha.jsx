import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
// Components
import Sidebar from "./components/Sidebar.jsx";
import MobileHeader from "./components/MobileHeader.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

// Pages
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import AgentsPage from "./pages/Agents/AgentsPage.jsx";
import CustomerReport from "./pages/customerReport/index.jsx";
import SettingsPage from "./pages/Settings/SettingsPage.jsx";

// Load DM Sans font
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Apply DM Sans to body
document.body.style.fontFamily = '"DM Sans", sans-serif';

const Patsanstha = () => {
  const { user } = useSelector((state) => state.auth);

  // Enhanced loading states
  const [loadingStates, setLoadingStates] = useState({
    initial: true,
    data: false,
    agentAction: false, // For add/edit/delete operations
    logout: false,
  });

  const [showLoading, setShowLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  // Helper function to update specific loading state
  const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  // Check if any loading is active
  const isAnyLoading = Object.values(loadingStates).some((loading) => loading);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    updateLoadingState("initial", true);
    updateLoadingState("initial", false);
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardPage />;
      case "agents":
        return <AgentsPage />;
      case "reports":
        return <CustomerReport />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  // Show loading screen during initial load or when showLoading is true
  if (loadingStates.initial || showLoading) {
    return <LoadingScreen onAnimationComplete={handleLoadingComplete} />;
  }

  return (
    <div
      className="h-screen p-4 lg:p-6"
      style={{
        fontFamily: '"DM Sans", sans-serif',
        background: "#6739B7",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="flex h-full rounded-3xl overflow-hidden shadow-2xl">
        <Sidebar
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          loading={loadingStates.logout}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 bg-white">
          <MobileHeader
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            loading={isAnyLoading}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6 lg:p-8">
              {/* Loading indicator for data operations */}
              {loadingStates.data && (
                <div className="mb-4 flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm">Loading data...</span>
                  </div>
                </div>
              )}

              {/* Dynamic Content */}
              {renderContent()}
            </div>
          </main>
        </div>

        {/* Global loading overlay for critical operations */}
        {loadingStates.agentAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patsanstha;
