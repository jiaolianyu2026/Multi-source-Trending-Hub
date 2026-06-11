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

### 前端部署（Vercel）

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（如需要）

### 后端部署（Railway）

1. 推送代码到 GitHub
2. 在 Railway 导入项目
3. 配置环境变量

## 环境变量

### 客户端 (.env)
```env
# 开发环境无需配置，使用 Vite 代理
# 生产环境指向后端地址
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

### 服务端 (.env)
```env
PORT=3001
NODE_ENV=development
```

## 文档

- [产品需求文档 (PRD)](./PRD.md)
- [技术设计文档 (TECH_DESIGN)](./TECH_DESIGN.md)
- [开发指令 (CLAUDE)](./Claude.md)

## License

MIT - 技术学习项目，非商业用途
