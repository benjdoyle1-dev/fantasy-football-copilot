import type { CurrentMatchup, LeagueInfo } from '../types'
import styles from './Sidebar.module.css'

const FUTURE_FEATURES = [
  { icon: 'ti-arrows-exchange', label: 'Trade analyzer' },
  { icon: 'ti-player-skip-forward', label: 'Waiver assistant' },
  { icon: 'ti-message', label: 'AI chat' },
]

interface Props {
  league?:  LeagueInfo
  matchup?: CurrentMatchup | null
}

function recordStr(r: CurrentMatchup['myRecord']) {
  return r.ties > 0 ? `${r.wins}–${r.losses}–${r.ties}` : `${r.wins}–${r.losses}`
}

export default function Sidebar({ league, matchup }: Props) {
  const formatLabel = league
    ? `${league.scoringFormat} · ${league.size} teams`
    : '—'

  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <div className={styles.sectionLabel}>League</div>
        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Name</span>
            <span className={styles.infoVal}>{league?.name ?? '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Format</span>
            <span className={styles.infoVal}>{formatLabel}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Waiver</span>
            <span className={styles.infoVal}>{league?.waiverInfo ?? '—'}</span>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.sectionLabel}>This week's matchup</div>
        {matchup ? (
          <div className={styles.matchupCard}>
            <div className={styles.teams}>
              <div className={styles.team}>
                <span className={styles.teamAbbr}>{matchup.myAbbrev}</span>
                <span className={styles.teamRecord}>{recordStr(matchup.myRecord)}</span>
              </div>
              <span className={styles.vs}>vs</span>
              <div className={styles.team}>
                <span className={styles.teamAbbr}>{matchup.oppAbbrev}</span>
                <span className={styles.teamRecord}>{recordStr(matchup.oppRecord)}</span>
              </div>
            </div>
            <div className={styles.projRow}>
              <div className={styles.projItem}>
                <span className={`${styles.projVal} ${styles.projValGreen}`}>
                  {matchup.myProjected.toFixed(1)}
                </span>
                <span className={styles.projLabel}>Your proj.</span>
              </div>
              <div className={styles.projItem}>
                <span className={styles.projVal}>{matchup.oppProjected.toFixed(1)}</span>
                <span className={styles.projLabel}>Opp. proj.</span>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
            No matchup data available
          </p>
        )}
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.sectionLabel}>Coming soon</div>
        <div className={styles.futureList}>
          {FUTURE_FEATURES.map(({ icon, label }) => (
            <button key={label} className={styles.futureBtn} disabled>
              <i className={`ti ${icon}`} aria-hidden="true" />
              {label}
              <span className={styles.soonPill}>Soon</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  )
}
