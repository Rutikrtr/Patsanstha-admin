import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

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

document.body.style.fontFamily = '"DM Sans", sans-serif';

const Patsanstha = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const hideSidebar = location.pathname === "/login";

  const [initialLoading, setInitialLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showOverlay, setShowOverlay] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Function to trigger logout fade and redirect
  const triggerLogout = () => {
    setShowOverlay(false); // Close any loaders
    setFadeOut(true);
    setTimeout(() => {
      navigate("/login");
    }, 800); // matches fade duration
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardPage />;
      case "agents":
        return <AgentsPage />;
      case "reports":
        return <CustomerReport />;
      case "settings":
        return <SettingsPage triggerLogout={triggerLogout} />;
      default:
        return <DashboardPage />;
    }
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className={`h-screen p-4 lg:p-6 transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
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
        {!hideSidebar && user && (
          <Sidebar
            user={user}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 bg-white">
          {!hideSidebar && (
            <MobileHeader
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          )}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6 lg:p-8">{renderContent()}</div>
          </main>
        </div>

        {showOverlay && (
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
