/**
 * 格式化相对时间
 * 将日期转换为 "刚刚"、"5分钟前"、"2小时前"、"昨天"、"3天前" 等形式
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const targetDate = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();

  // 确保时间是过去的
  if (diffMs < 0) {
    return '刚刚';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 小于1分钟
  if (diffSeconds < 60) {
    return '刚刚';
  }

  // 小于1小时
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  // 小于24小时
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }

  // 昨天
  if (diffDays === 1) {
    return '昨天';
  }

  // 2-7天
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }

  // 超过7天，返回具体日期
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  // 如果是今年，不显示年份
  if (year === now.getFullYear()) {
    return `${month}月${day}日`;
  }

  return `${year}年${month}月${day}日`;
}

/**
 * 格式化绝对时间
 * 格式：2026-06-13 14:30:00
 */
export function formatAbsoluteTime(date: Date | string | number): string {
  const targetDate = date instanceof Date ? date : new Date(date);

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');
  const seconds = String(targetDate.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
