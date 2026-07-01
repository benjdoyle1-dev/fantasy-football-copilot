import styles from './Sidebar.module.css'

const FUTURE_FEATURES = [
  { icon: 'ti-arrows-exchange', label: 'Trade analyzer' },
  { icon: 'ti-player-skip-forward', label: 'Waiver assistant' },
  { icon: 'ti-message', label: 'AI chat' },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <div className={styles.sectionLabel}>League</div>
        <div className={styles.infoList}>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Name</span>
            <span className={styles.infoVal}>The Gridiron</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Format</span>
            <span className={styles.infoVal}>PPR · 12 teams</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Standings</span>
            <span className={styles.infoVal}>2nd place</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Waiver</span>
            <span className={styles.infoVal}>Wed 12:00 AM</span>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.sectionLabel}>This week's matchup</div>
        <div className={styles.matchupCard}>
          <div className={styles.teams}>
            <div className={styles.team}>
              <span className={styles.teamAbbr}>BEN</span>
              <span className={styles.teamRecord}>8–5</span>
            </div>
            <span className={styles.vs}>vs</span>
            <div className={styles.team}>
              <span className={styles.teamAbbr}>MIKE</span>
              <span className={styles.teamRecord}>7–6</span>
            </div>
          </div>
          <div className={styles.projRow}>
            <div className={styles.projItem}>
              <span className={`${styles.projVal} ${styles.projValGreen}`}>134.7</span>
              <span className={styles.projLabel}>Your proj.</span>
            </div>
            <div className={styles.projItem}>
              <span className={styles.projVal}>121.3</span>
              <span className={styles.projLabel}>Opp. proj.</span>
            </div>
          </div>
          <div className={styles.winProb}>Win probability <span className={styles.winPct}>68%</span></div>
        </div>
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
