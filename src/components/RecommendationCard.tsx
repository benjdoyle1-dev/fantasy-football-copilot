import { Recommendation, RecommendationReason, ReasonType, WeeklyPlayerData } from '../types'
import styles from './RecommendationCard.module.css'

interface Props {
  recommendation: Recommendation | null
  weeklyData: Map<string, WeeklyPlayerData>
}

const REASON_ICONS: Record<ReasonType, string> = {
  PROJECTION: 'ti-chart-bar',
  INJURY:     'ti-heart-broken',
  MATCHUP:    'ti-swords',
  WEATHER:    'ti-cloud',
  POSITION:   'ti-arrows-exchange',
  OTHER:      'ti-info-circle',
}

function ImpactBadge({ impact }: { impact: RecommendationReason['impact'] }) {
  return (
    <span className={`${styles.impactBadge} ${styles[`impact${impact}`]}`}>
      {impact}
    </span>
  )
}

function ReasonRow({ reason }: { reason: RecommendationReason }) {
  return (
    <div className={styles.reason}>
      <i className={`ti ${REASON_ICONS[reason.type]} ${styles.reasonIcon}`} aria-hidden="true" />
      <div className={styles.reasonText}>
        <span className={styles.reasonTitle}>{reason.title}</span>
        <span className={styles.reasonDesc}>{reason.description}</span>
      </div>
      <ImpactBadge impact={reason.impact} />
    </div>
  )
}

export default function RecommendationCard({ recommendation, weeklyData }: Props) {
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
          Your lineup looks optimal — no swaps needed.
        </p>
      </div>
    )
  }

  const { lineup, projectedGain, confidence, reasons } = recommendation
  const { playerToStart, playerToBench, slot } = lineup
  const benchData = weeklyData.get(playerToBench.id)
  const startData = weeklyData.get(playerToStart.id)

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
              {benchData ? `Proj. ${benchData.projectedPoints.toFixed(2)} pts · ${benchData.opponent}` : '—'}
            </div>
          </div>
        </div>

        <i className="ti ti-arrow-right" aria-hidden="true" style={{ fontSize: 16, color: 'var(--color-text-tertiary)', flexShrink: 0 }} />

        <div className={styles.playerSlot}>
          <span className={`${styles.posBadge} ${styles.posBadgeGreen}`}>{slot}</span>
          <div>
            <div className={`${styles.playerName} ${styles.playerNameGreen}`}>{playerToStart.name}</div>
            <div className={`${styles.playerProj} ${styles.playerProjGreen}`}>
              {startData ? `Proj. ${startData.projectedPoints.toFixed(2)} pts · ${startData.opponent}` : '—'}
              &nbsp;<strong>+{projectedGain.toFixed(1)} pts</strong>
            </div>
          </div>
        </div>
      </div>

      {reasons.length > 0 && (
        <div className={styles.reasons}>
          <span className={styles.reasonsLabel}>Why we recommend this</span>
          {reasons.map((r, i) => (
            <ReasonRow key={i} reason={r} />
          ))}
        </div>
      )}
    </div>
  )
}
