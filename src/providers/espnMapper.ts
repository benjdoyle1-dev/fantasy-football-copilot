import type { ESPNRosterEntry, ESPNLeagueResponse } from './espnClient'
import type { Player, StarterSlot, LineupSlot, WeeklyPlayerData } from '../types'

// ─── Lookup tables ────────────────────────────────────────────────────────────

// Slots the app understands as "starting" lineup positions
const STARTER_SLOT: Record<number, LineupSlot> = {
  0:  'QB',
  2:  'RB',
  4:  'WR',
  6:  'TE',
  16: 'DEF',
  17: 'K',
  23: 'FLEX',
}

const POSITION: Record<number, Player['position']> = {
  1:  'QB',
  2:  'RB',
  3:  'WR',
  4:  'TE',
  5:  'K',
  16: 'DEF',
}

// ESPN proTeamId → NFL abbreviation
const PRO_TEAM: Record<number, string> = {
  1:  'ATL', 2:  'BUF', 3:  'CHI', 4:  'CIN', 5:  'CLE',
  6:  'DAL', 7:  'DEN', 8:  'DET', 9:  'GB',  10: 'TEN',
  11: 'IND', 12: 'KC',  13: 'OAK', 14: 'LAR', 15: 'MIA',
  16: 'MIN', 17: 'NE',  18: 'NO',  19: 'NYG', 20: 'NYJ',
  21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC', 25: 'SF',
  26: 'SEA', 27: 'TB',  28: 'WSH', 29: 'CAR', 30: 'JAX',
  33: 'BAL', 34: 'HOU', 0:  'FA',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapInjuryStatus(raw?: string): WeeklyPlayerData['injuryStatus'] {
  switch (raw?.toUpperCase()) {
    case 'QUESTIONABLE': return 'questionable'
    case 'OUT':          return 'out'
    case 'DOUBTFUL':     return 'out'
    default:             return 'active'
  }
}

function projectedPoints(entry: ESPNRosterEntry, currentScoringPeriod: number): number {
  const stats = entry.playerPoolEntry.player.stats ?? []
  const proj  = stats.find(
    s => s.statSourceId === 1 && s.scoringPeriodId === currentScoringPeriod,
  )
  return proj?.appliedTotal ?? 0
}

// ─── Public mappers ───────────────────────────────────────────────────────────

export function mapPlayer(entry: ESPNRosterEntry): Player {
  const { player } = entry.playerPoolEntry
  return {
    id:       String(player.id),
    name:     player.fullName,
    position: POSITION[player.defaultPositionId] ?? 'WR',
    team:     PRO_TEAM[player.proTeamId]          ?? 'FA',
  }
}

export function mapWeeklyData(
  entry: ESPNRosterEntry,
  currentScoringPeriod: number,
): WeeklyPlayerData {
  const { player } = entry.playerPoolEntry
  const isDST      = entry.playerId < 0

  return {
    playerId:        String(player.id),
    projectedPoints: projectedPoints(entry, currentScoringPeriod),
    opponent:        '—',
    gameTime:        null,
    weather:         '—',
    injuryStatus:    isDST ? 'active' : mapInjuryStatus(player.injuryStatus),
  }
}

// Finds the authenticated user's team by SWID and returns sorted starters +
// bench as the roster's canonical split. Returns null if the team isn't found.
export function mapRoster(
  response: ESPNLeagueResponse,
  swid: string,
): { teamName: string; starters: StarterSlot[]; bench: Player[] } | null {
  const team = response.teams.find(t => t.primaryOwner === swid)
  if (!team) return null

  const period   = response.scoringPeriodId
  const starters: StarterSlot[] = []
  const bench:    Player[]      = []

  for (const entry of team.roster.entries) {
    const slotId = entry.lineupSlotId
    if (slotId === 21) continue // IR — skip entirely

    const player = mapPlayer(entry)

    if (slotId === 20) {
      // BENCH
      bench.push(player)
    } else {
      const slot = STARTER_SLOT[slotId]
      if (slot) starters.push({ slot, player })
    }
  }

  return { teamName: team.name, starters, bench }
}
