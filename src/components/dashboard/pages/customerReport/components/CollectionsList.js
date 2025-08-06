// File: components/reports/CustomerReport/components/CollectionsList.js
import React from 'react';
import { Calendar, Search } from 'lucide-react';
import CollectionItem from './CollectionItem';
import CustomerTable from './CustomerTable';

const CollectionsList = ({ searchTerm, onSearchChange, patsansthaData }) => (
  <div className="space-y-6">
    {/* Customer Table */}
    <CustomerTable 
      patsansthaData={patsansthaData}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
    />
  </div>
);

export default CollectionsList;