# 迷你今日热榜

多平台热搜聚合网站，支持知乎、B站、微博热搜一站式浏览。

## 技术栈

- **前端**: React 18 + TypeScript 5 + Vite 5
- **后端**: Node.js 18 + Express 4 + TypeScript
- **部署**: Vercel(前端) + Railway(后端)

## 项目结构

```
mini-hot-hub/
├── client/          # 前端项目
│   ├── src/
│   │   ├── api/     # API 请求封装
│   │   ├── components/  # 组件
│   │   ├── hooks/   # 自定义 Hooks
│   │   ├── pages/   # 页面
│   │   └── types/   # 类型定义
│   └── package.json
├── server/          # 后端项目
│   ├── src/
│   │   └── app.ts   # 应用入口
│   └── package.json
├── docs/            # 文档
│   ├── PRD.md       # 产品需求文档
│   └── TECH_DESIGN.md   # 技术设计文档
└── README.md        # 本文件
```

## 快速开始

### 1. 安装依赖

**前端依赖安装：**
```bash
cd client
npm install
```

**后端依赖安装：**
```bash
cd server
npm install
```

**或使用并行安装（Windows PowerShell）：**
```powershell
Start-Process powershell -ArgumentList "cd client; npm install" -Wait; Start-Process powershell -ArgumentList "cd server; npm install" -Wait
```

### 2. 启动服务

**方式一：分别启动（推荐开发使用）**

终端 1 - 启动后端：
```bash
cd server
npm run dev
# 服务运行在 http://localhost:3001
```

终端 2 - 启动前端：
```bash
cd client
npm run dev
# 服务运行在 http://localhost:5173
```

**方式二：同时启动（Windows）**

使用 `concurrently`（需先安装）：
```bash
npm install -g concurrently

# 在项目根目录执行
concurrently "cd server && npm run dev" "cd client && npm run dev"
```

或使用 PowerShell 后台任务：
```powershell
# 启动后端（后台）
$backend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "./server" -PassThru

# 启动前端
Set-Location ./client
npm run dev

# 退出时关闭后端
Stop-Process -Id $backend.Id
```

### 3. 访问应用

打开浏览器访问：**http://localhost:5173**

## API 接口

| 接口 | 说明 |
|------|------|
| `GET /api/health` | 健康检查 |
| `GET /api/hot` | 获取所有平台数据 |
| `GET /api/hot/zhihu` | 知乎热榜 |
| `GET /api/hot/bilibili` | B站热搜 |
| `GET /api/hot/weibo` | 微博热搜 |

## 常见问题

### 1. 端口占用错误 (EADDRINUSE)

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方法：**

Windows 查找并结束进程：
```powershell
# 查找占用 3001 端口的进程
netstat -ano | findstr :3001

# 结束进程（PID 为上面的最后一列数字）
taskkill /PID <PID> /F

# 或强制结束所有 node 进程
taskkill /F /IM node.exe
```

macOS/Linux：
```bash
# 查找并结束进程
lsof -ti:3001 | xargs kill -9

# 或结束所有 node 进程
killall -9 node
```

### 2. Vite 代理不生效

**现象：** 前端无法访问后端 API，提示跨域错误或 404

**检查步骤：**

1. **确认后端服务已启动**
   ```bash
   curl http://localhost:3001/api/health
   # 应返回 { "ok": true }
   ```

2. **检查 vite.config.ts 代理配置**
   ```typescript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:3001',
         changeOrigin: true,
       },
     },
   }
   ```

3. **确认 API 调用路径**
   ```typescript
   // 正确：使用相对路径，让代理处理
   fetch('/api/hot')
   
   // 错误：直接使用完整 URL，会跳过代理
   fetch('http://localhost:3001/api/hot')
   ```

4. **重启前端服务**
   
   修改 vite.config.ts 后需要重启：`Ctrl+C` 后重新运行 `npm run dev`

5. **检查浏览器缓存**
   
   尝试强制刷新：`Ctrl+F5` 或 `Ctrl+Shift+R`

### 3. TypeScript 类型错误

**解决方法：**
```bash
# 客户端
cd client
npm run build

# 服务端
cd server
npm run build
```

### 4. 依赖安装失败

**解决方法：**
```bash
# 清除缓存后重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 或使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

## 开发规范

- 组件使用 PascalCase 命名（如 `HotCard.tsx`）
- 样式使用 CSS Modules（如 `HotCard.module.css`）
- API 请求封装在 `api/` 目录
- 类型定义统一在 `types/` 目录

## 部署

### 📋 部署前准备

#### 1. 知乎 Cookie 获取（必需）

知乎热榜需要有效的 Cookie 才能抓取数据：

1. 浏览器打开 https://www.zhihu.com 并登录
2. 按 `F12` 打开开发者工具 → Network 标签
3. 刷新页面，点击任意请求
4. 复制请求头中的 Cookie 值（包含 `_zap`, `d_c0`, `z_c0`）

#### 2. 代码推送

```bash
# 确保代码已提交并推送到 GitHub
git add .
git commit -m "准备部署"
git push origin main
```

---

### 🚀 后端部署（Railway）

#### 方式一：一键部署（推荐）

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/xxx)

#### 方式二：手动部署

1. **注册 Railway**: https://railway.app

2. **创建项目**:
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置环境变量**:
   ```
   Settings → Variables → New Variable
   ```
   
   添加以下变量：
   ```
   ZHIHU_COOKIE=_zap=xxx; d_c0=xxx; z_c0=xxx
   PORT=3000
   NODE_ENV=production
   CACHE_TTL=120
   ```

4. **部署**:
   - Railway 会自动检测 `railway.json` 并部署
   - 等待部署完成，获取域名（如 `xxx.up.railway.app`）

5. **验证部署**:
   ```bash
   curl https://xxx.up.railway.app/api/health
   # 应返回 {"ok":true}
   ```

---

### 🐳 后端部署（Docker）

#### 使用 Dockerfile 部署

```bash
cd server

# 构建镜像
docker build -t mini-hot-hub-server .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e ZHIHU_COOKIE="your_cookie_here" \
  -e PORT=3000 \
  -e NODE_ENV=production \
  --name hot-hub-server \
  mini-hot-hub-server

# 查看日志
docker logs -f hot-hub-server
```

#### Docker Compose（多服务）

```yaml
# docker-compose.yml
version: '3.8'
services:
  server:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - ZHIHU_COOKIE=${ZHIHU_COOKIE}
      - PORT=3000
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health')"]
      interval: 30s
      timeout: 3s
      retries: 3
```

运行：
```bash
docker-compose up -d
```

---

### ☁️ 后端部署（VPS/云服务器）

以 Ubuntu 为例：

```bash
# 1. 连接服务器
ssh root@your-server-ip

# 2. 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 克隆代码
git clone https://github.com/yourname/mini-hot-hub.git
cd mini-hot-hub/server

# 4. 安装依赖
npm ci --production

# 5. 构建
npm run build

# 6. 配置环境变量
export ZHIHU_COOKIE="your_cookie_here"
export PORT=3000
export NODE_ENV=production

# 7. 启动（使用 PM2 守护进程）
npm install -g pm2
pm2 start dist/app.js --name "hot-hub-server"
pm2 startup
pm2 save

# 8. 配置 Nginx 反向代理（可选）
# /etc/nginx/sites-available/hot-hub
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 🌐 前端部署（Vercel）

#### 方式一：一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourname/mini-hot-hub)

#### 方式二：手动部署

1. **注册 Vercel**: https://vercel.com

2. **导入项目**:
   - 点击 "Add New Project"
   - 选择 GitHub 仓库
   - Framework Preset 选择 "Vite"

3. **配置环境变量**:
   ```
   Settings → Environment Variables
   ```
   
   添加：
   ```
   VITE_API_BASE_URL=https://your-backend.up.railway.app
   ```

4. **配置根目录**:
   ```
   Settings → General → Root Directory
   ```
   设置为 `client`

5. **部署**:
   - 点击 "Deploy"
   - 等待构建完成

---

### 🔧 环境变量详解

#### 服务端 (.env)

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `ZHIHU_COOKIE` | ✅ | - | 知乎登录 Cookie，用于抓取热榜 |
| `PORT` | ❌ | 3000 | 服务端口 |
| `NODE_ENV` | ❌ | development | 运行环境 |
| `CACHE_TTL` | ❌ | 120 | 缓存时间（秒） |
| `ALLOWED_ORIGINS` | ❌ | * | CORS 允许的域名 |

#### 测试用变量（开发环境）

| 变量名 | 作用 |
|--------|------|
| `MOCK_FAIL_ZHIHU=1` | 模拟知乎抓取失败 |
| `MOCK_FAIL_BILIBILI=1` | 模拟B站抓取失败 |
| `MOCK_FAIL_WEIBO=1` | 模拟微博抓取失败 |

#### 客户端 (.env)

| 变量名 | 开发环境 | 生产环境 |
|--------|----------|----------|
| `VITE_API_BASE_URL` | `/api`（使用代理） | `https://your-backend.up.railway.app` |

---

### ✅ 部署验证清单

#### 后端验证

```bash
# 1. 健康检查
curl https://your-backend.up.railway.app/api/health
# 期望: {"ok":true}

# 2. 单平台接口
curl https://your-backend.up.railway.app/api/hot/zhihu
curl https://your-backend.up.railway.app/api/hot/bilibili
curl https://your-backend.up.railway.app/api/hot/weibo

# 3. 聚合接口
curl https://your-backend.up.railway.app/api/hot

# 4. CORS 测试（从前端域名）
# 打开浏览器控制台，确认无跨域错误
```

#### 前端验证

- [ ] 页面正常加载
- [ ] 三个平台卡片显示
- [ ] 热搜数据正常（各10条）
- [ ] 点击热搜能跳转
- [ ] 刷新按钮可用
- [ ] 移动端布局正常

---

### 🐛 常见问题

#### 1. Railway 部署失败

**检查日志**:
```
Railway Dashboard → Deployments → View Logs
```

**常见问题**:
- 缺少 `ZHIHU_COOKIE` → 添加环境变量
- TypeScript 编译错误 → 检查 `npm run build`

#### 2. Vercel 前端无法访问后端

**检查 CORS**:
- 确保后端 `ALLOWED_ORIGINS` 包含前端域名
- 或使用 `ALLOWED_ORIGINS=*`（开发测试）

**检查 API 地址**:
- 确认 `VITE_API_BASE_URL` 指向正确后端
- 注意：开发用 `/api`，生产用完整 URL

#### 3. 知乎热榜返回空数据

**Cookie 过期**:
- 重新获取知乎 Cookie
- 更新 Railway 环境变量
- Redeploy 服务

---

### 📚 部署架构图

```
┌─────────────────────────────────────────────────────────┐
│                        用户                              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  前端 (Vercel)            │  后端 (Railway)              │
│  ┌──────────────┐        │  ┌─────────────────────┐    │
│  │  React App   │◄───────┼──┤  Express Server     │    │
│  │  :443        │  HTTPS │  │  :3000              │    │
│  └──────────────┘        │  └─────────────────────┘    │
│         │                │         │                    │
│         │                │    ┌────┴────┐               │
│         │                │    │  Cache  │               │
│         │                │    │ Memory  │               │
│         │                │    └────┬────┘               │
│         │                │         │                    │
│         │                │    ┌────┴────┐               │
│         │                │    │ Fetcher │               │
│         │                │    │ -知乎   │               │
│         │                │    │ -B站    │               │
│         │                │    │ -微博   │               │
│         │                │    └────┬────┘               │
│         │                │         │                    │
│         │                └─────────┼────────────────────┘
│         │                          │
│         │              ┌───────────┼───────────┐
│         │              ▼           ▼           ▼
│         │         ┌────────┐  ┌────────┐  ┌────────┐
│         │         │ 知乎    │  │ B站    │  │ 微博   │
│         │         │ API    │  │ API    │  │ API    │
│         │         └────────┘  └────────┘  └────────┘
│         │
└─────────┼───────────────────────────────────────────────┘
          │
          ▼
   ┌─────────────┐
   │  GitHub     │
   │  (源码)     │
   └─────────────┘
```

### 快速部署命令速查

```bash
# Railway CLI
railway login
railway link
railary variables set ZHIHU_COOKIE="xxx"
railway up

# Vercel CLI
vercel login
vercel --prod

# Docker
docker-compose up -d
```

## 文档

- [产品需求文档 (PRD)](./PRD.md)
- [技术设计文档 (TECH_DESIGN)](./TECH_DESIGN.md)
- [开发指令 (CLAUDE)](./Claude.md)

## License

MIT - 技术学习项目，非商业用途
