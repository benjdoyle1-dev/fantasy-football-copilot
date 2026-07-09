import { WeeklyPlayerData } from '../types'

// Retrieves raw weekly NFL player data from an external source.
// Each API integration (Sleeper, ESPN, Yahoo) implements this interface.
// Responsible only for fetching and mapping raw API responses into WeeklyPlayerData —
// no domain logic, no caching, no aggregation.
export interface NFLDataProvider {
  getPlayerStats(playerId: string): Promise<WeeklyPlayerData | null>
}
