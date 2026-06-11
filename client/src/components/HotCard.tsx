import styles from './HotCard.module.css';
import type { HotCardProps, HotSearchItem } from '../types/hot';

// 平台配置（仅用于图标和颜色）
const PLATFORM_CONFIG: Record<string, { icon: string; color: string }> = {
  zhihu: { icon: '知', color: '#0084ff' },
  bilibili: { icon: 'B', color: '#fb7299' },
  weibo: { icon: '微', color: '#e6162d' },
};

// 排名颜色
function getRankColor(rank: number): string {
  if (rank === 1) return '#e6162d';
  if (rank === 2) return '#f97316';
  if (rank === 3) return '#eab308';
  return '#9ca3af';
}

// 格式化时间
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
  if (diff < 1) return '刚刚';
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
  return `${Math.floor(diff / 1440)}天前`;
}

// 骨架屏组件
function SkeletonItem() {
  return (
    <li className={styles.skeletonItem}>
      <div className={styles.skeletonRank} />
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonHeat} />
    </li>
  );
}

// 列表项组件
function ListItem({ item }: { item: HotSearchItem }) {
  const rankColor = getRankColor(item.rank);
  const isTop3 = item.rank <= 3;

  return (
    <li
      key={item.rank}
      className={`${styles.item} ${isTop3 ? styles[`top${item.rank}`] : ''}`}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        title={item.title}
      >
        <span
          className={`${styles.rank} ${isTop3 ? styles.rankTop : ''}`}
          style={{ color: rankColor }}
        >
          {item.rank}
        </span>
        <span className={styles.title}>{item.title}</span>
        {item.heat && (
          <span className={styles.heat}>
            {typeof item.heat === 'number'
              ? item.heat >= 10000
                ? `${(item.heat / 10000).toFixed(1)}万`
                : item.heat
              : item.heat}
          </span>
        )}
        {item.tag && (
          <span
            className={styles.tag}
            style={{
              backgroundColor: `${item.tag.color}20`,
              color: item.tag.color,
            }}
          >
            {item.tag.name}
          </span>
        )}
      </a>
    </li>
  );
}

export function HotCard({
  loading = false,
  error = false,
  message,
  data,
  onRetry,
}: HotCardProps) {
  const platform = data;
  const config = platform?.source
    ? PLATFORM_CONFIG[platform.source]
    : { icon: '?', color: '#999' };

  // Loading 状态 - 骨架屏
  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={`${styles.icon} ${styles.skeletonIcon}`} />
          <div className={styles.info}>
            <div className={`${styles.skeletonText} ${styles.skeletonName}`} />
          </div>
        </div>
        <ul className={styles.list}>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </ul>
        <div className={styles.footer}>
          <div className={`${styles.skeletonText} ${styles.skeletonFooter}`} />
        </div>
      </div>
    );
  }

  // Error 状态 - 错误提示
  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div
            className={styles.icon}
            style={{ backgroundColor: config.color }}
          >
            {config.icon}
          </div>
          <div className={styles.info}>
            <span className={styles.name}>
              {platform?.sourceName || '未知平台'}
            </span>
            <span className={styles.badge}>
              {platform?.listName || '热榜'}
            </span>
          </div>
        </div>
        <div className={styles.error}>
          <p className={styles.errorIcon}>⚠️</p>
          <p className={styles.errorMessage}>{message || '加载失败'}</p>
          {onRetry && (
            <button className={styles.retryBtn} onClick={onRetry}>
              点击重试
            </button>
          )}
        </div>
      </div>
    );
  }

  // Success 状态 - 正常列表
  if (!platform) {
    return null;
  }

  // 空数据状态
  const isEmpty = !platform.items || platform.items.length === 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon} style={{ backgroundColor: config.color }}>
          {config.icon}
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{platform.sourceName}</span>
          <span className={styles.badge}>{platform.listName}</span>
        </div>
      </div>

      {isEmpty ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📭</p>
          <p className={styles.emptyText}>暂无数据</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {platform.items.slice(0, 15).map((item) => (
            <ListItem key={item.rank} item={item} />
          ))}
        </ul>
      )}

      {/*
        注：缓存期内时间显示不变是正常现象
        - 后端缓存 TTL 默认为 600 秒（10 分钟）
        - 在缓存有效期内，updatedAt 保持不变
        - 如需刷新数据，可添加 ?refresh=1 查询参数
      */}
      <div className={styles.footer}>
        <span>更新于 {formatTime(platform.updatedAt)}</span>
      </div>
    </div>
  );
}
