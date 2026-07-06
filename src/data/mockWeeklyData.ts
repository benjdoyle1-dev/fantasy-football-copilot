import { WeeklyPlayerData } from '../types'

// Week 14 projections and matchup data, keyed by player id.
// In production this would be fetched from an NFL data provider.
export const mockWeeklyData: Record<string, WeeklyPlayerData> = {
  'lamar-jackson':      { playerId: 'lamar-jackson',      projectedPoints: 29.4, opponent: 'vs LAR', injuryStatus: 'active',       weather: null, gameTime: 'Sun 1:00 PM' },
  'bijan-robinson':     { playerId: 'bijan-robinson',     projectedPoints: 22.1, opponent: 'vs CAR', injuryStatus: 'active',       weather: null, gameTime: 'Sun 1:00 PM' },
  'saquon-barkley':     { playerId: 'saquon-barkley',     projectedPoints: 18.6, opponent: '@ DAL',  injuryStatus: 'questionable', weather: null, gameTime: 'Sun 4:25 PM' },
  'jamarrchase':        { playerId: 'jamarrchase',        projectedPoints: 24.8, opponent: 'vs TEN', injuryStatus: 'active',       weather: null, gameTime: 'Sun 1:00 PM' },
  'tyreek-hill':        { playerId: 'tyreek-hill',        projectedPoints: 16.3, opponent: 'vs NE',  injuryStatus: 'active',       weather: null, gameTime: 'Sun 1:00 PM' },
  'sam-laporta':        { playerId: 'sam-laporta',        projectedPoints: 11.9, opponent: 'vs GB',  injuryStatus: 'active',       weather: null, gameTime: 'Sun 1:00 PM' },
  'zack-moss':          { playerId: 'zack-moss',          projectedPoints:  8.4, opponent: 'vs HOU', injuryStatus: 'questionable', weather: null, gameTime: 'Sun 1:00 PM' },
  'evan-mcpherson':     { playerId: 'evan-mcpherson',     projectedPoints:  9.2, opponent: 'vs TEN', injuryStatus: 'active',       weather: null, gameTime: 'Sun 1:00 PM' },
  'dallas-cowboys-def': { playerId: 'dallas-cowboys-def', projectedPoints:  5.2, opponent: 'vs PHI', injuryStatus: 'active',       weather: null, gameTime: 'Sun 4:25 PM' },
  'jaylen-warren':      { playerId: 'jaylen-warren',      projectedPoints: 17.2, opponent: 'vs NYG', injuryStatus: 'active',       weather: null, gameTime: 'Sun 1:00 PM' },
  'keenan-allen':       { playerId: 'keenan-allen',       projectedPoints:  7.1, opponent: '@ MIA',  injuryStatus: 'active',       weather: null, gameTime: 'Sun 1:00 PM' },
  'bo-nix':             { playerId: 'bo-nix',             projectedPoints: 14.2, opponent: 'vs KC',  injuryStatus: 'active',       weather: null, gameTime: 'Sun 4:25 PM' },
}
