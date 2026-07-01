import { useEffect, useState } from 'react'
import { FantasyTeam, Recommendation } from './types'
import { mockTeam } from './data/mockTeam'
import { RecommendationEngine } from './services/RecommendationEngine'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ScoreRow from './components/ScoreRow'
import RecommendationCard from './components/RecommendationCard'
import LineupTable from './components/LineupTable'
import styles from './App.module.css'

export default function App() {
  const [team, setTeam] = useState<FantasyTeam>(mockTeam)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)

  useEffect(() => {
    setRecommendation(RecommendationEngine.optimize(team))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleApply() {
    if (!recommendation) return
    const updatedTeam = RecommendationEngine.apply(team, recommendation)
    setTeam(updatedTeam)
    setRecommendation(RecommendationEngine.optimize(updatedTeam))
  }

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <ScoreRow />
        <RecommendationCard recommendation={recommendation} />
        <LineupTable team={team} recommendation={recommendation} onApply={handleApply} />
      </main>
      <Sidebar />
    </div>
  )
}
