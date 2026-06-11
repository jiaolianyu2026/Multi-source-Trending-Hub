# 迷你今日热榜 - PowerShell 启动脚本
# 支持后台运行和自动重启

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   迷你今日热榜 - 启动脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查并释放端口
Write-Host "[1/3] 检查端口占用..." -ForegroundColor Yellow
$ports = @(3001, 5173)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  端口 $port 被占用，正在释放..." -ForegroundColor Red
        Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "[2/3] 启动服务..." -ForegroundColor Yellow
Write-Host ""

# 启动后端
$backend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$PSScriptRoot\server" -WindowStyle Hidden -PassThru
Write-Host "  ✓ 后端服务已启动 (PID: $($backend.Id))" -ForegroundColor Green

Start-Sleep -Seconds 3

# 启动前端
$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$PSScriptRoot\client" -WindowStyle Hidden -PassThru
Write-Host "  ✓ 前端服务已启动 (PID: $($frontend.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " 服务已启动!" -ForegroundColor Green
Write-Host " 后端: http://localhost:3001" -ForegroundColor Blue
Write-Host " 前端: http://localhost:5173" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 关闭此窗口不会停止服务" -ForegroundColor Yellow
Write-Host "      使用 stop.ps1 停止服务" -ForegroundColor Yellow
Write-Host ""

# 保存 PID 到文件，方便停止
$backend.Id | Out-File -FilePath "$PSScriptRoot\backend.pid"
$frontend.Id | Out-File -FilePath "$PSScriptRoot\frontend.pid"

Write-Host "按 Enter 键隐藏此窗口..."
Read-Host
