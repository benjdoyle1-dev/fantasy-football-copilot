import styles from './ScoreRow.module.css'

const METRICS = [
  { label: 'Projected score', value: '134.7', sub: 'pts this week', green: true },
  { label: 'Season record', value: '8–5', sub: '2nd in division', green: false },
  { label: 'Playoff odds', value: '81%', sub: 'up from 74% last week', green: true },
]

export default function ScoreRow() {
  return (
    <div className={styles.row}>
      {METRICS.map(({ label, value, sub, green }) => (
        <div key={label} className={styles.card}>
          <div className={styles.label}>{label}</div>
          <div className={`${styles.value} ${green ? styles.green : ''}`}>{value}</div>
          <div className={styles.sub}>{sub}</div>
        </div>
      ))}
    </div>
  )
}
