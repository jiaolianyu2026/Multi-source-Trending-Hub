/**
 * 知乎热榜抓取服务（Puppeteer 版本）
 *
 * 使用无头浏览器绕过反爬，自动处理 Cookie
 * 安装依赖：npm install puppeteer
 */

import puppeteer from 'puppeteer';

interface ZhihuHotItem {
  rank: number;
  title: string;
  url: string;
  heat?: number;
  platform: 'zhihu';
  extra?: {
    answerCount?: number;
    viewCount?: number;
  };
}

/**
 * 使用 Puppeteer 抓取知乎热榜
 */
export async function fetchZhihuHotWithPuppeteer(): Promise<ZhihuHotItem[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 设置 User-Agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    // 访问知乎热榜页面
    await page.goto('https://www.zhihu.com/hot', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 等待热榜加载
    await page.waitForSelector('.HotList-item', { timeout: 10000 });

    // 提取数据
    const items = await page.evaluate(() => {
      const list = document.querySelectorAll('.HotList-item');
      return Array.from(list).slice(0, 50).map((item, index) => {
        const titleEl = item.querySelector('.HotList-itemTitle');
        const heatEl = item.querySelector('.HotList-itemMetrics');
        const linkEl = item.querySelector('a');

        const title = titleEl?.textContent?.trim() || '无标题';
        const heatText = heatEl?.textContent?.trim() || '0';
        const heat = parseInt(heatText.replace(/[^\d]/g, ''), 10) || 0;
        const url = linkEl?.href || `https://www.zhihu.com/search?q=${encodeURIComponent(title)}`;

        return {
          rank: index + 1,
          title,
          heat,
          url,
          platform: 'zhihu' as const,
        };
      });
    });

    return items;

  } finally {
    await browser.close();
  }
}

// 使用说明：
// 1. 安装依赖：npm install puppeteer
// 2. 修改 app.ts 中的 fetchZhihuHot() 调用改为 fetchZhihuHotWithPuppeteer()
// 3. 注意：Puppeteer 首次运行会下载 Chromium，约 100MB+
// 4. 生产环境需要配置 Chromium 路径或使用 puppeteer-core

export default fetchZhihuHotWithPuppeteer;
// TODO: 需要时取消注释使用 Puppeteer 方案
// import { fetchZhihuHotWithPuppeteer } from './services/zhihu-puppeteer';
// const items = await fetchZhihuHotWithPuppeteer();
// 注意：Puppeteer 需要额外安装依赖
