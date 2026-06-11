/**
 * 热搜条目
 */
export interface HotSearchItem {
  rank: number;              // 排名
  title: string;             // 标题
  url: string;               // 跳转链接
  heat?: number | string;    // 热度值（可选）
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
export interface HotPlatform {
  source: string;            // zhihu | bilibili | weibo
  sourceName: string;        // "知乎"
  listName: string;          // "热榜"
  updatedAt: string;         // ISO8601
  items: HotSearchItem[];
  error?: boolean;           // 是否失败
  message?: string;          // 错误信息
}

/**
 * 所有平台数据
 */
export interface HotSearchData {
  zhihu: HotPlatform;
  bilibili: HotPlatform;
  weibo: HotPlatform;
}

/**
 * API 响应格式
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

/**
 * 分析会话
 */
export interface AnalysisSession {
  id: string;
  name: string;
  color: string;
  model: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * HotCard 组件 Props
 */
export interface HotCardProps {
  loading?: boolean;
  error?: boolean;
  message?: string;
  data?: HotPlatform;
  onRetry?: () => void;
}
