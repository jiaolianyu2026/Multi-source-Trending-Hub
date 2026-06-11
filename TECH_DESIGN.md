# 今日热搜 · 技术设计文档

**版本**: v1.0  
**日期**: 2026-05-28  
**关联文档**: PRD.md

---

## 1. 技术栈

### 1.1 整体架构

| 层级 | 技术选型 | 版本 | 说明 |
|-----|---------|------|------|
| **前端** | React + TypeScript + Vite | React 18+ | 响应式UI，组件化开发 |
| **后端** | Node.js + Express | Node 18+ LTS | API服务、数据抓取、缓存管理 |
| **数据库** | SQLite / PostgreSQL | - | 单机SQLite，云端PostgreSQL |
| **缓存** | 内存 Map / Redis | - | 本地内存，云端可选Redis |
| **部署** | Vercel + Railway | - | 前端Vercel，后端Railway |

### 1.2 前端技术细节

- **框架**: React 18 + TypeScript 5
- **构建工具**: Vite 5
- **样式方案**: CSS Modules + CSS Variables
- **HTTP客户端**: Axios
- **状态管理**: React Context + useReducer

### 1.3 移动端响应式实现

#### 1.3.1 CSS Media Queries 配置

```css
/* styles/breakpoints.css */
:root {
  /* 断点定义 */
  --breakpoint-mobile: 560px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1200px;
}

/* 手机端 */
@media (max-width: 560px) {
  :root {
    --header-height: 56px;
    --tab-height: 48px;
    --page-padding: 12px;
    --card-gap: 12px;
    --font-size-title: 18px;
    --font-size-body: 14px;
    --font-size-small: 11px;
  }
}

/* 平板端 */
@media (min-width: 561px) and (max-width: 1199px) {
  :root {
    --page-padding: 16px;
    --card-gap: 16px;
    --font-size-title: 19px;
    --font-size-body: 14px;
    --font-size-small: 11px;
  }
}

/* 桌面端 */
@media (min-width: 1200px) {
  :root {
    --page-padding: 20px;
    --card-gap: 16px;
    --font-size-title: 20px;
    --font-size-body: 13.5px;
    --font-size-small: 11px;
  }
}
```

#### 1.3.2 React Hooks 实现响应式

```typescript
// hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 560) {
        setBreakpoint('mobile');
      } else if (width < 1200) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return breakpoint;
}

// 使用示例
function HotCard() {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  
  return (
    <div className={isMobile ? styles.cardMobile : styles.card}>
      {/* 内容 */}
    </div>
  );
}
```

#### 1.3.3 弹性布局组件

```typescript
// components/Grid/Grid.tsx
import styles from './Grid.module.css';

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

export function Grid({ children, className }: GridProps) {
  return <div className={`${styles.grid} ${className || ''}`}>{children}</div>;
}

// Grid.module.css
.grid {
  display: grid;
  gap: var(--card-gap, 16px);
  grid-template-columns: repeat(3, 1fr);  /* 桌面3列 */
}

@media (max-width: 1199px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);  /* 平板2列 */
  }
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;  /* 手机单列 */
  }
}
```

#### 1.3.4 软键盘适配

```typescript
// hooks/useKeyboard.ts
import { useState, useEffect } from 'react';

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const screenHeight = window.screen.height;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile && height < screenHeight * 0.8) {
        setIsKeyboardOpen(true);
        setKeyboardHeight(screenHeight - height);
      } else {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { keyboardHeight, isKeyboardOpen };
}
```

#### 1.3.5 触摸手势支持

```typescript
// hooks/useSwipe.ts
import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }: SwipeHandlers) {
  const touchStart = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // 垂直滑动
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return { onTouchStart, onTouchEnd };
}

// 使用示例：标签页切换
function Tabs({ activeTab, onChangeTab }: { activeTab: string, onChangeTab: (tab: string) => void }) {
  const tabs = ['platform', 'analysis'];
  const currentIndex = tabs.indexOf(activeTab);
  
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (currentIndex < tabs.length - 1) {
        onChangeTab(tabs[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        onChangeTab(tabs[currentIndex - 1]);
      }
    }
  });

  return <div {...swipeHandlers}>{/* tabs内容 */}</div>;
}
```

#### 1.3.6 Viewport 配置

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">

<!-- PWA 配置 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#ffffff">
```

### 1.4 后端技术细节

- **运行时**: Node.js 18+ LTS
- **Web框架**: Express 4
- **数据库ORM**: Prisma / better-sqlite3
- **HTTP客户端**: node-fetch / axios
- **任务调度**: node-cron

---

## 2. 项目结构

```
vibe-conding-daka/
├── client/                          # 前端项目
│   ├── public/
│   ├── src/
│   │   ├── components/              # 组件
│   │   │   ├── Header.tsx           # 顶部导航
│   │   │   ├── Tabs.tsx             # 标签页
│   │   │   ├── HotCard.tsx          # 热搜卡片
│   │   │   ├── HotList.tsx          # 热搜列表
│   │   │   ├── AnalysisCard.tsx     # 分析卡片
│   │   │   └── ChatPanel.tsx        # 聊天面板
│   │   ├── api/                     # API接口
│   │   │   ├── hotsearch.ts         # 热搜API
│   │   │   └── analyze.ts           # 分析API
│   │   ├── types/                   # 类型定义
│   │   │   └── index.ts             # HotItem, HotPlatform
│   │   ├── hooks/                   # 自定义Hooks
│   │   ├── utils/                   # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                          # 后端项目
│   ├── src/
│   │   ├── routes/                  # 路由
│   │   │   ├── hotsearch.ts         # 热搜路由
│   │   │   └── analyze.ts           # 分析路由
│   │   ├── services/                # 服务层
│   │   │   ├── fetcher/             # 数据抓取
│   │   │   │   ├── zhihu.ts         # 知乎抓取
│   │   │   │   ├── bilibili.ts      # B站抓取
│   │   │   │   └── weibo.ts         # 微博抓取
│   │   │   ├── cache.ts             # 缓存服务
│   │   │   └── llm.ts               # 大模型服务
│   │   ├── middleware/              # 中间件
│   │   │   ├── cors.ts              # 跨域
│   │   │   ├── rateLimit.ts         # 限流
│   │   │   └── errorHandler.ts      # 错误处理
│   │   ├── utils/                   # 工具函数
│   │   ├── config/                  # 配置文件
│   │   ├── prisma/                  # 数据库Schema（如使用PostgreSQL）
│   │   └── app.ts                   # 应用入口
│   ├── Dockerfile                   # Railway部署
│   ├── railway.json                 # Railway配置
│   ├── package.json
│   └── tsconfig.json
│
├── doc/                             # 文档
│   ├── PRD.md                       # 产品需求文档
│   ├── TECH_DESIGN.md               # 本文件
│   └── RESEARCH.md                  # 需求研究
│
└── README.md
```

---

## 3. 数据模型

### 3.1 核心类型定义

```typescript
// types/index.ts

/**
 * 热搜条目
 */
interface HotSearchItem {
  rank: number;              // 排名
  title: string;             // 标题
  url: string;               // 跳转链接
  heat?: number;             // 热度值（可选）
  platform: 'zhihu' | 'bilibili' | 'weibo';
  extra?: {
    answerCount?: number;    // 知乎：回答数
    viewCount?: number;      // 知乎：浏览数
    playCount?: string;      // B站：播放量
    readCount?: string;      // 微博：阅读数
    discussCount?: string;   // 微博：讨论数
  };
  tag?: {                    // 内容标签
    name: string;            // 标签名："AI"、"金融"、"国际"
    color: string;           // 标签颜色："#8b5cf6"
  };
}

/**
 * 平台响应
 */
interface HotPlatform {
  source: string;            // zhihu | bilibili | weibo
  sourceName: string;        // "知乎"
  listName: string;          // "热榜"
  updatedAt: string;         // ISO8601
  items: HotSearchItem[];
  error?: boolean;           // 是否失败
  message?: string;          // 错误信息
}

/**
 * 分析会话
 */
interface AnalysisSession {
  id: string;
  name: string;
  color: string;
  systemPrompt: string;
  model: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 聊天消息
 */
interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}
```

### 3.2 数据库Schema（SQLite/PostgreSQL）

```sql
-- 分析会话表
CREATE TABLE analysis_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  system_prompt TEXT,
  model TEXT DEFAULT 'glm-4-flash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 聊天消息表
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES analysis_sessions(id) ON DELETE CASCADE
);

-- 缓存记录表（可选，用于持久化缓存）
CREATE TABLE cache_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_messages_session ON chat_messages(session_id, created_at);
```

---

## 4. API接口设计

### 4.1 热搜接口

```typescript
// GET /api/hotsearch
// 获取全部平台数据
Response: {
  code: 0,
  data: {
    zhihu: HotPlatform;
    bilibili: HotPlatform;
    weibo: HotPlatform;
  }
}

// GET /api/hotsearch/:platform
// 获取单个平台数据
Params: platform: 'zhihu' | 'bilibili' | 'weibo'
Response: {
  code: 0,
  data: HotPlatform
}
Error: {
  code: -1,
  message: "获取失败，使用缓存数据",
  data: HotPlatform  // 缓存数据
}
```

### 4.2 分析接口

```typescript
// POST /api/analyze
// AI分析对话（SSE流式输出）
Body: {
  message: string;
  platform?: 'all' | 'zhihu' | 'bilibili' | 'weibo';
  keyword?: string;
  sessionId?: string;  // 会话ID，保持上下文
}
Response: SSE Stream

// GET /api/analyze/sessions
// 获取分析会话列表
Response: {
  code: 0,
  data: AnalysisSession[]
}

// POST /api/analyze/sessions
// 创建分析会话
Body: {
  name: string;
  systemPrompt: string;
  model?: string;
}
Response: {
  code: 0,
  data: AnalysisSession
}

// DELETE /api/analyze/sessions/:id
// 删除分析会话
Response: {
  code: 0
}
```

### 4.3 健康检查

```typescript
// GET /api/health
Response: {
  status: 'ok',
  timestamp: string,
  version: string
}
```

---

## 5. 系统架构

### 5.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              Vercel CDN                             │
│                         (前端静态资源托管)                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ API 请求
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Railway 容器服务                              │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      Express Server                             ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐ ││
│  │  │ /api/hot  │  │/api/analyze│  │ /health   │  │  限流/错误    │ ││
│  │  │  热搜路由  │  │ 分析路由   │  │ 健康检查   │  │   中间件     │ ││
│  │  └─────┬─────┘  └─────┬─────┘  └───────────┘  └──────────────┘ ││
│  └────────┼──────────────┼─────────────────────────────────────────┘│
│           │              │                                          │
│  ┌────────▼──────────────▼──────────────────────────────────────┐   │
│  │                      服务层 (Services)                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │  Zhihu     │  │  Bilibili   │  │       Weibo         │   │   │
│  │  │  抓取服务   │  │  抓取服务    │  │      抓取服务        │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │   │
│  │  │   Cache    │  │     LLM     │  │   Analysis Session  │   │   │
│  │  │   缓存     │  │   大模型     │  │      分析会话        │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────────┘   │
│           │              │              │                           │
│  ┌────────▼──────────────▼──────────────▼──────────────────────┐   │
│  │                        数据层                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐   │   │
│  │  │   SQLite/       │  │      外部API                    │   │   │
│  │  │   PostgreSQL    │  │  ┌───────┐ ┌───────┐ ┌───────┐ │   │   │
│  │  │   数据库        │  │  │知乎API│ │B站API │ │微博API│ │   │   │
│  │  └─────────────────┘  │  └───┬───┘ └───┬───┘ └───┬───┘ │   │   │
│  │                       └──────┼─────────┼─────────┼─────┘   │   │
│  │                              │         │         │          │   │
│  └──────────────────────────────┼─────────┼─────────┼──────────┘   │
│                                 │         │         │              │
└─────────────────────────────────┼─────────┼─────────┼──────────────┘
                                  │         │         │
                                  ▼         ▼         ▼
                            ┌─────────┐ ┌─────────┐ ┌─────────┐
                            │ 知乎热榜 │ │ B站热搜 │ │ 微博热搜 │
                            └─────────┘ └─────────┘ └─────────┘
```

### 5.2 数据流

```
1. 用户打开首页
   │
   ▼
2. 前端请求 GET /api/hotsearch
   │
   ▼
3. 后端检查缓存
   ├─ 缓存命中 → 直接返回
   └─ 缓存未命中 → 继续
         │
         ▼
4. 并行抓取三个平台
   ├─ fetch 知乎热榜
   ├─ fetch B站热搜
   └─ fetch 微博热搜
         │
         ▼
5. 解析并统一格式
         │
         ▼
6. 写入缓存（TTL 600秒）
         │
         ▼
7. 返回前端
         │
         ▼
8. 前端渲染三个 HotCard
```

### 5.3 缓存策略

```typescript
// 缓存键格式
const CACHE_KEYS = {
  ZHIHU: 'hotsearch:zhihu:${date}',
  BILIBILI: 'hotsearch:bilibili:${date}',
  WEIBO: 'hotsearch:weibo:${date}',
};

// 缓存配置
const CACHE_CONFIG = {
  TTL: 600,              // 10分钟
  CHECK_PERIOD: 60,      // 1分钟检查过期
  MAX_KEYS: 100,         // 最大缓存键数
};

// 降级策略
async function fetchWithFallback(platform: string): Promise<HotPlatform> {
  try {
    // 1. 尝试实时抓取
    const data = await fetchPlatform(platform);
    cache.set(platform, data, CACHE_CONFIG.TTL);
    return data;
  } catch (error) {
    // 2. 抓取失败，返回缓存（即使已过期）
    const cached = cache.get(platform);
    if (cached) {
      return { ...cached, error: true, message: '使用缓存数据' };
    }
    // 3. 无缓存，返回错误
    throw error;
  }
}
```

---

## 6. 数据源接入

### 6.1 知乎热榜

```typescript
// services/fetcher/zhihu.ts
const ZHIHU_API = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total';

async function fetchZhihu(): Promise<HotPlatform> {
  const response = await fetch(ZHIHU_API, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const data = await response.json();
  
  return {
    source: 'zhihu',
    sourceName: '知乎',
    listName: '热榜',
    updatedAt: new Date().toISOString(),
    items: data.data.map((item: any, index: number) => ({
      rank: index + 1,
      title: item.target.title,
      url: `https://www.zhihu.com/question/${item.target.id}`,
      heat: item.detail_text.replace(' 万热度', ''),
      platform: 'zhihu',
      extra: {
        answerCount: item.target.answer_count,
        viewCount: item.target.view_count
      }
    }))
  };
}
```

### 6.2 B站热搜

```typescript
// services/fetcher/bilibili.ts
const BILIBILI_API = 'https://api.bilibili.com/x/web-interface/search/square';

async function fetchBilibili(): Promise<HotPlatform> {
  const response = await fetch(`${BILIBILI_API}?limit=50`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://search.bilibili.com/'
    }
  });
  const data = await response.json();
  
  return {
    source: 'bilibili',
    sourceName: 'B站',
    listName: '热搜榜',
    updatedAt: new Date().toISOString(),
    items: data.data.trending.list.map((item: any, index: number) => ({
      rank: index + 1,
      title: item.keyword,
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(item.keyword)}`,
      heat: item.show_name,
      platform: 'bilibili',
      tag: item.icon ? { name: item.icon, color: '#fb7299' } : undefined
    }))
  };
}
```

### 6.3 微博热搜

```typescript
// services/fetcher/weibo.ts
const WEIBO_API = 'https://weibo.com/ajax/side/hotSearch';

async function fetchWeibo(): Promise<HotPlatform> {
  const response = await fetch(WEIBO_API, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Cookie': 'SUB=_2Ak...'  // 可能需要Cookie
    }
  });
  const data = await response.json();
  
  return {
    source: 'weibo',
    sourceName: '微博',
    listName: '热搜榜',
    updatedAt: new Date().toISOString(),
    items: data.data.realtime.slice(0, 50).map((item: any, index: number) => ({
      rank: index + 1,
      title: item.word,
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word)}`,
      heat: item.raw_hot,
      platform: 'weibo',
      tag: item.category ? { name: item.category, color: getTagColor(item.category) } : undefined,
      extra: {
        readCount: item.read_count,
        discussCount: item.discuss_count
      }
    }))
  };
}
```

---

## 7. 大模型集成

### 7.1 智谱AI接入

```typescript
// services/llm.ts
import { ZhipuAI } from '@zhipuai/sdk';

const client = new ZhipuAI({
  apiKey: process.env.ZHIPU_API_KEY
});

async function analyzeHotTopics(
  messages: ChatMessage[],
  hotData: HotSearchItem[],
  onStream: (chunk: string) => void
): Promise<void> {
  const prompt = buildPrompt(hotData);
  
  const stream = await client.chat.completions.create({
    model: 'glm-4-flash',
    messages: [
      { role: 'system', content: prompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ],
    stream: true
  });
  
  for await (const chunk of stream) {
    onStream(chunk.choices[0]?.delta?.content || '');
  }
}

function buildPrompt(hotData: HotSearchItem[]): string {
  const formatted = hotData.map(item => 
    `${item.rank}. ${item.title} (${item.heat || '无热度'})`
  ).join('\n');
  
  return `你是一位数据分析助手。基于以下今日热搜数据，回答用户的问题。

【热搜数据】
共${hotData.length}条：
${formatted}

请提供简洁、有洞察力的分析，每条观点控制在100字以内。`;
}
```

### 7.2 流式响应处理

```typescript
// routes/analyze.ts
router.post('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const { message, sessionId } = req.body;
  const session = await getSession(sessionId);
  const hotData = await getCachedHotData();
  
  await analyzeHotTopics(
    session.messages,
    hotData,
    (chunk) => {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }
  );
  
  res.write('data: [DONE]\n\n');
  res.end();
});
```

---

## 8. 部署方案

### 8.1 推荐方案：Vercel + Railway

#### 8.1.1 成本预估

| 组件 | 服务商 | 免费额度 | 超出费用 |
|-----|--------|---------|---------|
| 前端托管 | Vercel | 100GB带宽/月 | $0.40/GB |
| 后端服务 | Railway | $5/月额度 | 按量计费 |
| 数据库 | Railway PostgreSQL | 500MB存储 | 升级计划 |
| 大模型API | 智谱AI | 免费额度 | - |
| 域名 | 自定义 | - | ~30元/年 |
| **合计** | | **约$5/月（35元）** | |

#### 8.1.2 前端部署（Vercel）

```json
// client/vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-railway-app.up.railway.app/api/$1"
    }
  ]
}
```

#### 8.1.3 后端部署（Railway）

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```json
// server/railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE" },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 8.2 备选方案：单服务器部署

| 组件 | 推荐方案 | 预估成本 |
|-----|---------|---------|
| 应用服务器 | 腾讯云轻量服务器 2核2G | ~50元/月 |
| 数据库 | SQLite | 0元 |
| 缓存 | 内存缓存 | 0元 |
| 域名 + SSL | Let's Encrypt | ~30元/年 |
| **合计** | | **~80元/月** |

### 8.3 本地部署

适用于开发测试，详见 PRD.md 第8.3节。

---

## 9. 开发规范

### 9.1 代码规范

- **ESLint**: 使用 `@typescript-eslint/recommended`
- **Prettier**: 统一代码格式化
- **Git Commit**: 使用 Conventional Commits 规范

### 9.2 目录命名

- 组件目录: PascalCase (`components/HotCard/`)
- 工具目录: camelCase (`utils/cache.ts`)
- 常量目录: UPPER_SNAKE_CASE (`constants/ENV.ts`)

### 9.3 接口规范

- 统一返回格式: `{ code: number, data: any, message?: string }`
- HTTP状态码: 200成功, 400参数错误, 500服务端错误
- 错误处理: 统一错误中间件，记录日志

---

## 10. 附录

### 10.1 环境变量清单

```env
# 服务端
NODE_ENV=production
PORT=3000
ZHIPU_API_KEY=your_key_here
DATABASE_URL=sqlite:./data/hotsearch.db
CACHE_TTL=600
ALLOWED_ORIGINS=https://your-domain.vercel.app

# 客户端
VITE_API_BASE_URL=https://your-railway-app.up.railway.app
```

### 10.2 参考资料

- PRD.md - 产品需求文档
- RESEARCH.md - 需求研究文档
- 智谱AI API文档: https://open.bigmodel.cn/
