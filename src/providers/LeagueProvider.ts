import { FantasyTeam } from '../types'

export interface LeagueProvider {
  getTeam(): Promise<FantasyTeam>
}
