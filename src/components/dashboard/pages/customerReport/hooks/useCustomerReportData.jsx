// File: components/reports/CustomerReport/hooks/useCustomerReportData.js
import { useState, useEffect } from 'react';
import { patsansthaAPI } from '../../../../../services/api';

export const useCustomerReportData = () => {
  const [patsansthaData, setPatsansthaData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    agentno: null,
    date: null,
    submitted: null
  });

  const fetchPatsansthaData = async () => {
    const response = await patsansthaAPI.viewData();
    setPatsansthaData(response.data);
  };

  const fetchTransactionData = async (filterParams = {}) => {
    const response = await patsansthaAPI.getTransactions(filterParams);
    setTransactionData(response.data);
  };

  const fetchAllData = async (filterParams = {}) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPatsansthaData(),
        fetchTransactionData(filterParams)
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(filters);
  }, []);

  const handleRefreshData = () => {
    fetchAllData(filters);
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setLoading(true);
    fetchTransactionData(updatedFilters).finally(() => setLoading(false));
  };

  const clearFilters = () => {
    const clearedFilters = { agentno: null, date: null, submitted: null };
    setFilters(clearedFilters);
    setLoading(true);
    fetchTransactionData(clearedFilters).finally(() => setLoading(false));
  };

  return {
    patsansthaData,
    transactionData,
    loading,
    filters,
    handleRefreshData,
    updateFilters,
    clearFilters
  };
};
