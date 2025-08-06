// File: components/reports/CustomerReport/components/OrganizationInfo.js
import React from 'react';

const OrganizationInfo = ({ patsansthaData }) => {
  if (!patsansthaData) return null;

  return (
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
  );
};

export default OrganizationInfo;