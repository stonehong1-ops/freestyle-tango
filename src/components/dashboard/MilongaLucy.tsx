import styles from './MilongaLucy.module.css';

export default function MilongaLucy() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.icon}>💃</span>
        <h2 className={styles.title}>밀롱가 Lucy</h2>
        <p className={styles.description}>준비 중인 페이지입니다.</p>
        <div className={styles.statusBadge}>Coming Soon</div>
      </div>
    </div>
  );
}
