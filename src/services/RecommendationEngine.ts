import { FantasyTeam, NFLPosition, Recommendation, StarterSlot } from '../types'
import { PlayerDataService } from '../providers/PlayerDataService'

// RB/WR/TE can fill the FLEX slot.
const FLEX_ELIGIBLE = new Set<NFLPosition>(['RB', 'WR', 'TE'])

function eligibleStarters(benchPosition: NFLPosition, starters: StarterSlot[]): StarterSlot[] {
  return starters.filter(
    (s) =>
      s.slot === benchPosition ||
      (s.slot === 'FLEX' && FLEX_ELIGIBLE.has(benchPosition))
  )
}

// Confidence is a simple linear scale: +3 pts → ~60%, +12 pts → ~99%.
function toConfidence(pointGain: number): number {
  return Math.round(Math.min(99, Math.max(50, 58 + pointGain * 3.8)))
}

export const RecommendationEngine = {
  // Swaps playerToStart into the lineup and moves playerToBench to the bench.
  // Pure function — no async work needed.
  apply(team: FantasyTeam, rec: Recommendation): FantasyTeam {
    return {
      starters: team.starters.map((s) =>
        s.player.id === rec.playerToBench.id
          ? { slot: s.slot, player: rec.playerToStart }
          : s
      ),
      bench: team.bench.map((p) =>
        p.id === rec.playerToStart.id ? rec.playerToBench : p
      ),
    }
  },

  // Compares bench players against starters using weekly projections from the
  // PlayerDataService. Returns the single most valuable swap, or null if none exists.
  async optimize(
    team: FantasyTeam,
    playerDataService: PlayerDataService,
  ): Promise<Recommendation | null> {
    let best: Recommendation | null = null

    for (const benchPlayer of team.bench) {
      const benchData = await playerDataService.getWeeklyData(benchPlayer.id)
      if (!benchData) continue

      const candidates = eligibleStarters(benchPlayer.position, team.starters)
      if (candidates.length === 0) continue

      // Find the weakest starter among eligible slots by their weekly projection.
      let weakestSlot: StarterSlot | null = null
      let weakestPoints = Infinity

      for (const candidate of candidates) {
        const starterData = await playerDataService.getWeeklyData(candidate.player.id)
        if (!starterData) continue
        if (starterData.projectedPoints < weakestPoints) {
          weakestPoints = starterData.projectedPoints
          weakestSlot = candidate
        }
      }

      if (!weakestSlot) continue

      const gain = benchData.projectedPoints - weakestPoints
      if (gain <= 0) continue

      if (!best || gain > best.projectedPointGain) {
        best = {
          playerToStart: benchPlayer,
          playerToBench: weakestSlot.player,
          slot: weakestSlot.slot,
          projectedPointGain: gain,
          confidence: toConfidence(gain),
          explanation: 'Higher projected points.',
        }
      }
    }

    return best
  },
}
