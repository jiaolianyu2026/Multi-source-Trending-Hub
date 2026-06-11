import type { ApiResponse, HotPlatform, HotSearchData } from '../types/hot';

/**
 * API 基础地址配置：
 * - 开发环境：使用 '/api'，由 Vite 代理转发到 http://localhost:3001
 * - 生产环境：使用 VITE_API_BASE_URL 环境变量（如 https://your-backend.up.railway.app）
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 获取所有平台热搜数据
 */
export async function fetchAllHotSearch(): Promise<HotSearchData> {
  // 开发阶段使用 mock 数据
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    const mockData = await import('../mock/hot.json');
    return mockData.default as HotSearchData;
  }

  const response = await fetch(`${API_BASE_URL}/hotsearch`);
  const result: ApiResponse<HotSearchData> = await response.json();

  if (result.code !== 0) {
    throw new Error(result.message || '获取数据失败');
  }

  return result.data;
}

/**
 * 获取指定平台热搜数据
 */
export async function fetchPlatformHotSearch(platform: 'zhihu' | 'bilibili' | 'weibo'): Promise<HotPlatform> {
  // 开发阶段使用 mock 数据
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    const mockData = await import('../mock/hot.json');
    return mockData.default[platform] as HotPlatform;
  }

  const response = await fetch(`${API_BASE_URL}/hot/${platform}`);
  const result: ApiResponse<HotPlatform> = await response.json();

  if (result.code !== 0) {
    throw new Error(result.message || '获取数据失败');
  }

  return result.data;
}
