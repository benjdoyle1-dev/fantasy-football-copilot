import { FantasyTeam } from '../types'
import { mockTeam } from '../data/mockTeam'
import { LeagueProvider } from './LeagueProvider'

export class MockLeagueProvider implements LeagueProvider {
  getTeam(): Promise<FantasyTeam> {
    return Promise.resolve(mockTeam)
  }
}
