import { FantasyTeam, Player } from '../types'

// Pre-optimization state: Zack Moss starts at FLEX, Jaylen Warren is on bench.
// The engine should discover the Warren → Moss swap as the best recommendation.

const lamarJackson: Player = {
  id: 'lamar-jackson',
  name: 'Lamar Jackson',
  team: 'BAL',
  position: 'QB',
  opponent: 'vs LAR',
  projectedPoints: 29.4,
  status: 'active',
}

const bijanRobinson: Player = {
  id: 'bijan-robinson',
  name: 'Bijan Robinson',
  team: 'ATL',
  position: 'RB',
  opponent: 'vs CAR',
  projectedPoints: 22.1,
  status: 'active',
}

const saquonBarkley: Player = {
  id: 'saquon-barkley',
  name: 'Saquon Barkley',
  team: 'PHI',
  position: 'RB',
  opponent: '@ DAL',
  projectedPoints: 18.6,
  status: 'questionable',
}

const jamarrChase: Player = {
  id: 'jamarrchase',
  name: "Ja'Marr Chase",
  team: 'CIN',
  position: 'WR',
  opponent: 'vs TEN',
  projectedPoints: 24.8,
  status: 'active',
}

const tyreekHill: Player = {
  id: 'tyreek-hill',
  name: 'Tyreek Hill',
  team: 'MIA',
  position: 'WR',
  opponent: 'vs NE',
  projectedPoints: 16.3,
  status: 'active',
}

const samLaPorta: Player = {
  id: 'sam-laporta',
  name: 'Sam LaPorta',
  team: 'DET',
  position: 'TE',
  opponent: 'vs GB',
  projectedPoints: 11.9,
  status: 'active',
}

const zackMoss: Player = {
  id: 'zack-moss',
  name: 'Zack Moss',
  team: 'IND',
  position: 'RB',
  opponent: 'vs HOU',
  projectedPoints: 8.4,
  status: 'questionable',
}

const evanMcPherson: Player = {
  id: 'evan-mcpherson',
  name: 'Evan McPherson',
  team: 'CIN',
  position: 'K',
  opponent: 'vs TEN',
  projectedPoints: 9.2,
  status: 'active',
}

const dallasCowboys: Player = {
  id: 'dallas-cowboys-def',
  name: 'Dallas Cowboys',
  team: 'DAL',
  position: 'DEF',
  opponent: 'vs PHI',
  projectedPoints: 5.2,
  status: 'active',
}

const jaylenWarren: Player = {
  id: 'jaylen-warren',
  name: 'Jaylen Warren',
  team: 'PIT',
  position: 'RB',
  opponent: 'vs NYG',
  projectedPoints: 17.2,
  status: 'active',
}

const keenanAllen: Player = {
  id: 'keenan-allen',
  name: 'Keenan Allen',
  team: 'NE',
  position: 'WR',
  opponent: '@ MIA',
  projectedPoints: 7.1,
  status: 'active',
}

const boNix: Player = {
  id: 'bo-nix',
  name: 'Bo Nix',
  team: 'DEN',
  position: 'QB',
  opponent: 'vs KC',
  projectedPoints: 14.2,
  status: 'active',
}

export const mockTeam: FantasyTeam = {
  starters: [
    { slot: 'QB',   player: lamarJackson },
    { slot: 'RB',   player: bijanRobinson },
    { slot: 'RB',   player: saquonBarkley },
    { slot: 'WR',   player: jamarrChase },
    { slot: 'WR',   player: tyreekHill },
    { slot: 'TE',   player: samLaPorta },
    { slot: 'FLEX', player: zackMoss },      // <-- Moss starts; Warren on bench
    { slot: 'K',    player: evanMcPherson },
    { slot: 'DEF',  player: dallasCowboys },
  ],
  bench: [jaylenWarren, keenanAllen, boNix],
}
