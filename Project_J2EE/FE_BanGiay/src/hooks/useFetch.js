// Custom hook để fetch data
import { useState, useEffect } from 'react';

export const useFetch = (fetchFunction, params = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = params ? await fetchFunction(params) : await fetchFunction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFunction, params]);

  return { data, loading, error };
};
