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

export interface Recommendation {
  playerToStart: Player
  playerToBench: Player
  slot: LineupSlot
  projectedPointGain: number
  confidence: number  // 0–100
  explanation: string
}
