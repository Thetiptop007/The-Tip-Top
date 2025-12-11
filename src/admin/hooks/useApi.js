import { useState, useEffect } from 'react';

/**
 * Custom hook for API calls with loading, error, and data states
 * @param {Function} apiFunc - API function to call
 * @param {*} defaultValue - Default value for data
 * @param {boolean} immediate - Whether to call immediately on mount
 */
export const useApi = (apiFunc, defaultValue = null, immediate = true) => {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunc(...args);
      const result = response.data?.data || response.data;
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { data, loading, error, execute, refetch: execute };
};

/**
 * Hook for paginated API calls
 */
export const usePaginatedApi = (apiFunc, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = async (customParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = { ...params, ...customParams };
      const response = await apiFunc(queryParams);
      
      const result = response.data;
      setData(result.data?.orders || result.data?.menuItems || result.data?.users || result.data || []);
      
      if (result.pagination) {
        setPagination(result.pagination);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    const newParams = { ...params, page };
    setParams(newParams);
    fetchData(newParams);
  };

  const changeLimit = (limit) => {
    const newParams = { ...params, limit, page: 1 };
    setParams(newParams);
    fetchData(newParams);
  };

  const updateFilters = (newFilters) => {
    const newParams = { ...params, ...newFilters, page: 1 };
    setParams(newParams);
    fetchData(newParams);
  };

  useEffect(() => {
    fetchData(params);
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    refetch: () => fetchData(params),
    goToPage,
    changeLimit,
    updateFilters,
    params,
  };
};

/**
 * Hook for mutations (create, update, delete)
 */
export const useMutation = (apiFunc) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await apiFunc(...args);
      setSuccess(true);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return { execute, loading, error, success, reset };
};
