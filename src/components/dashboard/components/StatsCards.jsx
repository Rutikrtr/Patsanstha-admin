import React from 'react';
import { Users, Shield, UserPlus } from 'lucide-react';

const StatsCards = ({ patsansthaData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Agents</p>
            <p className="text-3xl font-bold text-gray-900">{patsansthaData?.agents?.length || 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Agent Limit</p>
            <p className="text-3xl font-bold text-green-600">{patsansthaData?.noOfAgent}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Available Slots</p>
            <p className="text-3xl font-bold text-purple-600">
              {patsansthaData?.noOfAgent - (patsansthaData?.agents?.length || 0)}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;