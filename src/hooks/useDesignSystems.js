import { useState, useEffect } from 'react';
import { getDesignSystems } from '@/lib/api';

export function useDesignSystems() {
  const [designSystems, setDesignSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDesignSystems()
      .then((data) => {
        if (!cancelled) {
          setDesignSystems(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load design systems');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { designSystems, loading, error };
}
