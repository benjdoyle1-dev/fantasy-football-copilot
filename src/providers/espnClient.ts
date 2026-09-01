// ─── ESPN API types ───────────────────────────────────────────────────────────
//
// These represent the raw shape of ESPN's fantasy API responses.
// Nothing here knows about our application models — that translation
// happens exclusively in espnMapper.ts.

export interface ESPNPlayerStat {
  statSourceId: number      // 0 = actual, 1 = projected
  scoringPeriodId: number   // 1 = week 1, etc.
  appliedTotal: number      // points in the league's scoring format
}

export interface ESPNPlayer {
  id: number
  fullName: string
  defaultPositionId: number  // 1=QB 2=RB 3=WR 4=TE 5=K 16=DEF
  proTeamId: number          // maps to NFL team abbreviation
  injuryStatus?: string      // "ACTIVE" | "QUESTIONABLE" | "OUT" | absent for D/ST
  stats: ESPNPlayerStat[]
}

export interface ESPNRosterEntry {
  lineupSlotId: number       // 0=QB 2=RB 4=WR 6=TE 16=DEF 17=K 20=BENCH 21=IR 23=FLEX
  playerId: number           // negative for D/ST units
  injuryStatus: string       // entry-level status — less granular than player.injuryStatus
  playerPoolEntry: {
    player: ESPNPlayer
  }
}

export interface ESPNTeam {
  id: number
  name: string               // "Kings Park Curmudgeons" — the actual team name
  abbrev: string
  primaryOwner: string       // SWID of the team's primary owner, e.g. "{414F...}"
  owners: string[]
  record: {
    overall: { wins: number; losses: number; ties: number }
  }
  roster: {
    entries: ESPNRosterEntry[]
  }
}

export interface ESPNScoringItem {
  statId: number
  points: number
  isReverseItem: boolean
}

export interface ESPNLeagueSettings {
  name: string
  size: number
  scoringSettings: {
    scoringType: string          // e.g. "H2H_POINTS"
    scoringItems: ESPNScoringItem[]
  }
  acquisitionSettings: {
    waiverProcessDays: string[]  // e.g. ["WEDNESDAY", "THURSDAY", ...]
    waiverProcessHour: number    // 0–23
  }
}

export interface ESPNMatchupSide {
  teamId: number
  totalPoints: number
  totalProjectedPointsLive: number
}

export interface ESPNMatchup {
  matchupPeriodId: number
  home: ESPNMatchupSide
  away: ESPNMatchupSide
  winner: string
}

export interface ESPNLeagueResponse {
  id: number
  seasonId: number
  scoringPeriodId: number    // current week number
  status: {
    currentMatchupPeriod: number   // 1-based fantasy week
    latestScoringPeriod: number
    finalScoringPeriod: number
    isActive: boolean
  }
  teams: ESPNTeam[]
  schedule?: ESPNMatchup[]
  settings: ESPNLeagueSettings
}

// ─── NFL schedule types ───────────────────────────────────────────────────────

export interface NFLGameInfo {
  opponent: string   // opponent team abbreviation, e.g. "KC"
  gameTime: string   // formatted local time string, e.g. "Sun 8:20 PM ET"
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
//
// Calls the Vite dev proxy at /api/espn/*, which forwards the request to
// lm-api-reads.fantasy.espn.com and attaches the ESPN_S2 + SWID cookies
// server-side. Credentials never reach the browser.

export async function fetchESPNLeague(
  leagueId: number,
  season: number,
): Promise<ESPNLeagueResponse> {
  const views = 'view=mRoster&view=mTeam&view=mSettings&view=mMatchupScore'
  const url   = `/api/espn/seasons/${season}/segments/0/leagues/${leagueId}?${views}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`ESPN API returned ${response.status} for league ${leagueId}`)
  }
  return response.json()
}

// Fetches the current-week NFL schedule from ESPN's public (unauthenticated)
// scoreboard API and returns a map of team abbreviation → opponent + game time.
// BYE teams are absent from the map; callers should handle missing keys as BYE.
export async function fetchNFLSchedule(): Promise<Map<string, NFLGameInfo>> {
  const url      = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
  const response = await fetch(url)
  if (!response.ok) throw new Error(`NFL scoreboard returned ${response.status}`)

  const data: {
    events: Array<{
      competitions: Array<{
        date: string
        competitors: Array<{ homeAway: string; team: { abbreviation: string } }>
      }>
    }>
  } = await response.json()

  const map = new Map<string, NFLGameInfo>()

  for (const event of data.events ?? []) {
    const comp        = event.competitions[0]
    const isoDate     = comp.date
    const gameTime    = formatKickoff(isoDate)
    const competitors = comp.competitors

    const home = competitors.find(c => c.homeAway === 'home')?.team.abbreviation
    const away = competitors.find(c => c.homeAway === 'away')?.team.abbreviation
    if (!home || !away) continue

    map.set(home, { opponent: away, gameTime })
    map.set(away, { opponent: home, gameTime })
  }

  return map
}

function formatKickoff(isoDate: string): string {
  const date = new Date(isoDate)
  const day  = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' })
  const time = date.toLocaleTimeString('en-US', {
    hour:     'numeric',
    minute:   '2-digit',
    hour12:   true,
    timeZone: 'America/New_York',
  })
  return `${day} ${time} ET`
}
