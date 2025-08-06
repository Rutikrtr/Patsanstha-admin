// File: components/reports/CustomerReport/hooks/useCustomerReportData.js
import { useState, useEffect } from 'react';
import { patsansthaAPI } from '../../../../../services/api';

export const useCustomerReportData = () => {
  const [patsansthaData, setPatsansthaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatsansthaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patsansthaAPI.viewData();
      setPatsansthaData(response.data);
    } catch (err) {
      console.error('Error fetching patsanstha data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatsansthaData();
  }, []);

  const handleRefreshData = () => {
    fetchPatsansthaData();
  };

  return {
    patsansthaData,
    loading,
    error,
    handleRefreshData
  };
};
