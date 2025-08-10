import React from 'react';
import { Building2, User, Phone, Calendar, Shield } from 'lucide-react';

const OrganizationInfo = ({ patsansthaData }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Format mobile number
  const formatMobileNumber = (number) => {
    if (!number) return 'Not provided';
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Patsanstha Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Organization Name */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Patsanstha Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {patsansthaData?.patname || 'Not available'}
            </p>
          </div>
        </div>
        
        {/* Full Name */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Full Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {patsansthaData?.fullname || 'Not available'}
            </p>
          </div>
        </div>
        
        {/* Mobile Number */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Phone className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Mobile Number</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatMobileNumber(patsansthaData?.mobilenumber)}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            patsansthaData?.status === 'active' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Shield className={`h-6 w-6 ${
              patsansthaData?.status === 'active' ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <p className={`text-lg font-semibold capitalize ${
              patsansthaData?.status === 'active' ? 'text-green-600' : 'text-red-600'
            }`}>
              {patsansthaData?.status || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Created</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(patsansthaData?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Message Section - if available */}
      {patsansthaData?.message && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Latest Message</h3>
          <p className="text-blue-800 text-sm">{patsansthaData.message}</p>
          {patsansthaData.messageUpdatedAt && (
            <p className="text-blue-600 text-xs mt-2">
              Updated: {formatDate(patsansthaData.messageUpdatedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationInfo;