import { WeeklyPlayerData } from '../types'
import { PlayerDataService } from './PlayerDataService'
import { NFLDataProvider } from './NFLDataProvider'

// Concrete PlayerDataService that sources weekly data from an NFLDataProvider.
// This is where cross-cutting concerns (caching, fallbacks, multi-provider aggregation)
// would be added in the future — without touching any NFLDataProvider implementation.
export class NFLPlayerDataService implements PlayerDataService {
  constructor(private readonly nflDataProvider: NFLDataProvider) {}

  getWeeklyData(playerId: string): Promise<WeeklyPlayerData | null> {
    return this.nflDataProvider.getPlayerStats(playerId)
  }
}
