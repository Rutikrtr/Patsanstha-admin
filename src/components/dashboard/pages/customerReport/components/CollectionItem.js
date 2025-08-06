// File: components/reports/CustomerReport/components/CollectionItem.js
import React from 'react';
import { Calendar, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/formatUtils';
import CollectionSummary from './CollectionSummary';

const CollectionItem = ({ collection, isExpanded, onToggle }) => {
  const totalCollected = collection.transactions?.reduce((sum, t) => sum + (t.collAmt || 0), 0) || 0;
  const completedTransactions = collection.transactions?.filter(t => t.collAmt > 0).length || 0;
  const totalTransactions = collection.transactions?.length || 0;

  return (
    <div className="p-6">
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg"
        onClick={onToggle}
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
    </div>
  );
};

export default CollectionItem;