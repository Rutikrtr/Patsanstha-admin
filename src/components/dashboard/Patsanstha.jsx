import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout } from '../../store/authSlice.js';
import { patsansthaAPI, authAPI } from '../../services/api.js';

// Components
import Sidebar from './components/Sidebar.jsx';
import MobileHeader from './components/MobileHeader.jsx';
import AdminMessage from './pages/Dashboard/components/AdminMessage.jsx';
import AddAgentForm from './pages/Agents/components/AddAgentForm.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

// Pages
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import AgentsPage from './pages/Agents/AgentsPage.jsx';
import CustomerReport from './pages/customerReport/index.js'
import SettingsPage from './pages/Settings/SettingsPage.jsx';

// Load DM Sans font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Apply DM Sans to body
document.body.style.fontFamily = '"DM Sans", sans-serif';

const Patsanstha = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [patsansthaData, setPatsansthaData] = useState(null);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [adminMessage, setAdminMessage] = useState(null);
  
  // Enhanced loading states
  const [loadingStates, setLoadingStates] = useState({
    initial: true,
    data: false,
    adminMessage: false,
    agentAction: false, // For add/edit/delete operations
    logout: false
  });
  
  const [showLoading, setShowLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Helper function to update specific loading state
  const updateLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Check if any loading is active
  const isAnyLoading = Object.values(loadingStates).some(loading => loading);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (patsansthaData?.agents) {
      filterAgents();
    }
  }, [patsansthaData, searchTerm]);

  const initializeApp = async () => {
    updateLoadingState('initial', true);
    
    // Run both API calls in parallel for faster loading
    await Promise.all([
      fetchData(),
      fetchAdminMessage()
    ]);
    
    updateLoadingState('initial', false);
  };

  const fetchData = async () => {
    try {
      updateLoadingState('data', true);
      const response = await patsansthaAPI.viewData();
      
      if (response.success) {
        setPatsansthaData(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error(error.message || 'Failed to fetch data');
      
      // If unauthorized, logout
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        dispatch(logout());
        navigate('/login');
      }
    } finally {
      updateLoadingState('data', false);
    }
  };

  const fetchAdminMessage = async () => {
    try {
      updateLoadingState('adminMessage', true);
      const response = await patsansthaAPI.getAdminMessage();
      
      if (response.success && response.data.hasMessage) {
        setAdminMessage(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin message:', error);
      // Don't show error toast for admin message as it's not critical
    } finally {
      updateLoadingState('adminMessage', false);
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
      updateLoadingState('agentAction', true);
      const response = await patsansthaAPI.deleteAgent(agentno);
      
      if (response.success) {
        toast.success(`Agent "${agentName}" deleted successfully`);
        await fetchData(); // Refresh data after deletion
      } else {
        toast.error(response.message || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Delete agent error:', error);
      toast.error(error.message || 'Failed to delete agent');
    } finally {
      updateLoadingState('agentAction', false);
    }
  };

  const handleLogout = async () => {
    try {
      updateLoadingState('logout', true);
      await authAPI.logoutPatsanstha();
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      updateLoadingState('logout', false);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Enhanced refresh function that shows loading
  const handleRefreshData = async () => {
    await fetchData();
  };

  // Enhanced form handlers that show loading
  const handleFormSuccess = async (action) => {
    updateLoadingState('agentAction', true);
    try {
      await fetchData();
      if (action === 'add') {
        setShowAddForm(false);
      } else if (action === 'edit') {
        setEditingAgent(null);
      }
      toast.success(`Agent ${action === 'add' ? 'added' : 'updated'} successfully`);
    } finally {
      updateLoadingState('agentAction', false);
    }
  };

  // Render content based on active section
  const renderContent = () => {
    const commonProps = {
      patsansthaData,
      fetchData: handleRefreshData,
      loading: loadingStates.data || loadingStates.agentAction
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
            onRefreshData={handleRefreshData}
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

  // Show loading screen during initial load or when showLoading is true
  if (loadingStates.initial || showLoading) {
    return <LoadingScreen onAnimationComplete={handleLoadingComplete} />;
  }

  return (
    <div className="h-screen p-4 lg:p-6" style={{ 
        fontFamily: '"DM Sans", sans-serif',
        background : '#DAD2FF',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
      <div className="flex h-full rounded-3xl overflow-hidden shadow-2xl">
        <Sidebar 
          user={user}
          onLogout={handleLogout}
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
                    </div>
                  </div>
                </div>
              )}

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

        {/* Modals */}
        {showAddForm && (
          <AddAgentForm 
            onClose={() => setShowAddForm(false)} 
            onSuccess={() => handleFormSuccess('add')}
            loading={loadingStates.agentAction}
          />
        )}

        {editingAgent && (
          <AddAgentForm
            editData={editingAgent}
            onClose={() => setEditingAgent(null)}
            onSuccess={() => handleFormSuccess('edit')}
            loading={loadingStates.agentAction}
          />
        )}

        {showMessage && adminMessage && (
          <AdminMessage
            message={adminMessage.message}
            messageUpdatedAt={adminMessage.messageUpdatedAt}
          />
        )}

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