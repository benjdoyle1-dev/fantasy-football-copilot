import { WeeklyPlayerData } from '../types'
import { mockWeeklyData } from '../data/mockWeeklyData'
import { NFLDataProvider } from './NFLDataProvider'

// Fulfils the NFLDataProvider contract using static mock data.
// Swap this for SleeperNFLDataProvider, ESPNNFLDataProvider, etc. in main.tsx.
export class MockNFLDataProvider implements NFLDataProvider {
  getPlayerStats(playerId: string): Promise<WeeklyPlayerData | null> {
    return Promise.resolve(mockWeeklyData[playerId] ?? null)
  }
}
