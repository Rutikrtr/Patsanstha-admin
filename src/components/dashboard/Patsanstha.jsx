import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

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

  const hideSidebar = location.pathname === "/login";

  const [initialLoading, setInitialLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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

  if (initialLoading) {
    return <LoadingScreen />;
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
      </div>
    </div>
  );
};

export default Patsanstha;
