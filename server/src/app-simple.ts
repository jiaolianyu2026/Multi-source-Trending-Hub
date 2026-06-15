import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// 启用 CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// 解析 JSON
app.use(express.json());

// 最简单的健康检查
app.get('/api/health', (req, res) => {
  console.log('Health check received');
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ message: 'API is running', endpoints: ['/api/health'] });
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
