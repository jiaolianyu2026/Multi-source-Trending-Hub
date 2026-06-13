"use strict";
/**
 * 知乎热榜抓取服务
 *
 * 接口来源：https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total
 * 返回格式：JSON
 *
 * 注意事项：
 * - 需要设置 User-Agent 绕过反爬
 * - 接口字段变更时需要更新解析逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchZhihuHot = fetchZhihuHot;
exports.testFetchZhihu = testFetchZhihu;
// 知乎热榜 API 地址
const ZHIHU_API_URL = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total';
// 桌面端 User-Agent（知乎需要桌面端 UA）
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
// 从环境变量读取 Cookie，如果没有则使用空值（会导致401错误）
const ZHIHU_COOKIE = process.env.ZHIHU_COOKIE || '_zap=; d_c0=;';
// 测试用：模拟失败开关（通过环境变量控制）
// 使用方式：MOCK_FAIL_ZHIHU=1 npm run dev
const MOCK_FAIL = process.env.MOCK_FAIL_ZHIHU === '1';
// 请求头配置
const REQUEST_HEADERS = {
    'User-Agent': DESKTOP_USER_AGENT,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Referer': 'https://www.zhihu.com/',
    'Cookie': ZHIHU_COOKIE, // 从环境变量读取
};
/**
 * 抓取知乎热榜
 *
 * @returns 热搜列表，格式符合 TECH_DESIGN.md
 * @throws 抓取失败时抛出错误
 */
async function fetchZhihuHot() {
    // 测试用：模拟知乎抓取失败
    if (MOCK_FAIL) {
        throw new Error('模拟知乎API失败: 503 Service Unavailable (测试用)');
    }
    try {
        const response = await fetch(ZHIHU_API_URL, {
            method: 'GET',
            headers: REQUEST_HEADERS,
        });
        if (!response.ok) {
            throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        // 验证数据结构
        if (!result.data || !Array.isArray(result.data)) {
            throw new Error('API 返回数据结构异常：缺少 data 数组');
        }
        // 解析数据
        // 字段映射（与 TECH_DESIGN.md 一致）：
        // - index + 1           → rank（排名，从1开始）
        // - target.title        → title（标题）
        // - detail_text         → heat（解析热度数值）
        // - target.answer_count → extra.answerCount（回答数）
        // - target.view_count   → extra.viewCount（浏览数）
        const items = result.data
            .slice(0, 10) // 只取前 10 条
            .map((item, index) => {
            const rank = index + 1;
            const title = item.target?.title ?? '无标题';
            // 构建搜索URL（使用标题作为搜索关键词）
            // 这样无论内容类型是什么，都能跳转到相关页面
            const searchQuery = encodeURIComponent(title);
            const url = `https://www.zhihu.com/search?type=content&q=${searchQuery}`;
            // 解析热度数值
            // detail_text 格式: "1234 万热度" 或 "1234 热度"
            let heat;
            if (item.detail_text) {
                const match = item.detail_text.match(/(\d+(?:\.\d+)?)\s*万?/);
                if (match) {
                    heat = parseFloat(match[1]);
                    // 如果是 "万" 单位，转换为数字（保持原单位）
                    if (item.detail_text.includes('万')) {
                        heat = heat; // 保持万为单位
                    }
                }
            }
            // extra 字段（与 TECH_DESIGN.md 一致）
            const extra = {};
            if (item.target?.answer_count !== undefined) {
                extra.answerCount = item.target.answer_count;
            }
            if (item.target?.view_count !== undefined) {
                extra.viewCount = item.target.view_count;
            }
            return {
                rank,
                title,
                url,
                heat,
                platform: 'zhihu',
                extra: Object.keys(extra).length > 0 ? extra : undefined,
            };
        });
        return items;
    }
    catch (error) {
        // 包装错误信息，便于上层处理
        if (error instanceof Error) {
            throw new Error(`知乎热榜抓取失败: ${error.message}`);
        }
        throw new Error('知乎热榜抓取失败: 未知错误');
    }
}
/**
 * 测试函数（开发时使用）
 */
async function testFetchZhihu() {
    try {
        console.log('开始抓取知乎热榜...');
        const items = await fetchZhihuHot();
        console.log(`成功获取 ${items.length} 条热榜`);
        console.log('前 3 条：', items.slice(0, 3));
    }
    catch (error) {
        console.error('抓取失败:', error);
    }
}
// 如果是直接运行此文件，执行测试
if (require.main === module) {
    testFetchZhihu();
}
