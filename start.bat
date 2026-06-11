@echo off
chcp 65001 >nul
echo ==========================================
echo   迷你今日热榜 - 启动脚本
echo ==========================================
echo.

:: 检查端口占用
echo [1/3] 检查端口...
netstat -ano | findstr :3001 >nul && (
    echo 端口 3001 被占用，尝试释放...
    taskkill /F /IM node.exe 2>nul
    timeout /t 2 >nul
)
netstat -ano | findstr :5173 >nul && (
    echo 端口 5173 被占用，尝试释放...
    taskkill /F /IM node.exe 2>nul
    timeout /t 2 >nul
)

echo.
echo [2/3] 启动服务...
echo.

:: 使用 concurrently 同时启动前后端
concurrently --names "后端,前端" --prefix-colors "blue,green" "cd server && npm run dev" "cd client && npm run dev"

echo.
echo ==========================================
echo 服务已停止
echo ==========================================
pause
