# 今日热搜 · 开发指令

**版本**: v1.0  
**关联文档**: PRD.md、TECH_DESIGN.md

---

## 1. 项目概述

**今日热搜** 是一个多平台热搜聚合网站，支持大模型智能数据分析。

- **前端**: React 18 + TypeScript 5 + Vite 5 + CSS Modules
- **后端**: Node.js 18 LTS + Express 4
- **部署**: Vercel(前端) + Railway(后端)
- **数据源**: 知乎热榜、B站热搜、微博热搜

### 1.1 核心功能

1. **平台热搜**: 三平台(知乎/B站/微博)热搜聚合展示，卡片网格布局
2. **数据分析**: 基于大模型(GLM-4-Flash)的智能分析对话，支持多主题并行

---

## 2. 技术栈

### 2.1 前端

| 技术 | 版本 | 用途 |
|-----|------|------|
| React | 18+ | UI框架，函数式组件+Hooks |
| TypeScript | 5+ | 类型安全 |
| Vite | 5+ | 构建工具，开发服务器 |
| CSS Modules | - | 组件级样式隔离 |

### 2.2 后端

| 技术 | 版本 | 用途 |
|-----|------|------|
| Node.js | 18 LTS | 运行时 |
| Express | 4+ | Web框架 |
| SQLite/better-sqlite3 | - | 本地数据库 |
| node-cron | - | 定时任务(抓取数据) |
| node-fetch/axios | - | HTTP客户端 |

---

## 3. 项目结构

```
vibe-conding-daka/
├── client/                    # 前端
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   ├── Header.tsx     # 顶部导航
│   │   │   ├── Tabs.tsx       # 标签页
│   │   │   ├── HotCard.tsx    # 热搜卡片
│   │   │   ├── HotList.tsx    # 热搜列表
│   │   │   ├── AnalysisCard.tsx  # 分析卡片
│   │   │   └── ChatPanel.tsx  # 聊天面板
│   │   ├── api/               # API封装
│   │   │   ├── hotsearch.ts
│   │   │   └── analyze.ts
│   │   ├── hooks/             # 自定义Hooks
│   │   │   ├── useBreakpoint.ts  # 响应式断点
│   │   │   ├── useKeyboard.ts   # 软键盘检测
│   │   │   └── useSwipe.ts      # 手势识别
│   │   ├── types/             # 类型定义
│   │   ├── styles/            # 全局样式
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html             # viewport配置
│   └── package.json
│
├── server/                    # 后端
│   ├── src/
│   │   ├── routes/
│   │   │   ├── hotsearch.ts   # 热搜路由
│   │   │   └── analyze.ts     # 分析路由
│   │   ├── services/
│   │   │   ├── fetcher/       # 数据抓取
│   │   │   │   ├── zhihu.ts
│   │   │   │   ├── bilibili.ts
│   │   │   │   └── weibo.ts
│   │   │   ├── cache.ts       # 缓存服务
│   │   │   └── llm.ts         # 大模型服务
│   │   ├── middleware/
│   │   │   ├── cors.ts        # 跨域
│   │   │   ├── rateLimit.ts   # 限流
│   │   │   └── errorHandler.ts
│   │   └── app.ts
│   ├── data/                  # SQLite数据库目录
│   ├── Dockerfile
│   ├── railway.json
│   └── package.json
│
└── docs/                      # 文档
    ├── PRD.md                 # 产品需求
    ├── TECH_DESIGN.md         # 技术设计
    └── AGENT.md               # 本文件
```

---

## 4. 开发规范

### 4.1 代码风格

- **组件名**: PascalCase (`HotCard.tsx`)
- **函数/变量**: camelCase (`fetchHotData`)
- **常量**: UPPER_SNAKE_CASE (`CACHE_TTL`)
- **类型/接口**: PascalCase + 后缀 (`HotItemProps`)

### 4.2 类型定义

必须与 TECH_DESIGN.md 保持一致：

```typescript
// types/index.ts
interface HotSearchItem {
  rank: number;
  title: string;
  url: string;
  heat?: number;
  platform: 'zhihu' | 'bilibili' | 'weibo';
  extra?: {
    answerCount?: number;
    viewCount?: number;
    playCount?: string;
    readCount?: string;
    discussCount?: string;
  };
  tag?: {
    name: string;
    color: string;
  };
}

interface HotPlatform {
  source: string;
  sourceName: string;
  listName: string;
  updatedAt: string;
  items: HotSearchItem[];
  error?: boolean;
  message?: string;
}
```

### 4.3 组件规范

- 使用函数式组件 + Hooks
- Props 必须定义类型接口
- 复杂逻辑抽离为自定义 Hooks

```typescript
// 示例：HotCard组件
interface HotCardProps {
  platform: HotPlatform;
  onRefresh?: () => void;
}

export function HotCard({ platform, onRefresh }: HotCardProps) {
  // 组件实现
}
```

### 4.4 样式规范

- 使用 CSS Modules，文件名 `Component.module.css`
- CSS 变量与 PRD 保持一致
- 移动端优先或响应式适配

```css
/* HotCard.module.css */
.card {
  background: var(--surface);
  border-radius: 10px;
  box-shadow: var(--shadow);
}

/* 移动端适配 */
@media (max-width: 560px) {
  .card {
    margin: 0 12px;
  }
}
```

---

## 5. API 接口

### 5.1 热搜接口

```typescript
// GET /api/hotsearch
// 获取全部平台数据
Response: {
  code: 0;
  data: {
    zhihu: HotPlatform;
    bilibili: HotPlatform;
    weibo: HotPlatform;
  }
}

// GET /api/hotsearch/:platform
// platform: zhihu | bilibili | weibo
Response: {
  code: 0;
  data: HotPlatform
}
```

### 5.2 分析接口

```typescript
// POST /api/analyze
// SSE流式输出
Body: {
  message: string;
  platform?: 'all' | 'zhihu' | 'bilibili' | 'weibo';
  keyword?: string;
  sessionId?: string;
}

// GET /api/health
// 健康检查
Response: { status: 'ok', timestamp: string }
```

---

## 6. 响应式设计

### 6.1 断点定义

| 设备 | 宽度 | 布局 |
|-----|------|------|
| 手机 | <560px | 单列，间距12px |
| 平板 | 560-1199px | 双列，间距16px |
| 桌面 | ≥1200px | 三列，间距16px |

### 6.2 移动端适配要点

1. **点击区域**: 最小44px高度
2. **字体适配**: 手机端适当增大（标题18px，正文14px）
3. **安全区**: iPhone刘海屏适配 `env(safe-area-inset-bottom)`
4. **软键盘**: 输入框固定底部，自动滚动
5. **手势**: 左右滑动切换标签页

### 6.3 Viewport配置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

---

## 7. 数据源接入

### 7.1 知乎

```typescript
const ZHIHU_API = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total';
// 需要 User-Agent
// 返回：回答数、浏览数
```

### 7.2 B站

```typescript
const BILIBILI_API = 'https://api.bilibili.com/x/web-interface/search/square';
// 需要 Referer: https://search.bilibili.com/
// 返回：播放量、热度标签
```

### 7.3 微博

```typescript
const WEIBO_API = 'https://weibo.com/ajax/side/hotSearch';
// 可能需要Cookie
// 返回：阅读数、讨论数
```

### 7.4 抓取规范

- 合理设置 User-Agent、Referer
- 缓存 TTL: 600秒（可通过环境变量覆盖）
- 失败重试: 指数退避3次
- 单平台失败不影响其他平台

---

## 8. 大模型集成

### 8.1 智谱AI接入

```typescript
import { ZhipuAI } from '@zhipuai/sdk';

const client = new ZhipuAI({
  apiKey: process.env.ZHIPU_API_KEY
});

// 使用模型: glm-4-flash (免费额度充足)
// 流式输出: 首字响应 ≤5秒
```

### 8.2 Prompt模板

```
你是一位数据分析助手。基于以下今日热搜数据，回答用户的问题。

【热搜数据】
{platform}平台共{count}条：
{formatted_data}

【用户问题】
{user_question}

请提供简洁、有洞察力的分析，每条观点控制在100字以内。
```

---

## 9. 环境变量

### 9.1 服务端 (.env)

```env
NODE_ENV=development
PORT=3000

# 大模型API（至少配置一个）
ZHIPU_API_KEY=your_key_here
# XINGHUO_API_KEY=
# QWEN_API_KEY=

# 缓存配置
CACHE_TTL=600
CACHE_TYPE=memory

# 数据库
DB_PATH=./data/hotsearch.db

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.vercel.app
```

### 9.2 客户端 (.env)

```env
VITE_API_BASE_URL=http://localhost:3000
# 生产环境: https://your-railway-app.up.railway.app
```

---

## 10. 部署要求

### 10.1 前端 (Vercel)

```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend.up.railway.app/api/$1" }
  ]
}
```

### 10.2 后端 (Railway)

- 使用 Dockerfile 容器部署
- 健康检查: /api/health
- 自动扩容: 根据流量调整实例数

---

## 11. 测试要求

### 11.1 功能测试

- [ ] 每完成一个平台，验证 ≥10 条数据正常显示
- [ ] 排名1-3视觉强调正确
- [ ] 点击跳转链接正确
- [ ] 更新时间显示正常

### 11.2 异常测试

- [ ] 单平台挂掉时其他平台仍正常显示
- [ ] 缓存降级策略生效（返回过期缓存+提示）
- [ ] 网络断开时显示友好错误

### 11.3 性能测试

- [ ] 10分钟内重复刷新不会疯狂打上游（验证缓存）
- [ ] 首屏加载 ≤3秒
- [ ] API响应 ≤1秒（命中缓存）
- [ ] 大模型首字响应 ≤5秒

### 11.4 移动端测试

- [ ] iPhone Safari 正常显示
- [ ] Android Chrome 正常显示
- [ ] 软键盘不遮挡输入框
- [ ] 下拉刷新生效
- [ ] 左右滑动切换标签

---

## 12. 注意事项

### 12.1 安全

- ❌ 禁止在前端直接 fetch 微博/知乎/B站原始域名
- ❌ 不要把敏感信息(API Key)提交到GitHub
- ✅ 所有上游请求通过后端中转
- ✅ CORS 严格限制允许的来源

### 12.2 合规

- 页脚注明：学习项目、非商用
- robots.txt 禁止搜索引擎收录
- 仅展示标题，不存储全文内容
- 点击跳转至原平台查看详情

### 12.3 性能

- 图片懒加载（如有）
- 列表虚拟滚动（如数据量大）
- 防抖节流处理频繁请求

---

## 13. 开发顺序建议

### Phase 1: 基础架构 (Day 1)
1. 项目初始化，配置TypeScript
2. 后端Express骨架
3. 前端Vite + React搭建

### Phase 2: 平台热搜 (Day 2-3)
1. 实现知乎抓取
2. 实现B站抓取
3. 实现微博抓取
4. 前端HotCard组件
5. 缓存机制

### Phase 3: 数据分析 (Day 4-5)
1. 智谱AI接入
2. SSE流式输出
3. AnalysisCard组件
4. 会话管理

### Phase 4: 优化完善 (Day 6)
1. 移动端适配
2. 错误处理
3. 性能优化

### Phase 5: 部署上线 (Day 7)
1. Vercel部署前端
2. Railway部署后端
3. 自定义域名（可选）

---

## 14. 参考文档

| 文档 | 内容 |
|-----|------|
| PRD.md | 产品需求、界面设计、非功能性需求 |
| TECH_DESIGN.md | 技术架构、数据模型、API详情、部署配置 |
