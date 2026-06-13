import { useEffect, useState } from 'react';
import { HotCard } from './HotCard';
import styles from './PlatformView.module.css';
import type { HotSearchData } from '../types/hot';
import { fetchAllHotSearch } from '../api/hotsearch';

export function PlatformView() {
  const [data, setData] = useState<HotSearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAllHotSearch();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>⚠️ {error}</p>
        <button onClick={loadData} className={styles.retryBtn}>
          重试
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={styles.grid}>
      <HotCard data={data.zhihu} />
      <HotCard data={data.bilibili} />
      <HotCard data={data.weibo} />
    </div>
  );
}
