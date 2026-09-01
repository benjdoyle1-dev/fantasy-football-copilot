import type { LeagueProvider } from './LeagueProvider'
import type { FantasyTeam, WeeklyPlayerData } from '../types'
import { fetchESPNLeague, fetchNFLSchedule } from './espnClient'
import { mapWeeklyData, mapRoster, mapLeagueInfo, mapCurrentMatchup } from './espnMapper'

export class ESPNLeagueProvider implements LeagueProvider {
  constructor(
    private readonly leagueId: number,
    private readonly season: number,
    private readonly swid: string,
    private readonly weeklyDataCache: Map<string, WeeklyPlayerData>,
  ) {}

  async getTeam(): Promise<FantasyTeam> {
    const [response, scheduleMap] = await Promise.all([
      fetchESPNLeague(this.leagueId, this.season),
      fetchNFLSchedule(),
    ])
    const roster = mapRoster(response, this.swid)

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
      const weekly = mapWeeklyData(entry, period, scheduleMap)
      this.weeklyDataCache.set(weekly.playerId, weekly)
    }

    // Sum projected points across starting slots only (exclude bench and IR)
    const projectedScore = roster.starters.reduce((sum, { player }) => {
      return sum + (this.weeklyDataCache.get(player.id)?.projectedPoints ?? 0)
    }, 0)

    const overall = espnTeam.record?.overall ?? { wins: 0, losses: 0, ties: 0 }

    return {
      name:           roster.teamName,
      league:         mapLeagueInfo(response.settings),
      currentWeek:    response.status.currentMatchupPeriod,
      projectedScore: Math.round(projectedScore * 10) / 10,
      record:         { wins: overall.wins, losses: overall.losses, ties: overall.ties },
      currentMatchup: mapCurrentMatchup(response, espnTeam.id),
      starters:       roster.starters,
      bench:          roster.bench,
    }
  }
}
