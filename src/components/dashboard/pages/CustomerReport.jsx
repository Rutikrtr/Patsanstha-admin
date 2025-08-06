import React, { useState, useEffect } from 'react';
import { patsansthaAPI } from '../../../services/api';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, Eye, ChevronRight, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react';

const CustomerReport = () => {
  const [patsansthaData, setPatsansthaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchPatsansthaData();
  }, []);

  const fetchPatsansthaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patsansthaAPI.viewData();
      setPatsansthaData(response.data);
    } catch (err) {
      console.error('Error fetching patsanstha data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data function
  const handleRefreshData = () => {
    fetchPatsansthaData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={handleRefreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!patsansthaData?.agents) return { totalAgents: 0, totalCustomers: 0, todayCollections: 0, totalBalance: 0 };

    let totalCustomers = 0;
    let todayCollections = 0;
    let totalBalance = 0;
    const today = new Date().toISOString().split('T')[0];

    patsansthaData.agents.forEach(agent => {
      totalCustomers += agent.customers?.length || 0;
      
      // Calculate total balance from customers
      agent.customers?.forEach(customer => {
        totalBalance += customer.prevBalance || 0;
      });

      // Calculate today's collections
      const todayCollection = agent.dailyCollections?.find(dc => dc.date === today);
      if (todayCollection) {
        todayCollection.transactions?.forEach(transaction => {
          todayCollections += transaction.collAmt || 0;
        });
      }
    });

    return {
      totalAgents: patsansthaData.agents.length,
      totalCustomers,
      todayCollections,
      totalBalance
    };
  };

  const summary = calculateSummary();

  // Get all daily collections with agent info
  const getAllCollections = () => {
    if (!patsansthaData?.agents) return [];

    const collections = [];
    patsansthaData.agents.forEach(agent => {
      agent.dailyCollections?.forEach(collection => {
        collections.push({
          ...collection,
          agentName: agent.agentname,
          agentNo: agent.agentno
        });
      });
    });

    // Sort by date (newest first)
    return collections.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const allCollections = getAllCollections();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Collections Report</h1>
          <p className="text-gray-600">View daily collection activities and transaction details</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefreshData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Print Report
          </button>
        </div>
      </div>

      {/* Organization Info */}
      {patsansthaData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{patsansthaData.fullname}</h2>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>Organization: {patsansthaData.patname}</span>
            <span>Mobile: {patsansthaData.mobilenumber}</span>
            <span>Max Agents: {patsansthaData.noOfAgent}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              patsansthaData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {patsansthaData.status?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalAgents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Collections</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.todayCollections)}</p>
            </div>
            <IndianRupee className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalBalance)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Daily Collections List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Daily Collections</h2>
          <p className="text-gray-600 mt-1">Recent collection activities by all agents</p>
        </div>

        <div className="divide-y divide-gray-200">
          {allCollections.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No daily collections found</p>
            </div>
          ) : (
            allCollections.map((collection, index) => {
              const totalCollected = collection.transactions?.reduce((sum, t) => sum + (t.collAmt || 0), 0) || 0;
              const completedTransactions = collection.transactions?.filter(t => t.collAmt > 0).length || 0;
              const totalTransactions = collection.transactions?.length || 0;
              const isExpanded = expandedAgent === `${collection.agentNo}-${collection.date}`;

              return (
                <div key={index} className="p-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg"
                    onClick={() => setExpandedAgent(isExpanded ? null : `${collection.agentNo}-${collection.date}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${collection.submitted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {collection.agentName} ({collection.agentNo})
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {collection.date}
                          </span>
                          <span className="flex items-center">
                            {collection.submitted ? (
                              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 mr-1 text-yellow-500" />
                            )}
                            {collection.submitted ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(totalCollected)}</p>
                        <p className="text-sm text-gray-600">{completedTransactions}/{totalTransactions} completed</p>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Transaction Details */}
                  {isExpanded && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Agent Metadata</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Last Account: {collection.agentMeta?.lastAccountNo}</p>
                            <p>Limit Amount: {formatCurrency(collection.agentMeta?.limitAmount || 0)}</p>
                            <p>HR: {collection.agentMeta?.hr}</p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Collection Summary</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Total Collected: {formatCurrency(totalCollected)}</p>
                            <p>Completed: {completedTransactions}/{totalTransactions}</p>
                            <p>Status: {collection.submitted ? 'Submitted' : 'Pending'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-100 border-b">
                          <h4 className="font-medium text-gray-900">Transaction Details</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prev Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {collection.transactions?.map((transaction, tIndex) => (
                                <tr key={tIndex} className={transaction.collAmt > 0 ? 'bg-green-50' : ''}>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.accountNo}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{transaction.mobileNumber}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(transaction.prevBalance)}</td>
                                  <td className="px-4 py-3 text-sm font-medium">
                                    {transaction.collAmt > 0 ? (
                                      <span className="text-green-600">{formatCurrency(transaction.collAmt)}</span>
                                    ) : (
                                      <span className="text-gray-400">No collection</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {transaction.time ? new Date(transaction.time).toLocaleTimeString() : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerReport;