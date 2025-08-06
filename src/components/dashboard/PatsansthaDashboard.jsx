import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout } from '../../store/authSlice';
import { patsansthaAPI, authAPI } from '../../services/api';

// Components
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import AdminMessage from './components/AdminMessage';
import AddAgentForm from './components/AddAgentForm';

// Pages
import DashboardPage from './pages/DashboardPage';
import AgentsPage from './pages/AgentsPage';
import CustomerReport from './pages/customerReport/index.js'
import SettingsPage from './pages/SettingsPage';

// Load DM Sans font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Apply DM Sans to body
document.body.style.fontFamily = '"DM Sans", sans-serif';

const PatsansthaDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [patsansthaData, setPatsansthaData] = useState(null);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [adminMessage, setAdminMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    fetchData();
    fetchAdminMessage();
  }, []);

  useEffect(() => {
    if (patsansthaData?.agents) {
      filterAgents();
    }
  }, [patsansthaData, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await patsansthaAPI.viewData();
      if (response.success) {
        setPatsansthaData(response.data);
      } else {
        toast.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error(error.message || 'Failed to fetch data');
      
      // If unauthorized, logout
      if (error.status === 401) {
        dispatch(logout());
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminMessage = async () => {
    try {
      const response = await patsansthaAPI.getAdminMessage();
      if (response.success && response.data.hasMessage) {
        setAdminMessage(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin message:', error);
      // Don't show error toast for admin message as it's not critical
    }
  };

  const filterAgents = () => {
    if (!patsansthaData?.agents) return;
    
    let filtered = patsansthaData.agents;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.agentname.toLowerCase().includes(searchLower) ||
        agent.agentno.toLowerCase().includes(searchLower) ||
        agent.mobileNumber.includes(searchTerm.trim())
      );
    }

    setFilteredAgents(filtered);
  };

  const handleDeleteAgent = async (agentno) => {
    // Find agent name for confirmation
    const agent = patsansthaData?.agents?.find(a => a.agentno === agentno);
    const agentName = agent ? agent.agentname : agentno;
    
    if (!window.confirm(`Are you sure you want to delete agent "${agentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await patsansthaAPI.deleteAgent(agentno);
      if (response.success) {
        toast.success(`Agent "${agentName}" deleted successfully`);
        fetchData(); // Refresh data after deletion
      } else {
        toast.error(response.message || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Delete agent error:', error);
      toast.error(error.message || 'Failed to delete agent');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logoutPatsanstha();
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Render content based on active section
  const renderContent = () => {
    const commonProps = {
      patsansthaData,
      fetchData, // This will be used as onRefreshData in AgentsPage
      loading
    };

    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage {...commonProps} />;
      case 'agents':
        return (
          <AgentsPage 
            {...commonProps}
            filteredAgents={filteredAgents}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowAddForm={setShowAddForm}
            setEditingAgent={setEditingAgent}
            handleDeleteAgent={handleDeleteAgent}
            onRefreshData={fetchData} // Pass fetchData as onRefreshData prop
          />
        );
      case 'reports':
        return <CustomerReport {...commonProps} />;
      case 'settings':
        return <SettingsPage {...commonProps} />;
      default:
        return <DashboardPage {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black p-4 lg:p-6" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div className="flex h-full rounded-3xl overflow-hidden shadow-2xl">
        <Sidebar 
          user={user}
          onLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 bg-white">
          <MobileHeader 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6 lg:p-8">
              {/* Admin Message Alert - Show only on dashboard */}
              {adminMessage && activeSection === 'dashboard' && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-800 mb-1">
                        Message from Admin
                      </h3>
                      <p className="text-sm text-amber-700 line-clamp-2">
                        {adminMessage.message}
                      </p>
                      <button
                        onClick={() => setShowMessage(true)}
                        className="text-sm text-amber-600 hover:text-amber-800 underline mt-2 font-medium"
                      >
                        Read full message →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Content */}
              {renderContent()}
            </div>
          </main>
        </div>

        {/* Modals */}
        {showAddForm && (
          <AddAgentForm 
            onClose={() => setShowAddForm(false)} 
            onSuccess={() => {
              fetchData();
              setShowAddForm(false);
            }}
          />
        )}

        {editingAgent && (
          <AddAgentForm
            editData={editingAgent}
            onClose={() => setEditingAgent(null)}
            onSuccess={() => {
              fetchData();
              setEditingAgent(null);
            }}
          />
        )}

        {showMessage && adminMessage && (
          <AdminMessage
            message={adminMessage.message}
            messageUpdatedAt={adminMessage.messageUpdatedAt}
            onClose={() => setShowMessage(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PatsansthaDashboard;