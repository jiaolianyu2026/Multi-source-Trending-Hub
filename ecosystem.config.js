/**
 * PM2 配置文件
 * 用于守护前后端服务，防止进程退出
 *
 * 常用命令：
 * - pm2 start ecosystem.config.js     启动所有服务
 * - pm2 stop ecosystem.config.js      停止所有服务
 * - pm2 restart ecosystem.config.js   重启所有服务
 * - pm2 delete ecosystem.config.js    删除所有服务
 * - pm2 status                        查看状态
 * - pm2 logs                          查看日志
 * - pm2 startup                       设置开机自启
 * - pm2 save                          保存当前配置
 */

module.exports = {
  apps: [
    {
      name: 'mini-hot-hub-backend',  // 后端服务
      cwd: './server',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      // 自动重启配置
      autorestart: true,        // 崩溃后自动重启
      max_restarts: 10,         // 最大重启次数
      min_uptime: '10s',        // 最小运行时间
      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 资源限制
      max_memory_restart: '500M',
      // 监控配置
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'mini-hot-hub-frontend',  // 前端服务
      cwd: './client',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development'
      },
      // 自动重启配置
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 资源限制
      max_memory_restart: '500M',
      // 监控配置
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
