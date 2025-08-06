// File: components/reports/CustomerReport/components/CustomerTable.js
import React, { useState, useMemo } from 'react';
import { Search, Users, Phone, CreditCard, IndianRupee, User, Filter, ChevronDown, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatUtils';

const CustomerTable = ({ patsansthaData, searchTerm, onSearchChange }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedDate, setSelectedDate] = useState('latest'); // New state for date filter

  // Get all unique agents
  const allAgents = useMemo(() => {
    if (!patsansthaData?.agents) return [];
    return patsansthaData.agents.map(agent => ({
      agentNo: agent.agentno,
      agentName: agent.agentname,
      customerCount: 0 // Will be calculated below
    }));
  }, [patsansthaData]);

  // Get all available dates from daily collections
  const availableDates = useMemo(() => {
    if (!patsansthaData?.agents) return [];
    
    const dates = new Set();
    patsansthaData.agents.forEach(agent => {
      agent.dailyCollections?.forEach(collection => {
        dates.add(collection.date);
      });
    });
    
    return Array.from(dates).sort((a, b) => new Date(b) - new Date(a)); // Sort newest first
  }, [patsansthaData]);

  // Get all customers from all agents based on selected date
  const allCustomers = useMemo(() => {
    if (!patsansthaData?.agents) return [];
    
    const customers = [];
    
    patsansthaData.agents.forEach(agent => {
      let customerData = [];
      
      if (selectedDate === 'latest') {
        // Get customers from the latest daily collection
        const latestCollection = agent.dailyCollections?.[agent.dailyCollections.length - 1];
        if (latestCollection?.transactions) {
          customerData = latestCollection.transactions;
        }
      } else {
        // Get customers from specific date
        const dateCollection = agent.dailyCollections?.find(collection => collection.date === selectedDate);
        if (dateCollection?.transactions) {
          customerData = dateCollection.transactions;
        }
      }
      
      // Add agent info to each customer
      customerData.forEach(customer => {
        customers.push({
          ...customer,
          agentName: agent.agentname,
          agentNo: agent.agentno
        });
      });
    });
    
    return customers;
  }, [patsansthaData, selectedDate]);

  // Update agent customer counts
  const agentsWithCounts = useMemo(() => {
    return allAgents.map(agent => ({
      ...agent,
      customerCount: allCustomers.filter(customer => customer.agentNo === agent.agentNo).length
    }));
  }, [allAgents, allCustomers]);

  // Filter customers by selected agent
  const agentFilteredCustomers = useMemo(() => {
    if (selectedAgent === 'all') return allCustomers;
    return allCustomers.filter(customer => customer.agentNo === selectedAgent);
  }, [allCustomers, selectedAgent]);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return agentFilteredCustomers;
    
    const searchLower = searchTerm.toLowerCase();
    return agentFilteredCustomers.filter(customer =>
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.accountNo?.toLowerCase().includes(searchLower) ||
      customer.mobileNumber?.includes(searchTerm) ||
      customer.agentName?.toLowerCase().includes(searchLower)
    );
  }, [agentFilteredCustomers, searchTerm]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      // Handle numeric fields
      if (sortField === 'prevBalance' || sortField === 'collAmt') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredCustomers, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleAgentChange = (e) => {
    setSelectedAgent(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const formatDate = (dateString) => {
    if (dateString === 'latest') return 'Latest Data';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Transaction</h2>
            <p className="text-gray-600 mt-1">
              {selectedDate === 'latest' ? 'Latest customer data' : `Data for ${formatDate(selectedDate)}`}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{sortedCustomers.length} customers</span>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex items-center space-x-4 mb-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, account number, mobile, or agent name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Section */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={selectedDate}
                onChange={handleDateChange}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
              >
                <option value="latest">Latest Data</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Agent Filter */}
            <div className="relative">
              <select
                value={selectedAgent}
                onChange={handleAgentChange}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
              >
                <option value="all">All Agents ({allCustomers.length})</option>
                {agentsWithCounts.map(agent => (
                  <option key={agent.agentNo} value={agent.agentNo}>
                    {agent.agentName} ({agent.customerCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Active Filters Display */}
            <div className="flex items-center space-x-2">
              {selectedDate !== 'latest' && (
                <div className="flex items-center space-x-2 bg-blue-50 px-2 py-1 rounded-full">
                  <Calendar className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {formatDate(selectedDate)}
                  </span>
                  <button
                    onClick={() => setSelectedDate('latest')}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {selectedAgent !== 'all' && (
                <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-green-700">
                    {agentsWithCounts.find(a => a.agentNo === selectedAgent)?.agentName}
                  </span>
                  <button
                    onClick={() => setSelectedAgent('all')}
                    className="text-green-600 hover:text-green-800 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('accountNo')}
              >
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Account No</span>
                  <span className="text-gray-400">{getSortIcon('accountNo')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Customer Name</span>
                  <span className="text-gray-400">{getSortIcon('name')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>Mobile</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('prevBalance')}
              >
                <div className="flex items-center space-x-1">
                  <IndianRupee className="h-4 w-4" />
                  <span>Prev Balance</span>
                  <span className="text-gray-400">{getSortIcon('prevBalance')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('collAmt')}
              >
                <div className="flex items-center space-x-1">
                  <IndianRupee className="h-4 w-4" />
                  <span>Collection</span>
                  <span className="text-gray-400">{getSortIcon('collAmt')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Agent</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Time</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No customers found</p>
                    <p className="text-gray-400 text-sm">
                      {searchTerm || selectedAgent !== 'all' || selectedDate !== 'latest' 
                        ? 'Try adjusting your search or filter criteria' 
                        : 'No customer data available'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedCustomers.map((customer, index) => (
                <tr key={`${customer.agentNo}-${customer.accountNo}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{customer.accountNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{customer.mobileNumber || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        (customer.prevBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(customer.prevBalance || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        (customer.collAmt || 0) > 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {formatCurrency(customer.collAmt || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{customer.agentName}</div>
                      <div className="text-gray-500">({customer.agentNo})</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {customer.time ? (
                        <div>
                          <div>{customer.time}</div>
                          <div className="text-xs text-gray-400">{customer.date}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not collected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {sortedCustomers.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {sortedCustomers.length} of {allCustomers.length} customers
              {selectedAgent !== 'all' && ` (filtered by ${agentsWithCounts.find(a => a.agentNo === selectedAgent)?.agentName})`}
              {selectedDate !== 'latest' && ` for ${formatDate(selectedDate)}`}
            </span>
            <div className="flex items-center space-x-4">
              <span>Total Collection: </span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  sortedCustomers.reduce((sum, customer) => sum + (customer.collAmt || 0), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;