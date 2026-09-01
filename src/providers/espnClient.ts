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
