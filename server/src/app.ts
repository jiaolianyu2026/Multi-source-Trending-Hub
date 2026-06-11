import 'dotenv/config'; // 加载 .env 文件
import express from 'express';
import cors from 'cors';
import { getCache, setCache } from './utils/cache';
import { fetchWeiboHot } from './services/weibo';
import { fetchZhihuHot } from './services/zhihu';

// 调试：检查环境变量是否加载
console.log('[debug] ZHIHU_COOKIE loaded:', process.env.ZHIHU_COOKIE ? 'YES (长度:' + process.env.ZHIHU_COOKIE.length + ')' : 'NO');

const app = express();
const PORT = 3001;

// 配置 CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 解析 JSON
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ===== Mock 数据生成函数 =====

// 知乎数据生成器
function createZhihuData() {
  return {
    source: 'zhihu',
    sourceName: '知乎',
    listName: '热榜',
    updatedAt: new Date().toISOString(),
    items: [
      {
        rank: 1,
        title: '如何看待2026年高考改革新方案？',
        url: 'https://www.zhihu.com/question/12345678',
        heat: 2845,
        platform: 'zhihu',
        extra: { answerCount: 3421, viewCount: 12500000 },
        tag: { name: '教育', color: '#10b981' }
      },
      {
        rank: 2,
        title: '为什么说人工智能正在重塑软件行业？',
        url: 'https://www.zhihu.com/question/12345679',
        heat: 2156,
        platform: 'zhihu',
        extra: { answerCount: 892, viewCount: 5600000 },
        tag: { name: 'AI', color: '#8b5cf6' }
      },
      {
        rank: 3,
        title: '现在的年轻人为什么不结婚了？',
        url: 'https://www.zhihu.com/question/12345680',
        heat: 1892,
        platform: 'zhihu',
        extra: { answerCount: 5234, viewCount: 18900000 },
        tag: { name: '社会', color: '#f59e0b' }
      },
      {
        rank: 4,
        title: '特斯拉新款Model 3值得买吗？',
        url: 'https://www.zhihu.com/question/12345681',
        heat: 1456,
        platform: 'zhihu',
        extra: { answerCount: 567, viewCount: 3200000 }
      },
      {
        rank: 5,
        title: '如何评价《原神》新版本剧情？',
        url: 'https://www.zhihu.com/question/12345682',
        heat: 1234,
        platform: 'zhihu',
        extra: { answerCount: 1892, viewCount: 4500000 },
        tag: { name: '游戏', color: '#ec4899' }
      },
      {
        rank: 6,
        title: '有哪些值得推荐的编程学习资源？',
        url: 'https://www.zhihu.com/question/12345683',
        heat: 987,
        platform: 'zhihu',
        extra: { answerCount: 234, viewCount: 1200000 }
      },
      {
        rank: 7,
        title: '大熊猫为什么是中国的国宝？',
        url: 'https://www.zhihu.com/question/12345684',
        heat: 876,
        platform: 'zhihu',
        extra: { answerCount: 445, viewCount: 2100000 }
      },
      {
        rank: 8,
        title: '如何评价2026年股市走势？',
        url: 'https://www.zhihu.com/question/12345685',
        heat: 765,
        platform: 'zhihu',
        extra: { answerCount: 678, viewCount: 2800000 },
        tag: { name: '金融', color: '#f59e0b' }
      },
      {
        rank: 9,
        title: '有哪些好用的效率工具推荐？',
        url: 'https://www.zhihu.com/question/12345686',
        heat: 654,
        platform: 'zhihu',
        extra: { answerCount: 123, viewCount: 890000 }
      },
      {
        rank: 10,
        title: '为什么现在的电影越来越不好看？',
        url: 'https://www.zhihu.com/question/12345687',
        heat: 543,
        platform: 'zhihu',
        extra: { answerCount: 890, viewCount: 3400000 }
      }
    ]
  };
}

// B站数据生成器
function createBilibiliData() {
  return {
    source: 'bilibili',
    sourceName: 'B站',
    listName: '热搜榜',
    updatedAt: new Date().toISOString(),
    items: [
      {
        rank: 1,
        title: '2026年夏季新番导视',
        url: 'https://search.bilibili.com/all?keyword=2026%E5%B9%B4%E5%A4%8F%E5%AD%A3%E6%96%B0%E7%95%AA%E5%AF%BC%E8%A7%86',
        heat: '486.2万',
        platform: 'bilibili',
        extra: { playCount: '486.2万' },
        tag: { name: '新番', color: '#fb7299' }
      },
      {
        rank: 2,
        title: '某科学的超电磁炮第四季制作决定',
        url: 'https://search.bilibili.com/all?keyword=%E6%9F%90%E7%A7%91%E5%AD%A6%E7%9A%84%E8%B6%85%E7%94%B5%E7%A3%81%E7%82%AE%E7%AC%AC%E5%9B%9B%E5%AD%A3',
        heat: '352.1万',
        platform: 'bilibili',
        extra: { playCount: '352.1万' }
      },
      {
        rank: 3,
        title: '【原神】纳塔版本全角色攻略',
        url: 'https://search.bilibili.com/all?keyword=%E5%8E%9F%E7%A5%9E%E7%BA%B3%E5%A1%94%E6%94%BB%E7%95%A5',
        heat: '298.5万',
        platform: 'bilibili',
        extra: { playCount: '298.5万' },
        tag: { name: '游戏', color: '#ec4899' }
      },
      {
        rank: 4,
        title: 'AI绘画入门到精通全套教程',
        url: 'https://search.bilibili.com/all?keyword=AI%E7%BB%98%E7%94%BB%E6%95%99%E7%A8%8B',
        heat: '245.8万',
        platform: 'bilibili',
        extra: { playCount: '245.8万' },
        tag: { name: 'AI', color: '#8b5cf6' }
      },
      {
        rank: 5,
        title: '何同学最新科技评测',
        url: 'https://search.bilibili.com/all?keyword=%E4%BD%95%E5%90%8C%E5%AD%A6%E7%A7%91%E6%8A%80%E8%AF%84%E6%B5%8B',
        heat: '198.3万',
        platform: 'bilibili',
        extra: { playCount: '198.3万' },
        tag: { name: '数码', color: '#3b82f6' }
      },
      {
        rank: 6,
        title: '【鬼畜】2026年全明星rap',
        url: 'https://search.bilibili.com/all?keyword=2026%E5%85%A8%E6%98%8E%E6%98%9Frap',
        heat: '176.2万',
        platform: 'bilibili',
        extra: { playCount: '176.2万' }
      },
      {
        rank: 7,
        title: '崩坏：星穹铁道2.7版本前瞻',
        url: 'https://search.bilibili.com/all?keyword=%E5%B4%A9%E5%9D%8F%E6%98%9F%E7%A9%B9%E9%93%81%E9%81%932.7',
        heat: '154.7万',
        platform: 'bilibili',
        extra: { playCount: '154.7万' }
      },
      {
        rank: 8,
        title: '【罗翔】刑法修正案深度解读',
        url: 'https://search.bilibili.com/all?keyword=%E7%BD%97%E7%BF%94%E5%88%91%E6%B3%95%E4%BF%AE%E6%AD%A3%E6%A1%88',
        heat: '132.4万',
        platform: 'bilibili',
        extra: { playCount: '132.4万' }
      },
      {
        rank: 9,
        title: '中国航天最新发射任务回顾',
        url: 'https://search.bilibili.com/all?keyword=%E4%B8%AD%E5%9B%BD%E8%88%AA%E5%A4%A9%E6%9C%80%E6%96%B0%E5%8F%91%E5%B0%84',
        heat: '108.9万',
        platform: 'bilibili',
        extra: { playCount: '108.9万' },
        tag: { name: '科技', color: '#06b6d4' }
      },
      {
        rank: 10,
        title: '【美食】探店全国最火火锅店',
        url: 'https://search.bilibili.com/all?keyword=%E6%8E%A2%E5%BA%97%E6%9C%80%E7%81%AB%E7%81%AB%E9%94%85%E5%BA%97',
        heat: '95.6万',
        platform: 'bilibili',
        extra: { playCount: '95.6万' }
      }
    ]
  };
}

// 微博数据生成器
function createWeiboData() {
  return {
    source: 'weibo',
    sourceName: '微博',
    listName: '热搜榜',
    updatedAt: new Date().toISOString(),
    items: [
      {
        rank: 1,
        title: '端午假期出行指南',
        url: 'https://s.weibo.com/weibo?q=%E7%AB%AF%E5%8D%88%E5%81%87%E6%9C%9F%E5%87%BA%E8%A1%8C%E6%8C%87%E5%8D%97',
        heat: 6543210,
        platform: 'weibo',
        extra: { readCount: '12.5亿', discussCount: '89.2万' },
        tag: { name: '热', color: '#e6162d' }
      },
      {
        rank: 2,
        title: '某顶流明星官宣恋情',
        url: 'https://s.weibo.com/weibo?q=%E9%A1%B6%E6%B5%81%E6%98%8E%E6%98%9F%E5%AE%98%E5%AE%A3%E6%81%8B%E6%83%85',
        heat: 5890765,
        platform: 'weibo',
        extra: { readCount: '8.9亿', discussCount: '156.3万' },
        tag: { name: '爆', color: '#e6162d' }
      },
      {
        rank: 3,
        title: 'A股三大指数全线上涨',
        url: 'https://s.weibo.com/weibo?q=A%E8%82%A1%E4%B8%89%E5%A4%A7%E6%8C%87%E6%95%B0%E4%B8%8A%E6%B6%A8',
        heat: 4521876,
        platform: 'weibo',
        extra: { readCount: '5.2亿', discussCount: '45.6万' },
        tag: { name: '金融', color: '#f59e0b' }
      },
      {
        rank: 4,
        title: '国产大模型再突破',
        url: 'https://s.weibo.com/weibo?q=%E5%9B%BD%E4%BA%A7%E5%A4%A7%E6%A8%A1%E5%9E%8B%E5%86%8D%E7%AA%81%E7%A0%B4',
        heat: 3897654,
        platform: 'weibo',
        extra: { readCount: '3.8亿', discussCount: '28.9万' },
        tag: { name: 'AI', color: '#8b5cf6' }
      },
      {
        rank: 5,
        title: '全国多地高温预警',
        url: 'https://s.weibo.com/weibo?q=%E5%85%A8%E5%9B%BD%E5%A4%9A%E5%9C%B0%E9%AB%98%E6%B8%A9%E9%A2%84%E8%AD%A6',
        heat: 3254891,
        platform: 'weibo',
        extra: { readCount: '4.1亿', discussCount: '32.1万' }
      },
      {
        rank: 6,
        title: 'iPhone 17外观曝光',
        url: 'https://s.weibo.com/weibo?q=iPhone17%E5%A4%96%E8%A7%82%E6%9B%9D%E5%85%89',
        heat: 2876543,
        platform: 'weibo',
        extra: { readCount: '2.9亿', discussCount: '18.7万' },
        tag: { name: '数码', color: '#3b82f6' }
      },
      {
        rank: 7,
        title: '高考倒计时10天',
        url: 'https://s.weibo.com/weibo?q=%E9%AB%98%E8%80%83%E5%80%92%E8%AE%A1%E6%97%B610%E5%A4%A9',
        heat: 2456789,
        platform: 'weibo',
        extra: { readCount: '3.5亿', discussCount: '67.8万' }
      },
      {
        rank: 8,
        title: '迪丽热巴新剧定档',
        url: 'https://s.weibo.com/weibo?q=%E8%BF%AA%E4%B8%BD%E7%83%AD%E5%B7%B4%E6%96%B0%E5%89%A7%E5%AE%9A%E6%A1%A3',
        heat: 2134567,
        platform: 'weibo',
        extra: { readCount: '2.1亿', discussCount: '23.4万' },
        tag: { name: '剧集', color: '#ec4899' }
      },
      {
        rank: 9,
        title: '国足世预赛关键战',
        url: 'https://s.weibo.com/weibo?q=%E5%9B%BD%E8%B6%B3%E4%B8%96%E9%A2%84%E8%B5%9B%E5%85%B3%E9%94%AE%E6%88%98',
        heat: 1876543,
        platform: 'weibo',
        extra: { readCount: '1.8亿', discussCount: '56.7万' },
        tag: { name: '体育', color: '#10b981' }
      },
      {
        rank: 10,
        title: '周杰伦新专辑销量破纪录',
        url: 'https://s.weibo.com/weibo?q=%E5%91%A8%E6%9D%B0%E4%BC%A6%E6%96%B0%E4%B8%93%E8%BE%91%E9%94%80%E9%87%8F',
        heat: 1567890,
        platform: 'weibo',
        extra: { readCount: '1.5亿', discussCount: '31.2万' },
        tag: { name: '音乐', color: '#f59e0b' }
      }
    ]
  };
}

// 数据生成器映射
const platformGenerators: Record<string, () => ReturnType<typeof createZhihuData>> = {
  zhihu: createZhihuData,
  bilibili: createBilibiliData,
  weibo: createWeiboData
};

// ===== 路由 =====

// 根路由 - API 说明
app.get('/', (_req, res) => {
  res.json({
    name: '今日热搜 API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health - 健康检查',
      hot: 'GET /api/hot - 所有平台',
      zhihu: 'GET /api/hot/zhihu - 知乎热榜',
      bilibili: 'GET /api/hot/bilibili - B站热搜',
      weibo: 'GET /api/hot/weibo - 微博热搜'
    }
  });
});

// 健康检查接口
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// 获取所有平台数据
// 每个平台独立抓取，互不影响。失败的平台返回 error: true，成功的平台正常返回
app.get('/api/hot', async (_req, res) => {
  // 并行获取三个平台数据，互不影响
  const [zhihuData, bilibiliData, weiboData] = await Promise.all([
    fetchZhihuData(),  // 知乎
    fetchBilibiliData(), // B站
    fetchWeiboData(),   // 微博
  ]);

  res.json({
    code: 0,
    data: {
      platforms: [zhihuData, bilibiliData, weiboData]
    }
  });
});

/**
 * 获取知乎数据（独立错误处理）
 */
async function fetchZhihuData() {
  const cacheKey = 'hot:zhihu';
  const cached = getCache(cacheKey);

  if (cached) {
    console.log('[cache hit] zhihu (all platforms)');
    return cached;
  }

  try {
    console.log('[fetch] zhihu hot search from api (all platforms)');
    const items = await fetchZhihuHot();
    const data = {
      source: 'zhihu',
      sourceName: '知乎',
      listName: '热榜',
      updatedAt: new Date().toISOString(),
      items: items.map(item => ({
        rank: item.rank,
        title: item.title,
        url: item.url,
        heat: item.heat,
        platform: 'zhihu',
        extra: item.extra,
      })),
    };
    setCache(cacheKey, data);
    console.log('[cache set] zhihu (all platforms)');
    return data;
  } catch (error) {
    console.error('[fetch error] zhihu:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      source: 'zhihu',
      sourceName: '知乎',
      listName: '热榜',
      updatedAt: new Date().toISOString(),
      error: true,
      items: [],
      message: `获取知乎热榜失败: ${errorMessage}`,
    };
  }
}

/**
 * 获取B站数据（独立错误处理）
 */
async function fetchBilibiliData() {
  // B站目前使用 Mock 数据，直接返回
  return createBilibiliData();
}

/**
 * 获取微博数据（独立错误处理）
 */
async function fetchWeiboData() {
  const cacheKey = 'hot:weibo';
  const cached = getCache(cacheKey);

  if (cached) {
    console.log('[cache hit] weibo (all platforms)');
    return cached;
  }

  try {
    console.log('[fetch] weibo hot search from api (all platforms)');
    const items = await fetchWeiboHot();
    const data = {
      source: 'weibo',
      sourceName: '微博',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items: items.map(item => ({
        rank: item.rank,
        title: item.title,
        heat: item.heat,
        url: item.url,
        platform: 'weibo',
      })),
    };
    setCache(cacheKey, data);
    console.log('[cache set] weibo (all platforms)');
    return data;
  } catch (error) {
    console.error('[fetch error] weibo:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      source: 'weibo',
      sourceName: '微博',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      error: true,
      items: [],
      message: `获取微博热搜失败: ${errorMessage}`,
    };
  }
}

// 获取指定平台数据（带缓存）
app.get('/api/hot/:source', async (req, res) => {
  const { source } = req.params;
  const { refresh } = req.query;

  // 微博使用真实数据抓取
  if (source === 'weibo') {
    return await handleWeiboRequest(req, res);
  }

  // 知乎使用真实数据抓取
  if (source === 'zhihu') {
    return await handleZhihuRequest(req, res);
  }

  // B站使用 Mock 数据
  const generator = platformGenerators[source];
  if (!generator) {
    return res.status(404).json({
      code: 404,
      message: `平台不存在: ${source}`
    });
  }

  const cacheKey = `hot:${source}`;
  const isRefresh = refresh === '1';

  // 检查是否强制刷新（?refresh=1）
  if (!isRefresh) {
    // 先查缓存
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[cache hit] ${source}`);
      res.set('Cache-Control', 'max-age=120');
      return res.json({
        code: 0,
        data: cached,
        cached: true
      });
    }
  }

  // 缓存未命中或强制刷新，生成新数据
  const data = generator();

  // 写入服务器缓存
  setCache(cacheKey, data);
  console.log(`[cache set] ${source}`);

  // 设置浏览器缓存头
  if (!isRefresh) {
    res.set('Cache-Control', 'max-age=120');
  } else {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  res.json({
    code: 0,
    data,
    cached: false
  });
});

/**
 * 处理微博热搜请求（真实数据 + 缓存）
 */
async function handleWeiboRequest(req: express.Request, res: express.Response) {
  const { refresh } = req.query;
  const cacheKey = 'hot:weibo';
  const isRefresh = refresh === '1';

  // 检查是否强制刷新
  if (!isRefresh) {
    // 先查缓存
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('[cache hit] weibo');
      res.set('Cache-Control', 'max-age=120');
      return res.json({
        code: 0,
        data: cached,
        cached: true
      });
    }
  }

  try {
    // 抓取真实数据
    console.log('[fetch] weibo hot search from api');
    const items = await fetchWeiboHot();

    // 构造响应数据
    const data = {
      source: 'weibo',
      sourceName: '微博',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items: items.map(item => ({
        rank: item.rank,
        title: item.title,
        heat: item.heat,
        url: item.url,
        platform: 'weibo'
      }))
    };

    // 写入缓存
    setCache(cacheKey, data);
    console.log('[cache set] weibo');

    // 设置浏览器缓存头
    if (!isRefresh) {
      res.set('Cache-Control', 'max-age=120');
    } else {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    res.json({
      code: 0,
      data,
      cached: false
    });

  } catch (error) {
    // 抓取失败，返回错误状态
    console.error('[fetch error] weibo:', error);

    const errorMessage = error instanceof Error ? error.message : '未知错误';

    res.json({
      code: 0,
      data: {
        source: 'weibo',
        sourceName: '微博',
        listName: '热搜榜',
        updatedAt: new Date().toISOString(),
        error: true,
        items: [],
        message: `获取微博热搜失败: ${errorMessage}`
      }
    });
  }
}

/**
 * 处理知乎热榜请求（真实数据 + 缓存）
 * 返回格式符合 TECH_DESIGN.md
 */
async function handleZhihuRequest(req: express.Request, res: express.Response) {
  const { refresh } = req.query;
  const cacheKey = 'hot:zhihu';
  const isRefresh = refresh === '1';

  // 检查是否强制刷新
  if (!isRefresh) {
    // 先查缓存
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('[cache hit] zhihu');
      res.set('Cache-Control', 'max-age=120');
      return res.json({
        code: 0,
        data: cached,
        cached: true
      });
    }
  }

  try {
    // 抓取真实数据
    console.log('[fetch] zhihu hot search from api');
    const items = await fetchZhihuHot();

    // 构造响应数据（符合 TECH_DESIGN.md 格式）
    const data = {
      source: 'zhihu',
      sourceName: '知乎',
      listName: '热榜',
      updatedAt: new Date().toISOString(),
      items: items.map(item => ({
        rank: item.rank,
        title: item.title,
        url: item.url,
        heat: item.heat,
        platform: 'zhihu',
        extra: item.extra
      }))
    };

    // 写入缓存
    setCache(cacheKey, data);
    console.log('[cache set] zhihu');

    // 设置浏览器缓存头
    if (!isRefresh) {
      res.set('Cache-Control', 'max-age=120');
    } else {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    res.json({
      code: 0,
      data,
      cached: false
    });

  } catch (error) {
    // 抓取失败，返回错误状态
    console.error('[fetch error] zhihu:', error);

    const errorMessage = error instanceof Error ? error.message : '未知错误';

    res.json({
      code: 0,
      data: {
        source: 'zhihu',
        sourceName: '知乎',
        listName: '热榜',
        updatedAt: new Date().toISOString(),
        error: true,
        items: [],
        message: `获取知乎热榜失败: ${errorMessage}`
      }
    });
  }
}

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
