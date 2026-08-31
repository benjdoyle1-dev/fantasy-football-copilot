import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { MockLeagueProvider } from './providers/MockLeagueProvider'
import { SleeperNFLDataProvider } from './providers/SleeperNFLDataProvider'
import { NFLPlayerDataService } from './providers/NFLPlayerDataService'
import { ESPNLeagueProvider } from './providers/ESPNLeagueProvider'
import { ESPNNFLDataProvider } from './providers/ESPNNFLDataProvider'
import type { WeeklyPlayerData } from './types'

const USE_ESPN = true

let leagueProvider: InstanceType<typeof MockLeagueProvider | typeof ESPNLeagueProvider>
let playerDataService: NFLPlayerDataService

if (USE_ESPN) {
  const weeklyDataCache = new Map<string, WeeklyPlayerData>()
  leagueProvider  = new ESPNLeagueProvider(515889997, 2026, __ESPN_SWID__, weeklyDataCache)
  playerDataService = new NFLPlayerDataService(new ESPNNFLDataProvider(weeklyDataCache))
} else {
  leagueProvider    = new MockLeagueProvider()
  playerDataService = new NFLPlayerDataService(new SleeperNFLDataProvider())
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App leagueProvider={leagueProvider} playerDataService={playerDataService} />
  </StrictMode>,
)
