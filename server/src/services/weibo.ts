/**
 * 微博热搜抓取服务
 *
 * 接口来源：https://weibo.com/ajax/side/hotSearch
 * 返回格式：JSON
 *
 * 注意事项：
 * - 使用移动端 User-Agent 降低反爬概率
 * - 需要设置 Referer 绕过验证
 * - 接口字段变更时需要更新解析逻辑
 */

// 微博热搜 API 地址
const WEIBO_API_URL = 'https://weibo.com/ajax/side/hotSearch';

// 移动端 User-Agent
const MOBILE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

// 请求头配置
const REQUEST_HEADERS = {
  'User-Agent': MOBILE_USER_AGENT,
  'Referer': 'https://weibo.com/',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

/**
 * 微博热搜条目
 */
interface WeiboHotItem {
  rank: number;
  title: string;
  heat: string | number;
  url: string;
}

/**
 * 微博 API 原始数据结构
 *
 * 关键字段说明：
 * - realtime: 热搜列表数组
 *   - rank: 排名（从0开始）
 *   - word: 热搜标题
 *   - num: 热度值（数字）
 *   - category: 分类标签（如"新","热","爆"）
 *   - link: 跳转链接（相对路径）
 */
interface WeiboApiResponse {
  data?: {
    realtime?: Array<{
      rank?: number;        // 排名
      word?: string;        // 热搜标题
      num?: number;         // 热度值
      category?: string;    // 分类
      link?: string;        // 链接
    }>;
  };
}

// 测试用：模拟失败开关（通过环境变量控制）
// 使用方式：MOCK_FAIL_WEIBO=1 npm run dev
const MOCK_FAIL = process.env.MOCK_FAIL_WEIBO === '1';

/**
 * 抓取微博热搜
 *
 * @returns 热搜列表 { rank, title, heat, url }[]
 * @throws 抓取失败时抛出错误
 */
export async function fetchWeiboHot(): Promise<WeiboHotItem[]> {
  // 测试用：模拟微博抓取失败
  if (MOCK_FAIL) {
    throw new Error('模拟微博API失败: 503 Service Unavailable (测试用)');
  }

  try {
    const response = await fetch(WEIBO_API_URL, {
      method: 'GET',
      headers: REQUEST_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as WeiboApiResponse;

    // 验证数据结构
    if (!result.data?.realtime || !Array.isArray(result.data.realtime)) {
      throw new Error('API 返回数据结构异常：缺少 realtime 数组');
    }

    // 解析数据
    // 字段映射：
    // - rank  → rank（排名，微博API从0开始，需要+1转为从1开始）
    // - word  → title（标题）
    // - num   → heat（热度值）
    // - link  → url（跳转链接）
    const items: WeiboHotItem[] = result.data.realtime
      .slice(0, 10) // 只取前 10 条
      .map((item, index) => {
        // 微博API rank 从0开始，需要+1以匹配前端样式（1,2,3名有特殊样式）
        const rank = item.rank !== undefined ? item.rank + 1 : index + 1;
        const title = item.word ?? '无标题';
        const heat = item.num ?? 0;

        // 构建完整 URL
        // link 字段是相对路径，如 "/weibo?q=xxx"，需要补全域名
        const url = item.link
          ? `https://s.weibo.com${item.link}`
          : `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`;

        return {
          rank,
          title,
          heat,
          url,
        };
      });

    return items;

  } catch (error) {
    // 包装错误信息，便于上层处理
    if (error instanceof Error) {
      throw new Error(`微博热搜抓取失败: ${error.message}`);
    }
    throw new Error('微博热搜抓取失败: 未知错误');
  }
}

/**
 * 测试函数（开发时使用）
 */
export async function testFetchWeibo(): Promise<void> {
  try {
    console.log('开始抓取微博热搜...');
    const items = await fetchWeiboHot();
    console.log(`成功获取 ${items.length} 条热搜`);
    console.log('前 3 条：', items.slice(0, 3));
  } catch (error) {
    console.error('抓取失败:', error);
  }
}

// 如果是直接运行此文件，执行测试
if (require.main === module) {
  testFetchWeibo();
}
