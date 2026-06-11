# 迷你今日热榜 - 停止脚本

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   迷你今日热榜 - 停止脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 从 PID 文件读取进程ID并停止
if (Test-Path "$PSScriptRoot\backend.pid") {
    $backendId = Get-Content "$PSScriptRoot\backend.pid"
    Stop-Process -Id $backendId -Force -ErrorAction SilentlyContinue
    Remove-Item "$PSScriptRoot\backend.pid"
    Write-Host "  ✓ 后端服务已停止" -ForegroundColor Green
}

if (Test-Path "$PSScriptRoot\frontend.pid") {
    $frontendId = Get-Content "$PSScriptRoot\frontend.pid"
    Stop-Process -Id $frontendId -Force -ErrorAction SilentlyContinue
    Remove-Item "$PSScriptRoot\frontend.pid"
    Write-Host "  ✓ 前端服务已停止" -ForegroundColor Green
}

# 确保所有 node 进程都停止
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " 所有服务已停止!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

Start-Sleep -Seconds 2
