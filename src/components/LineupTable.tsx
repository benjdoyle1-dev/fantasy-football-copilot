import { FantasyTeam, InjuryStatus, LineupSlot, Player, Recommendation, WeeklyPlayerData } from '../types'
import styles from './LineupTable.module.css'

interface LineupTableProps {
  team: FantasyTeam
  weeklyData: Map<string, WeeklyPlayerData>
  recommendation: Recommendation | null
  onApply: () => void
}

function StatusCell({ status }: { status: InjuryStatus }) {
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
  weekly: WeeklyPlayerData | undefined
  highlight?: 'swap-out' | 'swap-in' | null
  bench?: boolean
}

function PlayerRow({ slot, player, weekly, highlight, bench = false }: PlayerRowProps) {
  const isHighScoring = (weekly?.projectedPoints ?? 0) >= 20
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
      <div className={styles.opp}>{weekly?.opponent ?? '—'}</div>
      <div className={`${styles.proj} ${isHighScoring && !bench ? styles.projHigh : ''}`}>
        {weekly?.projectedPoints ?? '—'}
      </div>
      <div className={styles.statusCell}>
        {weekly ? <StatusCell status={weekly.injuryStatus} /> : <span>—</span>}
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

export default function LineupTable({ team, weeklyData, recommendation, onApply }: LineupTableProps) {
  const swapOutId = recommendation?.playerToBench.id
  const swapInId  = recommendation?.playerToStart.id

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
            weekly={weeklyData.get(player.id)}
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
            weekly={weeklyData.get(player.id)}
            highlight={player.id === swapInId ? 'swap-in' : null}
            bench
          />
        ))}
      </div>
    </>
  )
}
