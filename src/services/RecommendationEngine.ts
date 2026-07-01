import { FantasyTeam, NFLPosition, Recommendation, StarterSlot } from '../types'

// RB/WR/TE can fill the FLEX slot.
const FLEX_ELIGIBLE = new Set<NFLPosition>(['RB', 'WR', 'TE'])

// Maps a bench player's position to the starter slots they could occupy.
function eligibleStarters(benchPosition: NFLPosition, starters: StarterSlot[]): StarterSlot[] {
  return starters.filter(
    (s) =>
      s.slot === benchPosition ||
      (s.slot === 'FLEX' && FLEX_ELIGIBLE.has(benchPosition))
  )
}

// Confidence is a simple linear scale: +3 pts → ~60%, +12 pts → ~99%.
// Clamped so we never return 0% or 100%.
function toConfidence(pointGain: number): number {
  return Math.round(Math.min(99, Math.max(50, 58 + pointGain * 3.8)))
}

export const RecommendationEngine = {
  // Swaps playerToStart into the lineup and moves playerToBench to the bench.
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

  optimize(team: FantasyTeam): Recommendation | null {
    let best: Recommendation | null = null

    for (const benchPlayer of team.bench) {
      const candidates = eligibleStarters(benchPlayer.position, team.starters)
      if (candidates.length === 0) continue

      // Weakest starter among eligible slots.
      const weakestSlot = candidates.reduce((min, s) =>
        s.player.projectedPoints < min.player.projectedPoints ? s : min
      )

      const gain = benchPlayer.projectedPoints - weakestSlot.player.projectedPoints
      if (gain <= 0) continue

      if (!best || gain > best.projectedPointGain) {
        best = {
          playerToStart: benchPlayer,
          playerToBench: weakestSlot.player,
          slot: weakestSlot.slot,
          projectedPointGain: gain,
          confidence: toConfidence(gain),
          explanation: `Higher projected points.`,
        }
      }
    }

    return best
  },
}
