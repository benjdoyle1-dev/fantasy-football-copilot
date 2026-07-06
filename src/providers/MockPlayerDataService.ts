import { WeeklyPlayerData } from '../types'
import { mockWeeklyData } from '../data/mockWeeklyData'
import { PlayerDataService } from './PlayerDataService'

export class MockPlayerDataService implements PlayerDataService {
  getWeeklyData(playerId: string): Promise<WeeklyPlayerData | null> {
    return Promise.resolve(mockWeeklyData[playerId] ?? null)
  }
}
