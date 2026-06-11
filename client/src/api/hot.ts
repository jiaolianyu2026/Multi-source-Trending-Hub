import type { ApiResponse, HotPlatform, HotSearchData } from '../types/hot';

/**
 * API 基础地址配置：
 * - 开发环境：使用 '/api'，由 Vite 代理转发到 http://localhost:3001
 * - 生产环境：使用 VITE_API_BASE_URL 环境变量
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 获取所有平台热搜数据
 * 调用后端 GET /api/hot，返回 { platforms: [知乎, B站, 微博] }
 */
export async function fetchAllHot(): Promise<HotSearchData> {
  const response = await fetch(`${API_BASE_URL}/hot`);
  const result: ApiResponse<{ platforms: HotPlatform[] }> = await response.json();

  if (result.code !== 0) {
    throw new Error(result.message || '获取数据失败');
  }

  // 将数组转换为对象格式 { zhihu, bilibili, weibo }
  const platforms = result.data.platforms;
  const [zhihu, bilibili, weibo] = platforms;

  return { zhihu, bilibili, weibo };
}

/**
 * 获取指定平台热搜数据
 * 调用后端 GET /api/hot/:source
 * @param source - 平台标识：zhihu | bilibili | weibo
 */
export async function fetchHotPlatform(source: string): Promise<HotPlatform> {
  const response = await fetch(`${API_BASE_URL}/hot/${source}`);
  const result: ApiResponse<HotPlatform> = await response.json();

  if (result.code !== 0) {
    throw new Error(result.message || `获取${source}数据失败`);
  }

  return result.data;
}
