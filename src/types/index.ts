// A player's actual NFL position — never includes FLEX, which is a lineup slot.
export type NFLPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF'

// Lineup slots extend NFL positions with FLEX.
export type LineupSlot = NFLPosition | 'FLEX'

export type InjuryStatus = 'active' | 'questionable' | 'out'

// Permanent player identity — does not change week to week.
export interface Player {
  id: string
  name: string
  team: string
  position: NFLPosition
}

// Week-specific data for a player — sourced separately from player identity.
export interface WeeklyPlayerData {
  playerId: string
  projectedPoints: number
  opponent: string
  injuryStatus: InjuryStatus
  weather: string | null
  gameTime: string | null
}

// Pairs a player with the slot they occupy in the starting lineup.
export interface StarterSlot {
  slot: LineupSlot
  player: Player
}

export interface FantasyTeam {
  starters: StarterSlot[]
  bench: Player[]
}

// ─── Recommendation reasoning ─────────────────────────────────────────────────

export type ReasonType = 'INJURY' | 'PROJECTION' | 'MATCHUP' | 'WEATHER' | 'POSITION' | 'OTHER'
export type ReasonImpact = 'LOW' | 'MEDIUM' | 'HIGH'

// A single factor that contributed to the recommendation. Structured so that a
// future LLM step can narrate verified facts rather than having to infer them.
export interface RecommendationReason {
  type: ReasonType
  title: string
  description: string
  impact: ReasonImpact
}

// The swap the engine recommends.
export interface LineupChange {
  playerToStart: Player
  playerToBench: Player
  slot: LineupSlot
}

export interface Recommendation {
  lineup: LineupChange
  projectedPointsBefore: number   // total starters' projected pts before the swap
  projectedPointsAfter: number    // same with the swap applied
  projectedGain: number           // projectedPointsAfter − projectedPointsBefore
  confidence: number              // 0–100
  reasons: RecommendationReason[]
}
