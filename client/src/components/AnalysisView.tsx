import styles from './AnalysisView.module.css';

export function AnalysisView() {
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <div className={styles.icon}>📊</div>
        <h2>数据分析功能开发中</h2>
        <p>即将支持基于大模型的智能热点分析，敬请期待...</p>
      </div>
    </div>
  );
}
