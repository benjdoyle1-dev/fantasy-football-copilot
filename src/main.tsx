import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { MockLeagueProvider } from './providers/MockLeagueProvider'
import { SleeperNFLDataProvider } from './providers/SleeperNFLDataProvider'
import { NFLPlayerDataService } from './providers/NFLPlayerDataService'

const leagueProvider    = new MockLeagueProvider()
const nflDataProvider   = new SleeperNFLDataProvider()
const playerDataService = new NFLPlayerDataService(nflDataProvider)

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App leagueProvider={leagueProvider} playerDataService={playerDataService} />
  </StrictMode>,
)
