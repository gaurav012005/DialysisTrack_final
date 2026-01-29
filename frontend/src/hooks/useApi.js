import { useState, useEffect } from 'react';
import config from '../config/environment';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // Remove 'api/' from the base URL to get the host, since usage typically includes /api in the url argument
        // or usage relies on root. If url starts with /api, we append it to host.
        // Original: http://localhost:8000${url}
        const apiHost = config.API_BASE_URL.replace(/\/api\/$/, '');
        const response = await fetch(`${apiHost}${url}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};