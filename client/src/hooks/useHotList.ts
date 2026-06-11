import { useState, useEffect, useCallback } from 'react';
import { fetchAllHot } from '../api/hot';
import type { HotPlatform } from '../types/hot';

interface UseHotListReturn {
  data: HotPlatform[];
  loading: boolean;
  error: boolean;
  message?: string;
  refetch: () => void;
}

export function useHotList(): UseHotListReturn {
  const [data, setData] = useState<HotPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState<string>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    setMessage(undefined);

    try {
      // 调用后端 API 获取所有平台数据
      const hotData = await fetchAllHot();
      const platforms = Object.values(hotData);

      setData(platforms);
      setLoading(false);
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : '加载失败');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    message,
    refetch: fetchData,
  };
}
