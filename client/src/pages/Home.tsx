import { useHotList } from '../hooks/useHotList';
import { HotCard } from '../components/HotCard';
import styles from './Home.module.css';

export function Home() {
  const { data, loading, error, message, refetch } = useHotList();

  return (
    <div className={styles.container}>
      {/* 顶栏 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <span className={styles.logo}>🔥</span>
            <h1 className={styles.title}>迷你今日热榜</h1>
          </div>
          <p className={styles.subtitle}>一站式浏览知乎、B站、微博热门话题</p>
        </div>
      </header>

      {/* 主区域 */}
      <main className={styles.main}>
        {loading ? (
          // 整体 Loading 状态
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>加载中...</p>
          </div>
        ) : error ? (
          // 整体 Error 状态
          <div className={styles.errorContainer}>
            <p className={styles.errorIcon}>⚠️</p>
            <p className={styles.errorText}>{message || '加载失败'}</p>
            <button className={styles.retryBtn} onClick={refetch}>
              点击重试
            </button>
          </div>
        ) : (
          // 成功状态 - 显示卡片网格
          <div className={styles.grid}>
            {data.map((platform) => (
              <HotCard
                key={platform.source}
                loading={false}
                error={platform.error}
                message={platform.message}
                data={platform}
              />
            ))}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.disclaimer}>
            本项目为技术学习作品，非商业用途
          </p>
          <p className={styles.source}>
            数据来源：知乎、B站、微博 · 仅供个人学习研究使用
          </p>
          <p className={styles.copyright}>
            © 2026 迷你今日热榜 · 学习项目
          </p>
        </div>
      </footer>
    </div>
  );
}
