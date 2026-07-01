import { FantasyTeam, LineupSlot, Player, PlayerStatus, Recommendation } from '../types'
import styles from './LineupTable.module.css'

interface LineupTableProps {
  team: FantasyTeam
  recommendation: Recommendation | null
  onApply: () => void
}

function StatusCell({ status }: { status: PlayerStatus }) {
  if (status === 'questionable') {
    return (
      <span className={styles.statusQ}>
        <span className={`${styles.dot} ${styles.dotAmber}`} />Q
      </span>
    )
  }
  return (
    <span className={styles.statusActive}>
      <span className={`${styles.dot} ${styles.dotGreen}`} />Active
    </span>
  )
}

interface PlayerRowProps {
  slot: LineupSlot
  player: Player
  highlight?: 'swap-out' | 'swap-in' | null
  bench?: boolean
}

function PlayerRow({ slot, player, highlight, bench = false }: PlayerRowProps) {
  const isHighScoring = player.projectedPoints >= 20
  const rowClass = [
    styles.row,
    bench ? styles.bench : '',
    highlight === 'swap-out' ? styles.swapOut : '',
    highlight === 'swap-in' ? styles.swapIn : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={rowClass}>
      <span className={`${styles.pos} ${highlight === 'swap-in' ? styles.posGreen : ''}`}>
        {slot}
      </span>
      <div className={styles.info}>
        <span className={`${styles.name} ${highlight === 'swap-in' ? styles.nameGreen : ''}`}>
          {player.name}
        </span>
        <span className={styles.team}>{player.team}</span>
      </div>
      <div className={styles.opp}>{player.opponent}</div>
      <div className={`${styles.proj} ${isHighScoring && !bench ? styles.projHigh : ''}`}>
        {player.projectedPoints}
      </div>
      <div className={styles.statusCell}>
        <StatusCell status={player.status} />
      </div>
    </div>
  )
}

function ColHeaders() {
  return (
    <div className={styles.colHeaders}>
      <div />
      <div className={`${styles.colH} ${styles.colHLeft}`}>Player</div>
      <div className={styles.colH}>Opp</div>
      <div className={styles.colH}>Proj</div>
      <div className={styles.colH}>Status</div>
    </div>
  )
}

export default function LineupTable({ team, recommendation, onApply }: LineupTableProps) {
  const swapOutId = recommendation?.playerToBench.id
  const swapInId = recommendation?.playerToStart.id

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Starting lineup</span>
          <button
            className={styles.applyBtn}
            onClick={onApply}
            disabled={!recommendation}
          >
            <i className="ti ti-player-play" aria-hidden="true" />
            Apply recommendation
          </button>
        </div>
        <ColHeaders />
        {team.starters.map(({ slot, player }) => (
          <PlayerRow
            key={player.id}
            slot={slot}
            player={player}
            highlight={player.id === swapOutId ? 'swap-out' : null}
          />
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Bench</span>
        </div>
        <ColHeaders />
        {team.bench.map((player) => (
          <PlayerRow
            key={player.id}
            slot={player.position}
            player={player}
            highlight={player.id === swapInId ? 'swap-in' : null}
            bench
          />
        ))}
      </div>
    </>
  )
}
