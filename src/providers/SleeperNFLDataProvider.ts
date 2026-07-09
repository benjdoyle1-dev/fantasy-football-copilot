import { InjuryStatus, WeeklyPlayerData } from '../types'
import { mockWeeklyData } from '../data/mockWeeklyData'
import { NFLDataProvider } from './NFLDataProvider'

// ─── Endpoint ────────────────────────────────────────────────────────────────
//
// GET https://api.sleeper.app/v1/players/nfl
//
// Why this endpoint:
//   Sleeper's public API exposes one always-populated endpoint: the full player
//   roster. It returns injury_status, team, position, and biographical data for
//   every NFL player, and is kept up-to-date throughout the off-season.
//
//   The projections endpoint (/v1/projections/nfl/{year}/{week}) is only
//   populated during an active NFL season — pre-game projections are not
//   retained after the season ends. Until the 2025 season begins, projectedPoints
//   falls back to mock data. When the season is active, swap in a call to:
//   GET https://api.sleeper.app/v1/projections/nfl/{year}/{week}
//   which returns { [sleeperId]: { pts_ppr, opp, ... } }.
//
// ─── Player ID mapping ────────────────────────────────────────────────────────
//
// Sleeper identifies players by numeric string IDs; we use human-readable
// internal IDs. This mapping bridges them for our mock roster.
//
// In a full integration, the LeagueProvider would fetch the user's actual
// Sleeper roster, which already contains Sleeper player IDs — making this
// static mapping unnecessary.

const INTERNAL_TO_SLEEPER_ID: Record<string, string> = {
  'lamar-jackson':      '4881',
  'bijan-robinson':     '9509',
  'saquon-barkley':     '4866',
  'jamarrchase':        '7564',
  'tyreek-hill':        '3321',
  'sam-laporta':        '10859',
  'zack-moss':          '6845',
  'evan-mcpherson':     '7839',
  'dallas-cowboys-def': 'DAL',   // Sleeper uses team abbreviation for DEF
  'jaylen-warren':      '8228',
  'keenan-allen':       '1479',
  'bo-nix':             '11563',
}

// ─── Sleeper response types ───────────────────────────────────────────────────

interface SleeperPlayer {
  player_id: string
  full_name: string
  position: string
  team: string | null
  injury_status: string | null
  status: string | null
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

function mapInjuryStatus(raw: string | null | undefined): InjuryStatus {
  switch (raw?.toLowerCase()) {
    case 'questionable': return 'questionable'
    case 'out':
    case 'ir':
    case 'pup':
    case 'na':           return 'out'
    default:             return 'active'
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export class SleeperNFLDataProvider implements NFLDataProvider {
  // The /players/nfl payload is ~2 MB. Fetch once per session and reuse.
  private playersCache: Map<string, SleeperPlayer> | null = null

  private async fetchPlayers(): Promise<Map<string, SleeperPlayer>> {
    if (this.playersCache) return this.playersCache

    const response = await fetch('https://api.sleeper.app/v1/players/nfl')
    if (!response.ok) {
      throw new Error(`Sleeper /players/nfl returned ${response.status}`)
    }

    const raw: Record<string, SleeperPlayer> = await response.json()
    this.playersCache = new Map(Object.entries(raw))
    return this.playersCache
  }

  async getPlayerStats(playerId: string): Promise<WeeklyPlayerData | null> {
    const sleeperId = INTERNAL_TO_SLEEPER_ID[playerId]
    if (!sleeperId) return null

    const players = await this.fetchPlayers()
    const player = players.get(sleeperId)
    if (!player) return null

    // projectedPoints and opponent come from mock data until the 2025 NFL
    // season begins and the projections endpoint is populated again.
    const fallback = mockWeeklyData[playerId]

    return {
      playerId,
      projectedPoints: fallback?.projectedPoints ?? 0,
      opponent:        fallback?.opponent ?? '—',
      injuryStatus:    mapInjuryStatus(player.injury_status), // live from Sleeper
      weather:         null,
      gameTime:        null,
    }
  }
}
