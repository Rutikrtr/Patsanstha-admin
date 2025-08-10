import React, { useState, useEffect } from 'react';
import { patsansthaAPI } from '../../../../services/api';
import toast from 'react-hot-toast';
import StatsCards from './components/StatsCards';
import OrganizationInfo from './components/OrganizationInfo';

const DashboardPage = () => {
  const [patsansthaData, setPatsansthaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await patsansthaAPI.viewData();
      
      if (response.success && response.data) {
        setPatsansthaData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching patsanstha data:', error);
      const errorMessage = error.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome to your management dashboard</p>
        </div>

        {/* Loading Skeleton */}
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !patsansthaData) {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome to your management dashboard</p>
        </div>

        {/* Error State */}
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to your management dashboard</p>
      </div>

      {/* Stats Cards */}
      <StatsCards patsansthaData={patsansthaData} />

      {/* Organization Info */}
      <OrganizationInfo patsansthaData={patsansthaData} />
    </div>
  );
};

export default DashboardPage;