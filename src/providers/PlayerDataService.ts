import { WeeklyPlayerData } from '../types'

export interface PlayerDataService {
  getWeeklyData(playerId: string): Promise<WeeklyPlayerData | null>
}
