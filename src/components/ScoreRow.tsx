import type { TeamRecord } from '../types'
import styles from './ScoreRow.module.css'

interface Props {
  projectedScore?: number
  record?: TeamRecord
}

function formatRecord(r: TeamRecord) {
  return r.ties > 0
    ? `${r.wins}–${r.losses}–${r.ties}`
    : `${r.wins}–${r.losses}`
}

export default function ScoreRow({ projectedScore, record }: Props) {
  const scoreDisplay  = projectedScore != null ? projectedScore.toFixed(1) : '—'
  const recordDisplay = record != null ? formatRecord(record) : '—'

  return (
    <div className={styles.row}>
      <div className={styles.card}>
        <div className={styles.label}>Projected score</div>
        <div className={`${styles.value} ${styles.green}`}>{scoreDisplay}</div>
        <div className={styles.sub}>pts this week</div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Season record</div>
        <div className={styles.value}>{recordDisplay}</div>
      </div>
    </div>
  )
}
