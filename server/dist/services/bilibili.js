"use strict";
/**
 * B站热搜抓取服务
 *
 * 接口来源：https://api.bilibili.com/x/web-interface/search/square
 * 返回格式：JSON
 *
 * 注意事项：
 * - 需要设置 Referer 绕过验证
 * - 接口字段变更时需要更新解析逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBilibiliHot = fetchBilibiliHot;
exports.testFetchBilibili = testFetchBilibili;
// B站热搜 API 地址
const BILIBILI_API_URL = 'https://api.bilibili.com/x/web-interface/search/square';
// 桌面端 User-Agent
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
// 请求头配置
const REQUEST_HEADERS = {
    'User-Agent': DESKTOP_USER_AGENT,
    'Referer': 'https://search.bilibili.com/',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
};
// 测试用：模拟失败开关（通过环境变量控制）
// 使用方式：MOCK_FAIL_BILIBILI=1 npm run dev
const MOCK_FAIL = process.env.MOCK_FAIL_BILIBILI === '1';
/**
 * 抓取B站热搜
 *
 * @returns 热搜列表 { rank, title, heat, url }[]
 * @throws 抓取失败时抛出错误
 */
async function fetchBilibiliHot() {
    // 测试用：模拟B站抓取失败
    if (MOCK_FAIL) {
        throw new Error('模拟B站API失败: 502 Bad Gateway (测试用)');
    }
    try {
        const response = await fetch(`${BILIBILI_API_URL}?limit=50`, {
            method: 'GET',
            headers: REQUEST_HEADERS,
        });
        if (!response.ok) {
            throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        // 验证数据结构
        if (!result.data?.trending?.list || !Array.isArray(result.data.trending.list)) {
            throw new Error('API 返回数据结构异常：缺少 trending.list 数组');
        }
        // 解析数据
        // 字段映射：
        // - index + 1      → rank（排名）
        // - show_name      → title（标题，优先使用）
        // - keyword        → title（备用）/ URL参数
        // - heat_score     → heat（热度数值）
        const items = result.data.trending.list
            .slice(0, 10) // 只取前 10 条
            .map((item, index) => {
            const rank = index + 1;
            // 优先使用 show_name，如果不存在则用 keyword
            const title = item.show_name?.trim() || item.keyword?.trim() || '无标题';
            // 使用热度数值
            const heat = item.heat_score ?? 0;
            // 构建完整 URL（使用 keyword 或 title 作为搜索词）
            const searchKeyword = item.keyword?.trim() || title;
            const url = `https://search.bilibili.com/all?keyword=${encodeURIComponent(searchKeyword)}`;
            return {
                rank,
                title,
                heat,
                url,
            };
        });
        return items;
    }
    catch (error) {
        // 包装错误信息，便于上层处理
        if (error instanceof Error) {
            throw new Error(`B站热搜抓取失败: ${error.message}`);
        }
        throw new Error('B站热搜抓取失败: 未知错误');
    }
}
/**
 * 测试函数（开发时使用）
 */
async function testFetchBilibili() {
    try {
        console.log('开始抓取B站热搜...');
        const items = await fetchBilibiliHot();
        console.log(`成功获取 ${items.length} 条热搜`);
        console.log('前 3 条：', items.slice(0, 3));
    }
    catch (error) {
        console.error('抓取失败:', error);
    }
}
// 如果是直接运行此文件，执行测试
if (require.main === module) {
    testFetchBilibili();
}
