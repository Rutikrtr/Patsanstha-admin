import React from 'react';
import StatsCards from '../components/StatsCards';
import OrganizationInfo from '../components/OrganizationInfo';

const DashboardPage = ({ patsansthaData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
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