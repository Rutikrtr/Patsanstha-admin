// File: components/reports/CustomerReport/hooks/useCustomerReportData.js
import { useState, useEffect } from 'react';
import { patsansthaAPI } from '../../../../../services/api';

export const useCustomerReportData = () => {
  const [patsansthaData, setPatsansthaData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    agentno: null,
    date: null,
    submitted: null
  });

  const fetchPatsansthaData = async () => {
    try {
      const response = await patsansthaAPI.viewData();
      setPatsansthaData(response.data);
    } catch (err) {
      console.error('Error fetching patsanstha data:', err);
      throw err;
    }
  };

  const fetchTransactionData = async (filterParams = {}) => {
    try {
      const response = await patsansthaAPI.getTransactions(filterParams);
      setTransactionData(response.data);
    } catch (err) {
      console.error('Error fetching transaction data:', err);
      throw err;
    }
  };

  const fetchAllData = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchPatsansthaData(),
        fetchTransactionData(filterParams)
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData(filters);
  }, []);

  const handleRefreshData = () => {
    fetchAllData(filters);
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Only fetch transactions with new filters (patsanstha data doesn't need to be refetched)
    setLoading(true);
    fetchTransactionData(updatedFilters)
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err.message || 'Failed to fetch transactions');
        setLoading(false);
      });
  };

  const clearFilters = () => {
    const clearedFilters = {
      agentno: null,
      date: null,
      submitted: null
    };
    setFilters(clearedFilters);
    
    setLoading(true);
    fetchTransactionData(clearedFilters)
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err.message || 'Failed to fetch transactions');
        setLoading(false);
      });
  };

  return {
    patsansthaData,
    transactionData,
    loading,
    error,
    filters,
    handleRefreshData,
    updateFilters,
    clearFilters
  };
};