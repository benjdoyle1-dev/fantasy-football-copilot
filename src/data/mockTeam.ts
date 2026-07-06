import { FantasyTeam, Player } from '../types'

// Pre-optimization state: Zack Moss starts at FLEX, Jaylen Warren is on bench.
// Only permanent identity fields live here — weekly data is in mockWeeklyData.ts.

const lamarJackson:   Player = { id: 'lamar-jackson',      name: 'Lamar Jackson',   team: 'BAL', position: 'QB'  }
const bijanRobinson:  Player = { id: 'bijan-robinson',     name: 'Bijan Robinson',  team: 'ATL', position: 'RB'  }
const saquonBarkley:  Player = { id: 'saquon-barkley',     name: 'Saquon Barkley',  team: 'PHI', position: 'RB'  }
const jamarrChase:    Player = { id: 'jamarrchase',         name: "Ja'Marr Chase",   team: 'CIN', position: 'WR'  }
const tyreekHill:     Player = { id: 'tyreek-hill',         name: 'Tyreek Hill',     team: 'MIA', position: 'WR'  }
const samLaPorta:     Player = { id: 'sam-laporta',         name: 'Sam LaPorta',     team: 'DET', position: 'TE'  }
const zackMoss:       Player = { id: 'zack-moss',           name: 'Zack Moss',       team: 'IND', position: 'RB'  }
const evanMcPherson:  Player = { id: 'evan-mcpherson',     name: 'Evan McPherson',  team: 'CIN', position: 'K'   }
const dallasCowboys:  Player = { id: 'dallas-cowboys-def', name: 'Dallas Cowboys',  team: 'DAL', position: 'DEF' }
const jaylenWarren:   Player = { id: 'jaylen-warren',      name: 'Jaylen Warren',   team: 'PIT', position: 'RB'  }
const keenanAllen:    Player = { id: 'keenan-allen',       name: 'Keenan Allen',    team: 'NE',  position: 'WR'  }
const boNix:          Player = { id: 'bo-nix',             name: 'Bo Nix',          team: 'DEN', position: 'QB'  }

export const mockTeam: FantasyTeam = {
  starters: [
    { slot: 'QB',   player: lamarJackson  },
    { slot: 'RB',   player: bijanRobinson },
    { slot: 'RB',   player: saquonBarkley },
    { slot: 'WR',   player: jamarrChase   },
    { slot: 'WR',   player: tyreekHill    },
    { slot: 'TE',   player: samLaPorta    },
    { slot: 'FLEX', player: zackMoss      }, // Moss starts; Warren on bench
    { slot: 'K',    player: evanMcPherson },
    { slot: 'DEF',  player: dallasCowboys },
  ],
  bench: [jaylenWarren, keenanAllen, boNix],
}
