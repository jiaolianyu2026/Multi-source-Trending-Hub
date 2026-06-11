import styles from './Tabs.module.css';

interface TabsProps {
  activeTab: 'platform' | 'analysis';
  onChange: (tab: 'platform' | 'analysis') => void;
}

export function Tabs({ activeTab, onChange }: TabsProps) {
  return (
    <div className={styles.tabs}>
      <div className={styles.container}>
        <button
          className={`${styles.tab} ${activeTab === 'platform' ? styles.active : ''}`}
          onClick={() => onChange('platform')}
        >
          平台热搜
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'analysis' ? styles.active : ''}`}
          onClick={() => onChange('analysis')}
        >
          数据分析
        </button>
      </div>
    </div>
  );
}
