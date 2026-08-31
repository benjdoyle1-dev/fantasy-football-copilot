import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Lineup', active: true },
  { label: 'Trade analyzer', soon: true },
  { label: 'Waiver wire', soon: true },
  { label: 'AI chat', soon: true },
]

interface Props { teamName?: string }

export default function Header({ teamName }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.logo}>
          Fantasy<span className={styles.dot}>.</span>Copilot
        </span>
        <span className={styles.weekBadge}>NFL Week 14</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ label, active, soon }) => (
          <button
            key={label}
            className={`${styles.navItem} ${active ? styles.active : ''} ${soon ? styles.soon : ''}`}
            disabled={soon}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.user}>
        <div className={styles.avatar}>BD</div>
        <span className={styles.userName}>{teamName ?? "Ben's Team"}</span>
      </div>
    </header>
  )
}
