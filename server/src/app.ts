import 'dotenv/config'; // 加载 .env 文件
import express from 'express';
import cors from 'cors';
import { getCache, setCache } from './utils/cache';
import { fetchWeiboHot } from './services/weibo';
import { fetchZhihuHot } from './services/zhihu';
import { fetchBilibiliHot } from './services/bilibili';

// 调试：检查环境变量是否加载
console.log('[debug] ZHIHU_COOKIE loaded:', process.env.ZHIHU_COOKIE ? 'YES (长度:' + process.env.ZHIHU_COOKIE.length + ')' : 'NO');

const app = express();
const PORT = 3001;

// 配置 CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',  // 开发端口
  'http://localhost:4173',  // 生产预览端口
];

app.use(cors({
  origin: (origin, callback) => {
    // 允许无来源的请求（如 curl）
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] 拒绝来源: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// ===== 路由 =====

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
// 支持 ?refresh=1 强制刷新所有平台缓存
app.get('/api/hot', async (req, res) => {
  const { refresh } = req.query;
  const isRefresh = refresh === '1';

  // 并行获取三个平台数据，互不影响
  // 传递 isRefresh 参数控制是否跳过缓存
  const [zhihuData, bilibiliData, weiboData] = await Promise.all([
    fetchZhihuData(isRefresh),  // 知乎
    fetchBilibiliData(isRefresh), // B站
    fetchWeiboData(isRefresh),   // 微博
  ]);

  // 设置浏览器缓存头
  if (!isRefresh) {
    res.set('Cache-Control', 'max-age=120');
  } else {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  res.json({
    code: 0,
    data: {
      platforms: [zhihuData, bilibiliData, weiboData]
    }
  });
});

/**
 * 获取知乎数据（独立错误处理）
 * @param skipCache - 是否跳过缓存强制刷新
 */
async function fetchZhihuData(skipCache = false) {
  const cacheKey = 'hot:zhihu';

  // 未强制刷新时，先查缓存
  if (!skipCache) {
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('[cache hit] zhihu (all platforms)');
      return cached;
    }
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
 * @param skipCache - 是否跳过缓存强制刷新
 */
async function fetchBilibiliData(skipCache = false) {
  const cacheKey = 'hot:bilibili';

  // 未强制刷新时，先查缓存
  if (!skipCache) {
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('[cache hit] bilibili (all platforms)');
      return cached;
    }
  }

  try {
    console.log('[fetch] bilibili hot search from api (all platforms)');
    const items = await fetchBilibiliHot();
    const data = {
      source: 'bilibili',
      sourceName: 'B站',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items: items.map(item => ({
        rank: item.rank,
        title: item.title,
        url: item.url,
        heat: item.heat,
        platform: 'bilibili',
      })),
    };
    setCache(cacheKey, data);
    console.log('[cache set] bilibili (all platforms)');
    return data;
  } catch (error) {
    console.error('[fetch error] bilibili:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      source: 'bilibili',
      sourceName: 'B站',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      error: true,
      items: [],
      message: `获取B站热搜失败: ${errorMessage}`,
    };
  }
}

/**
 * 获取微博数据（独立错误处理）
 * @param skipCache - 是否跳过缓存强制刷新
 */
async function fetchWeiboData(skipCache = false) {
  const cacheKey = 'hot:weibo';

  // 未强制刷新时，先查缓存
  if (!skipCache) {
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('[cache hit] weibo (all platforms)');
      return cached;
    }
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

  // B站使用真实数据抓取
  if (source === 'bilibili') {
    return await handleBilibiliRequest(req, res);
  }

  // 未知平台，返回404
  return res.status(404).json({
    code: 404,
    message: `平台不存在: ${source}`
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

/**
 * 处理B站热搜请求（真实数据 + 缓存）
 * 返回格式符合 TECH_DESIGN.md
 */
async function handleBilibiliRequest(req: express.Request, res: express.Response) {
  const { refresh } = req.query;
  const cacheKey = 'hot:bilibili';
  const isRefresh = refresh === '1';

  // 检查是否强制刷新
  if (!isRefresh) {
    // 先查缓存
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('[cache hit] bilibili');
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
    console.log('[fetch] bilibili hot search from api');
    const items = await fetchBilibiliHot();

    // 构造响应数据（符合 TECH_DESIGN.md 格式）
    const data = {
      source: 'bilibili',
      sourceName: 'B站',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items: items.map(item => ({
        rank: item.rank,
        title: item.title,
        url: item.url,
        heat: item.heat,
        platform: 'bilibili'
      }))
    };

    // 写入缓存
    setCache(cacheKey, data);
    console.log('[cache set] bilibili');

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
    console.error('[fetch error] bilibili:', error);

    const errorMessage = error instanceof Error ? error.message : '未知错误';

    res.json({
      code: 0,
      data: {
        source: 'bilibili',
        sourceName: 'B站',
        listName: '热搜榜',
        updatedAt: new Date().toISOString(),
        error: true,
        items: [],
        message: `获取B站热搜失败: ${errorMessage}`
      }
    });
  }
}

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
