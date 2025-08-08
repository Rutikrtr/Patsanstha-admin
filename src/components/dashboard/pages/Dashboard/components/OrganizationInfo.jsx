import React from 'react';
import { Building2, User, Phone } from 'lucide-react';

const OrganizationInfo = ({ patsansthaData }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Organization Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Organization Name</p>
            <p className="text-lg font-semibold text-gray-900">{patsansthaData?.patname}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Full Name</p>
            <p className="text-lg font-semibold text-gray-900">{patsansthaData?.fullname}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Phone className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Mobile Number</p>
            <p className="text-lg font-semibold text-gray-900">{patsansthaData?.mobilenumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationInfo;