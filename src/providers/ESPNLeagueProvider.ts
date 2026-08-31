import type { LeagueProvider } from './LeagueProvider'
import type { FantasyTeam, WeeklyPlayerData } from '../types'
import { fetchESPNLeague } from './espnClient'
import { mapWeeklyData, mapRoster } from './espnMapper'

export class ESPNLeagueProvider implements LeagueProvider {
  constructor(
    private readonly leagueId: number,
    private readonly season: number,
    private readonly swid: string,
    private readonly weeklyDataCache: Map<string, WeeklyPlayerData>,
  ) {}

  async getTeam(): Promise<FantasyTeam> {
    const response = await fetchESPNLeague(this.leagueId, this.season)
    const roster   = mapRoster(response, this.swid)

    if (!roster) {
      throw new Error(
        `Could not find ESPN team for SWID ${this.swid} in league ${this.leagueId}`,
      )
    }

    const period    = response.scoringPeriodId
    const espnTeam  = response.teams.find(t => t.primaryOwner === this.swid)!

    // Populate the shared cache so ESPNNFLDataProvider can answer weekly data queries
    for (const entry of espnTeam.roster.entries) {
      if (entry.lineupSlotId === 21) continue // skip IR
      const weekly = mapWeeklyData(entry, period)
      this.weeklyDataCache.set(weekly.playerId, weekly)
    }

    return {
      name:     roster.teamName,
      starters: roster.starters,
      bench:    roster.bench,
    }
  }
}
