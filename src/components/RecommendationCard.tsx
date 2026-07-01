import { Recommendation } from '../types'
import styles from './RecommendationCard.module.css'

interface Props {
  recommendation: Recommendation | null
}

export default function RecommendationCard({ recommendation }: Props) {
  if (!recommendation) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <i className="ti ti-sparkles" aria-hidden="true" style={{ fontSize: 15, color: 'var(--color-green)' }} />
            <span className={styles.label}>Today's recommendation</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', padding: '4px 0 8px' }}>
          Click <strong>Optimize lineup</strong> below to generate a recommendation.
        </p>
      </div>
    )
  }

  const { playerToStart, playerToBench, slot, projectedPointGain, confidence, explanation } = recommendation

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <i className="ti ti-sparkles" aria-hidden="true" style={{ fontSize: 15, color: 'var(--color-green)' }} />
          <span className={styles.label}>Today's recommendation</span>
        </div>
        <span className={styles.confidence}>{confidence}% confidence</span>
      </div>

      <div className={styles.change}>
        <div className={styles.playerSlot}>
          <span className={styles.posBadge}>{slot}</span>
          <div>
            <div className={styles.playerName}>{playerToBench.name}</div>
            <div className={styles.playerProj}>
              Proj. {playerToBench.projectedPoints} pts · {playerToBench.opponent}
            </div>
          </div>
        </div>

        <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: 16, color: 'var(--color-text-tertiary)', flexShrink: 0 }} />

        <div className={styles.playerSlot}>
          <span className={`${styles.posBadge} ${styles.posBadgeGreen}`}>{slot}</span>
          <div>
            <div className={`${styles.playerName} ${styles.playerNameGreen}`}>{playerToStart.name}</div>
            <div className={`${styles.playerProj} ${styles.playerProjGreen}`}>
              Proj. {playerToStart.projectedPoints} pts · {playerToStart.opponent}&nbsp;
              <strong>+{projectedPointGain.toFixed(1)} pts</strong>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <i className="ti ti-robot" aria-hidden="true" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 6, color: 'var(--color-text-tertiary)' }} />
        {explanation}
      </div>
    </div>
  )
}
