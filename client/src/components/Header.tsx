import styles from './Header.module.css';

export function Header() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span className={styles.icon}>🔥</span>
          <h1 className={styles.title}>
            今日<span className={styles.highlight}>热搜</span>
          </h1>
        </div>
        <span className={styles.time}>{timeString} 更新</span>
      </div>
    </header>
  );
}
