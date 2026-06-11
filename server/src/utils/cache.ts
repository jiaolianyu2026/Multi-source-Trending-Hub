/**
 * 内存缓存工具
 * 支持 TTL（生存时间）和自动过期删除
 */

interface CacheItem<T> {
  data: T;
  expireAt: number; // 过期时间戳（毫秒）
}

// 缓存存储
const cacheStore = new Map<string, CacheItem<unknown>>();

// 默认 TTL（秒），从环境变量读取，默认 120 秒
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL || '120', 10);

/**
 * 获取缓存
 * @param key 缓存键
 * @returns 缓存数据，不存在或已过期则返回 null
 */
export function getCache<T>(key: string): T | null {
  const item = cacheStore.get(key);

  if (!item) {
    return null;
  }

  // 检查是否过期
  if (Date.now() > item.expireAt) {
    cacheStore.delete(key);
    return null;
  }

  return item.data as T;
}

/**
 * 设置缓存
 * @param key 缓存键
 * @param data 缓存数据
 * @param ttlSec TTL（秒），不传则使用默认值
 */
export function setCache<T>(key: string, data: T, ttlSec?: number): void {
  const ttl = ttlSec ?? DEFAULT_TTL;
  const expireAt = Date.now() + ttl * 1000;

  cacheStore.set(key, {
    data,
    expireAt,
  });

  // 设置自动删除定时器
  setTimeout(() => {
    const currentItem = cacheStore.get(key);
    if (currentItem && Date.now() >= currentItem.expireAt) {
      cacheStore.delete(key);
    }
  }, ttl * 1000);
}

/**
 * 删除缓存
 * @param key 缓存键
 */
export function delCache(key: string): void {
  cacheStore.delete(key);
}

/**
 * 清空所有缓存
 */
export function clearCache(): void {
  cacheStore.clear();
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
  };
}
