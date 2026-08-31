import type { NFLDataProvider } from './NFLDataProvider'
import type { WeeklyPlayerData } from '../types'

// Reads from the shared cache populated by ESPNLeagueProvider.getTeam().
// No network calls — the roster fetch already embedded projected points.
export class ESPNNFLDataProvider implements NFLDataProvider {
  constructor(private readonly weeklyDataCache: Map<string, WeeklyPlayerData>) {}

  async getPlayerStats(playerId: string): Promise<WeeklyPlayerData | null> {
    return this.weeklyDataCache.get(playerId) ?? null
  }
}
