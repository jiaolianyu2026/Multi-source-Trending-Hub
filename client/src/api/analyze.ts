// import type { ChatMessage } from '../types/hot';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface AnalyzeRequest {
  message: string;
  platform?: 'all' | 'zhihu' | 'bilibili' | 'weibo';
  keyword?: string;
  sessionId?: string;
}

/**
 * 发送分析请求（SSE 流式输出）
 */
export async function* streamAnalyze(
  request: AnalyzeRequest
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('分析请求失败');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法读取响应流');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              yield parsed.content;
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 获取分析会话列表
 */
export async function fetchSessions() {
  const response = await fetch(`${API_BASE_URL}/api/analyze/sessions`);
  return response.json();
}

/**
 * 创建分析会话
 */
export async function createSession(name: string, systemPrompt: string, model?: string) {
  const response = await fetch(`${API_BASE_URL}/api/analyze/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, systemPrompt, model }),
  });
  return response.json();
}

/**
 * 删除分析会话
 */
export async function deleteSession(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/analyze/sessions/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
