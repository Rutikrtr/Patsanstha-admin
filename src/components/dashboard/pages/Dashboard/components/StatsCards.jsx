import React from 'react';
import { Users, Shield, UserPlus } from 'lucide-react';

const StatsCards = ({ patsansthaData }) => {
  // Safe data extraction with fallbacks
  const totalAgents = patsansthaData?.agents?.length || 0;
  const agentLimit = patsansthaData?.noOfAgent || 0;
  const availableSlots = Math.max(0, agentLimit - totalAgents);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Agents Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Agents</p>
            <p className="text-3xl font-bold text-gray-900">{totalAgents}</p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* Agent Limit Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Agent Limit</p>
            <p className="text-3xl font-bold text-green-600">{agentLimit}</p>
            <p className="text-xs text-gray-500 mt-1">Maximum allowed</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      
      {/* Available Slots Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Available Slots</p>
            <p className={`text-3xl font-bold ${availableSlots > 0 ? 'text-purple-600' : 'text-red-500'}`}>
              {availableSlots}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {availableSlots > 0 ? 'Slots remaining' : 'Limit reached'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            availableSlots > 0 ? 'bg-purple-100' : 'bg-red-100'
          }`}>
            <UserPlus className={`h-6 w-6 ${
              availableSlots > 0 ? 'text-purple-600' : 'text-red-500'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;