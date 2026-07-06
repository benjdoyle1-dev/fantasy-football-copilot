import { useEffect, useState } from 'react'
import { FantasyTeam, Recommendation, WeeklyPlayerData } from './types'
import { LeagueProvider } from './providers/LeagueProvider'
import { PlayerDataService } from './providers/PlayerDataService'
import { RecommendationEngine } from './services/RecommendationEngine'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ScoreRow from './components/ScoreRow'
import RecommendationCard from './components/RecommendationCard'
import LineupTable from './components/LineupTable'
import styles from './App.module.css'

interface Props {
  leagueProvider: LeagueProvider
  playerDataService: PlayerDataService
}

// Fetches weekly data for every player on the team and returns it as a lookup map.
async function fetchWeeklyData(
  team: FantasyTeam,
  playerDataService: PlayerDataService,
): Promise<Map<string, WeeklyPlayerData>> {
  const allPlayers = [
    ...team.starters.map((s) => s.player),
    ...team.bench,
  ]
  const entries = await Promise.all(
    allPlayers.map(async (p) => {
      const data = await playerDataService.getWeeklyData(p.id)
      return data ? ([p.id, data] as const) : null
    }),
  )
  return new Map(entries.filter((e): e is [string, WeeklyPlayerData] => e !== null))
}

export default function App({ leagueProvider, playerDataService }: Props) {
  const [team, setTeam] = useState<FantasyTeam | null>(null)
  const [weeklyData, setWeeklyData] = useState<Map<string, WeeklyPlayerData>>(new Map())
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)

  useEffect(() => {
    leagueProvider.getTeam().then(async (loadedTeam) => {
      const data = await fetchWeeklyData(loadedTeam, playerDataService)
      const rec = await RecommendationEngine.optimize(loadedTeam, playerDataService)
      setTeam(loadedTeam)
      setWeeklyData(data)
      setRecommendation(rec)
    })
  }, [leagueProvider, playerDataService])

  async function handleApply() {
    if (!recommendation || !team) return
    const updatedTeam = RecommendationEngine.apply(team, recommendation)
    const [data, rec] = await Promise.all([
      fetchWeeklyData(updatedTeam, playerDataService),
      RecommendationEngine.optimize(updatedTeam, playerDataService),
    ])
    setTeam(updatedTeam)
    setWeeklyData(data)
    setRecommendation(rec)
  }

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <ScoreRow />
        <RecommendationCard recommendation={recommendation} weeklyData={weeklyData} />
        {team && (
          <LineupTable
            team={team}
            weeklyData={weeklyData}
            recommendation={recommendation}
            onApply={handleApply}
          />
        )}
      </main>
      <Sidebar />
    </div>
  )
}
