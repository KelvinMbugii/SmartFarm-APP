import { useState, useEffect, useRef } from 'react';
import marketService from '@/services/MarketService.jsx';

export const useMarketData = (commodity, isLive) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Keep track of the latest params to prevent stale closures
  const currentParams = useRef({ commodity, isLive });
  currentParams.current = { commodity, isLive };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchMethod = currentParams.current.isLive 
          ? marketService.getLiveMarketPrices 
          : marketService.getMarketPrices;
          
        const result = await fetchMethod.call(marketService, currentParams.current.commodity === 'all' ? '' : currentParams.current.commodity);
        
        if (!mounted) return;

        const processed = result.map((item) => ({
          ...item,
          trend: item.change > 0 ? "up" : item.change < 0 ? "down" : "flat",
          change: Number(item.change || 0),
        }));

        setData(processed);
      } catch (err) {
        if (mounted) {
          setError(err.message || 'An error occurred fetching data');
          // Fallback to mock data if there is an error to prevent blank screen
          setData(marketService.getMockMarketData());
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [commodity, isLive]);

  return { data, loading, error };
};
