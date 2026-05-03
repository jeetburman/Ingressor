import styles from './StatsCard.module.css';

interface Props {
  label: string;
  value: string | number;
  accent?: 'blue' | 'red' | 'green' | 'default';
}

export function StatsCard({ label, value, accent = 'default' }: Props) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} ${styles[accent]}`}>{value}</p>
    </div>
  );
}