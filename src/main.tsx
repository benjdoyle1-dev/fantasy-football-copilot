import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { MockLeagueProvider } from './providers/MockLeagueProvider'
import { MockPlayerDataService } from './providers/MockPlayerDataService'

const leagueProvider    = new MockLeagueProvider()
const playerDataService = new MockPlayerDataService()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App leagueProvider={leagueProvider} playerDataService={playerDataService} />
  </StrictMode>,
)
