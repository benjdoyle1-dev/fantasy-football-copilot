import type { ESPNRosterEntry, ESPNLeagueResponse, ESPNLeagueSettings } from './espnClient'
import type { Player, StarterSlot, LineupSlot, WeeklyPlayerData, LeagueInfo, ScoringFormat, CurrentMatchup, TeamRecord } from '../types'

// ─── Lookup tables ────────────────────────────────────────────────────────────

// ESPN's canonical display order for starting slots
const SLOT_DISPLAY_ORDER: Partial<Record<LineupSlot, number>> = {
  QB: 0, RB: 1, WR: 2, TE: 3, FLEX: 4, K: 5, DEF: 6,
}

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

  starters.sort((a, b) =>
    (SLOT_DISPLAY_ORDER[a.slot] ?? 99) - (SLOT_DISPLAY_ORDER[b.slot] ?? 99)
  )

  return { teamName: team.name, starters, bench }
}

// ESPN stat ID 53 = receptions. The points value tells us the scoring format.
function detectScoringFormat(settings: ESPNLeagueSettings): ScoringFormat {
  const items = settings.scoringSettings?.scoringItems ?? []
  const reception = items.find(i => i.statId === 53)
  if (!reception) return 'Standard'
  if (reception.points >= 0.9) return 'PPR'
  if (reception.points >= 0.4) return 'Half-PPR'
  return 'Standard'
}

// Derive a human-readable waiver description.
// waiverProcessDays lists every day waivers run; if ≥6 days it's effectively daily.
function formatWaiverInfo(settings: ESPNLeagueSettings): string {
  const { waiverProcessDays, waiverProcessHour } = settings.acquisitionSettings
  const hour   = waiverProcessHour ?? 0
  const period = hour < 12 ? 'AM' : 'PM'
  const h12    = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const timeStr = `${h12}:00 ${period}`

  if (!waiverProcessDays || waiverProcessDays.length === 0) return timeStr

  if (waiverProcessDays.length >= 6) return `Daily · ${timeStr}`

  const SHORT: Record<string, string> = {
    MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
    THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
  }
  const days = waiverProcessDays.map(d => SHORT[d] ?? d).join(', ')
  return `${days} · ${timeStr}`
}

function mapRecord(raw: { wins?: number; losses?: number; ties?: number } | undefined): TeamRecord {
  return { wins: raw?.wins ?? 0, losses: raw?.losses ?? 0, ties: raw?.ties ?? 0 }
}

// Finds the authenticated user's current-week matchup and returns an
// application-level summary. Returns null if the matchup cannot be found.
export function mapCurrentMatchup(
  response: ESPNLeagueResponse,
  myTeamId: number,
): CurrentMatchup | null {
  const schedule = response.schedule ?? []
  const period   = response.status.currentMatchupPeriod

  const matchup = schedule.find(
    m => m.matchupPeriodId === period &&
      (m.home.teamId === myTeamId || m.away.teamId === myTeamId),
  )
  if (!matchup) return null

  const mySide  = matchup.home.teamId === myTeamId ? matchup.home : matchup.away
  const oppSide = matchup.home.teamId === myTeamId ? matchup.away : matchup.home

  const myTeam  = response.teams.find(t => t.id === myTeamId)
  const oppTeam = response.teams.find(t => t.id === oppSide.teamId)
  if (!myTeam || !oppTeam) return null

  return {
    myAbbrev:     myTeam.abbrev,
    myProjected:  Math.round(mySide.totalProjectedPointsLive * 10) / 10,
    myRecord:     mapRecord(myTeam.record?.overall),
    oppAbbrev:    oppTeam.abbrev,
    oppName:      oppTeam.name,
    oppProjected: Math.round(oppSide.totalProjectedPointsLive * 10) / 10,
    oppRecord:    mapRecord(oppTeam.record?.overall),
  }
}

export function mapLeagueInfo(settings: ESPNLeagueSettings): LeagueInfo {
  return {
    name:          settings.name,
    size:          settings.size,
    scoringFormat: detectScoringFormat(settings),
    waiverInfo:    formatWaiverInfo(settings),
  }
}
