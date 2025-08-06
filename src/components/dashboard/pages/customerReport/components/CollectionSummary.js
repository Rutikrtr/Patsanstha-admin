// File: components/reports/CustomerReport/components/CollectionSummary.js
import React from 'react';
import { formatCurrency } from '../utils/formatUtils';

const CollectionSummary = ({ collection, totalCollected, completedTransactions, totalTransactions }) => (
  <div className="mt-4 bg-gray-50 rounded-lg p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  </div>
);

export default CollectionSummary;