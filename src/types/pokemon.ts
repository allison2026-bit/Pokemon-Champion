export type PokemonType =
  | 'Normal' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
  | 'Rock' | 'Ghost' | 'Dragon' | 'Steel' | 'Dark' | 'Fairy';

export type ChampionsTier = 'S+ (賽事超一線)' | 'S (強勢核心)' | 'A+ (主力對策)' | 'A (特定體系)';
export type BattleFormat = 'Double' | 'Single';

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  total: number;
}

export interface ChampionMove {
  nameZh: string;
  nameEn: string;
  type: PokemonType;
  category: 'Physical' | 'Special' | 'Status';
  power: number; // 0 for status
  accuracy: number; // percentage
  description: string;
  tacticalTip: string;
}

export interface ChampionHeldItem {
  id: string;
  nameZh: string;
  nameEn: string;
  effect: string;
  tacticalRole: string;
  iconColor: string;
}

export interface CompetitiveBuild {
  buildNameZh: string;
  format: BattleFormat;
  ability: {
    nameZh: string;
    nameEn: string;
    description: string;
  };
  heldItem: ChampionHeldItem;
  teraType: PokemonType;
  nature: string; // e.g. "爽朗 (+Speed, -SpA)"
  evSpread: string; // e.g. "4 HP / 252 Atk / 252 Spe"
  moves: ChampionMove[]; // 4 moves
  comboTactics: string;
  recommendedPartners: string[]; // Pokemon names or IDs
}

export interface Pokemon {
  id: string;
  pokedexNumber: number;
  nameZh: string;
  nameEn: string;
  nameJa: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  tier: ChampionsTier;
  avatarUrl: string;
  officialArtUrl: string;
  baseStats: BaseStats;
  primaryAbility: {
    nameZh: string;
    nameEn: string;
    description: string;
  };
  hiddenAbility?: {
    nameZh: string;
    nameEn: string;
    description: string;
  };
  builds: CompetitiveBuild[];
  weaknesses: PokemonType[];
  resistances: PokemonType[];
  immunities: PokemonType[];
  winRate: number; // Competitive ladder winrate %
  usageRate: number; // Champions usage rate %
  goodAgainst: string[]; // pokemon IDs
  counteredBy: string[]; // pokemon IDs
  counterAdvice: {
    [opponentId: string]: string;
  };
}

export interface MatchupAnalysisResult {
  myPokemon: Pokemon;
  opponentPokemon: Pokemon;
  format: BattleFormat;
  winRate: number; // 0 - 100%
  advantageTier: '絕對優勢 Major Advantage' | '屬性佔優 Slight Edge' | '勢均力敵 Even Match' | '對位劣勢 Disadvantage' | '嚴重受制 Countered';
  typeMatchup: {
    myOffenseMultiplier: number; // e.g. 2.0x, 1.0x, 0.5x, 0x
    opponentOffenseMultiplier: number;
    summary: string;
  };
  speedAdvantage: {
    winner: 'my' | 'opponent' | 'tie';
    mySpeed: number;
    opponentSpeed: number;
    summary: string;
  };
  statBreakdown: {
    myBulkScore: number;      // 0 - 100
    opponentBulkScore: number;
    myOffenseScore: number;
    opponentOffenseScore: number;
  };
  tacticalDirectives: string[];
  recommendedTeraAdaptation: {
    recommendedTera: PokemonType;
    rationale: string;
  };
  partnerSynergies: {
    recommendedAlly: string;
    synergyReason: string;
  }[];
}
