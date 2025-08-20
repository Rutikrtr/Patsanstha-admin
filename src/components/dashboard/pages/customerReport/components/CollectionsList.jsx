// File: components/reports/CustomerReport/components/CollectionsList.js
import React from 'react';
import CustomerTable from './CustomerTable';

const CollectionsList = ({ 
  searchTerm, 
  onSearchChange, 
  patsansthaData
}) => {
  return (
    <div className="space-y-6">
      <CustomerTable 
        patsansthaData={patsansthaData}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
    </div>
  );
};

export default CollectionsList;
