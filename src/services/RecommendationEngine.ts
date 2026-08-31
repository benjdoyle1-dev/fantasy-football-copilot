import {
  FantasyTeam,
  LineupChange,
  NFLPosition,
  Recommendation,
  RecommendationReason,
  StarterSlot,
  WeeklyPlayerData,
  Player,
  LineupSlot,
} from '../types'
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

// Confidence weighs projection advantage, injury risk of the player being sat,
// and uncertainty around the incoming player's health.
function computeConfidence(
  gain: number,
  incomingData: WeeklyPlayerData,
  sittingData: WeeklyPlayerData,
): number {
  let score = 52
  score += Math.min(42, gain * 4)                               // projection advantage, capped
  if (sittingData.injuryStatus !== 'active') score += 6        // extra value in benching a risky player
  if (incomingData.injuryStatus === 'questionable') score -= 15 // uncertainty in the new starter
  if (incomingData.injuryStatus === 'out') score -= 40         // should never start an injured player
  return Math.round(Math.min(99, Math.max(10, score)))
}

function buildReasons(
  playerToStart: Player,
  playerToBench: Player,
  incomingData: WeeklyPlayerData,
  sittingData: WeeklyPlayerData,
  slot: LineupSlot,
): RecommendationReason[] {
  const reasons: RecommendationReason[] = []
  const gain = incomingData.projectedPoints - sittingData.projectedPoints

  // Projection difference is always the primary reason.
  reasons.push({
    type: 'PROJECTION',
    title: 'Higher projected points',
    description: `${playerToStart.name} projects ${gain.toFixed(1)} more points than ${playerToBench.name} this week.`,
    impact: gain >= 6 ? 'HIGH' : gain >= 3 ? 'MEDIUM' : 'LOW',
  })

  // Injury status of the player being sat.
  if (sittingData.injuryStatus === 'out') {
    reasons.push({
      type: 'INJURY',
      title: `${playerToBench.name} is ruled out`,
      description: `${playerToBench.name} will not play this week and is projected to score 0 points.`,
      impact: 'HIGH',
    })
  } else if (sittingData.injuryStatus === 'questionable') {
    reasons.push({
      type: 'INJURY',
      title: `${playerToBench.name} is questionable`,
      description: `${playerToBench.name} carries injury risk this week, which may reduce their actual output.`,
      impact: 'MEDIUM',
    })
  }

  // Injury caution for the incoming player.
  if (incomingData.injuryStatus === 'questionable') {
    reasons.push({
      type: 'INJURY',
      title: `${playerToStart.name} is questionable`,
      description: `Monitor ${playerToStart.name}'s status before kickoff — they are listed as questionable.`,
      impact: 'MEDIUM',
    })
  }

  // FLEX eligibility is worth calling out when it applies.
  if (slot === 'FLEX') {
    reasons.push({
      type: 'POSITION',
      title: `${playerToStart.name} qualifies for FLEX`,
      description: `As a ${playerToStart.position}, ${playerToStart.name} is eligible to fill the FLEX slot.`,
      impact: 'LOW',
    })
  }

  return reasons
}

export const RecommendationEngine = {
  // Swaps playerToStart into the lineup and moves playerToBench to the bench.
  apply(team: FantasyTeam, rec: Recommendation): FantasyTeam {
    const { playerToStart, playerToBench } = rec.lineup
    return {
      name: team.name,
      starters: team.starters.map((s) =>
        s.player.id === playerToBench.id
          ? { slot: s.slot, player: playerToStart }
          : s
      ),
      bench: team.bench.map((p) =>
        p.id === playerToStart.id ? playerToBench : p
      ),
    }
  },

  // Finds the single most valuable swap available on the bench.
  // Fetches all starters' weekly data upfront so it can report team-level
  // projected totals before and after the swap.
  async optimize(
    team: FantasyTeam,
    playerDataService: PlayerDataService,
  ): Promise<Recommendation | null> {
    // Pre-fetch weekly data for every starter.
    const starterDataMap = new Map<string, WeeklyPlayerData>()
    for (const { player } of team.starters) {
      const data = await playerDataService.getWeeklyData(player.id)
      if (data) starterDataMap.set(player.id, data)
    }

    const projectedPointsBefore = [...starterDataMap.values()].reduce(
      (sum, d) => sum + d.projectedPoints,
      0,
    )

    // Find the bench player whose swap produces the greatest projected gain.
    let bestSwap: {
      change: LineupChange
      incomingData: WeeklyPlayerData
      sittingData: WeeklyPlayerData
      gain: number
    } | null = null

    for (const benchPlayer of team.bench) {
      const incomingData = await playerDataService.getWeeklyData(benchPlayer.id)
      if (!incomingData) continue

      const candidates = eligibleStarters(benchPlayer.position, team.starters)
      if (candidates.length === 0) continue

      for (const candidate of candidates) {
        const sittingData = starterDataMap.get(candidate.player.id)
        if (!sittingData) continue

        const gain = incomingData.projectedPoints - sittingData.projectedPoints
        if (gain <= 0) continue

        if (!bestSwap || gain > bestSwap.gain) {
          bestSwap = {
            change: {
              playerToStart: benchPlayer,
              playerToBench: candidate.player,
              slot: candidate.slot,
            },
            incomingData,
            sittingData,
            gain,
          }
        }
      }
    }

    if (!bestSwap) return null

    const { change, incomingData, sittingData, gain } = bestSwap
    const roundedGain = Math.round(gain * 10) / 10

    return {
      lineup: change,
      projectedPointsBefore: Math.round(projectedPointsBefore * 10) / 10,
      projectedPointsAfter: Math.round((projectedPointsBefore + gain) * 10) / 10,
      projectedGain: roundedGain,
      confidence: computeConfidence(gain, incomingData, sittingData),
      reasons: buildReasons(
        change.playerToStart,
        change.playerToBench,
        incomingData,
        sittingData,
        change.slot,
      ),
    }
  },
}
