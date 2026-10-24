import { Pokemon, PokemonType, MatchupAnalysisResult, BattleFormat } from '../types/pokemon';

// 18-Type complete effectiveness chart in competitive Pokémon
// Format: TYPE_CHART[attackerType][defenderType] = damage multiplier
const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

export function getTypeMultiplier(attackerType: PokemonType, defenderTypes: PokemonType[]): number {
  let multiplier = 1.0;
  for (const defType of defenderTypes) {
    const chartVal = TYPE_CHART[attackerType]?.[defType];
    if (chartVal !== undefined) {
      multiplier *= chartVal;
    }
  }
  return multiplier;
}

export function getMaxOffensiveMultiplier(attackerTypes: PokemonType[], defenderTypes: PokemonType[]): number {
  let maxMult = 1.0;
  for (const atkType of attackerTypes) {
    const mult = getTypeMultiplier(atkType, defenderTypes);
    if (mult > maxMult) {
      maxMult = mult;
    }
  }
  return maxMult;
}

export const ALL_18_TYPES: PokemonType[] = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy',
];

export function calculateTypeRelations(defenderTypes: PokemonType[]): {
  weaknesses: PokemonType[];
  resistances: PokemonType[];
  immunities: PokemonType[];
} {
  const weaknesses: PokemonType[] = [];
  const resistances: PokemonType[] = [];
  const immunities: PokemonType[] = [];

  for (const atk of ALL_18_TYPES) {
    const mult = getTypeMultiplier(atk, defenderTypes);
    if (mult === 0) {
      immunities.push(atk);
    } else if (mult > 1.0) {
      weaknesses.push(atk);
    } else if (mult < 1.0) {
      resistances.push(atk);
    }
  }

  return { weaknesses, resistances, immunities };
}

export function calculateChampionsMatchup(
  myPokemon: Pokemon,
  opponentPokemon: Pokemon,
  format: BattleFormat = 'Double'
): MatchupAnalysisResult {
  // 1. Calculate Offensive and Defensive Type Multipliers
  const myOffenseMultiplier = getMaxOffensiveMultiplier(myPokemon.types, opponentPokemon.types);
  const opponentOffenseMultiplier = getMaxOffensiveMultiplier(opponentPokemon.types, myPokemon.types);

  let typeAdvantageDelta = (myOffenseMultiplier - opponentOffenseMultiplier) * 7.5;

  // 2. Base Stat Total & Speed Advantage
  const mySpeed = myPokemon.baseStats.speed;
  const oppSpeed = opponentPokemon.baseStats.speed;
  const speedAdvantage = mySpeed > oppSpeed ? 'my' : mySpeed < oppSpeed ? 'opponent' : 'tie';
  const speedDelta = (mySpeed - oppSpeed) * 0.12;

  // 3. Ability & Item Synergy Overrides
  let specialMechanicDelta = 0;
  // Gholdengo Good as Gold immunity
  if (myPokemon.id === 'gholdengo' && opponentPokemon.id === 'amoonguss') {
    specialMechanicDelta += 14; // Complete spore immunity
  }
  if (opponentPokemon.id === 'gholdengo' && myPokemon.id === 'amoonguss') {
    specialMechanicDelta -= 14;
  }

  // Incineroar Fake Out & Intimidate vs Physicals
  if (myPokemon.id === 'incineroar' && opponentPokemon.baseStats.attack > opponentPokemon.baseStats.spAttack) {
    specialMechanicDelta += 8;
  }
  if (opponentPokemon.id === 'incineroar' && myPokemon.baseStats.attack > myPokemon.baseStats.spAttack) {
    specialMechanicDelta -= 8;
  }

  // Chien-Pao Sword of Ruin + Dragonite Normal Tera
  if (myPokemon.id === 'dragonite' && opponentPokemon.types.includes('Ghost')) {
    specialMechanicDelta -= 10; // Normal e-speed blocked by ghost
  }

  // Direct counters
  if (myPokemon.goodAgainst?.includes(opponentPokemon.id)) {
    specialMechanicDelta += 8.0;
  }
  if (myPokemon.counteredBy?.includes(opponentPokemon.id)) {
    specialMechanicDelta -= 8.0;
  }

  // Calculate final winrate percentage clamped between 25.0% and 75.0%
  const baseWinDelta = (myPokemon.winRate - opponentPokemon.winRate) * 0.8;
  const rawWinRate = 50.0 + baseWinDelta + typeAdvantageDelta + speedDelta + specialMechanicDelta;
  const clampedWinRate = Math.min(74.0, Math.max(26.0, Math.round(rawWinRate * 10) / 10));

  // Determine Advantage Tier
  let advantageTier: MatchupAnalysisResult['advantageTier'] = '勢均力敵 Even Match';
  if (clampedWinRate >= 62.0) {
    advantageTier = '絕對優勢 Major Advantage';
  } else if (clampedWinRate >= 53.0) {
    advantageTier = '屬性佔優 Slight Edge';
  } else if (clampedWinRate <= 38.0) {
    advantageTier = '嚴重受制 Countered';
  } else if (clampedWinRate <= 47.0) {
    advantageTier = '對位劣勢 Disadvantage';
  }

  // Tactical Directives
  const tacticalDirectives: string[] = [];

  if (myPokemon.counterAdvice?.[opponentPokemon.id]) {
    tacticalDirectives.push(`【核心對位錦囊】：${myPokemon.counterAdvice[opponentPokemon.id]}`);
  }

  if (speedAdvantage === 'my') {
    tacticalDirectives.push(`【速度先手主動】：${myPokemon.nameZh} 基準速度 (${mySpeed}) 高於 ${opponentPokemon.nameZh} (${oppSpeed})，具備絕對先手進攻或換人權，可利用本系高威力招式直接實施壓迫。`);
  } else if (speedAdvantage === 'opponent') {
    tacticalDirectives.push(`【後手反打對策】：${opponentPokemon.nameZh} 基準速度更具優勢，第一回合需嚴防先手爆發，建議第一回合「守住」觀察，或透過氣勢披帶/多重鱗片換取輸出回合。`);
  }

  if (myOffenseMultiplier >= 2.0) {
    tacticalDirectives.push(`【屬性致命破防】：我方本系招式對 ${opponentPokemon.nameZh} 具備高達 ${myOffenseMultiplier}x 的屬性剋制倍率，是突破其防線的最大突破口！`);
  } else if (myOffenseMultiplier <= 0.5) {
    tacticalDirectives.push(`【屬性逆境注意】：我方本系招式被 ${opponentPokemon.nameZh} 屬性抵抗 (${myOffenseMultiplier}x)，應使用補盲招式或呼叫聯手隊友進行屬性輪轉。`);
  }

  tacticalDirectives.push(`【首回合節奏預判】：在 ${format === 'Double' ? '雙打 (VGC)' : '單打'} 環境中，需精確預讀 ${opponentPokemon.nameZh} 的攜帶道具（如氣勢披帶、講究圍巾或驅勁能量），避免因傷害計算過溢而錯失擊倒時機。`);

  // Recommended Tera Adaptation
  let recommendedTera: PokemonType = 'Steel';
  let teraRationale = '';

  if (opponentPokemon.types.includes('Fairy') || opponentPokemon.types.includes('Dragon')) {
    recommendedTera = 'Steel';
    teraRationale = `面對 ${opponentPokemon.nameZh}，太晶鋼可將妖精/龍屬性傷害減半，並大幅提高自身防禦抗性。`;
  } else if (opponentPokemon.types.includes('Water') || opponentPokemon.types.includes('Ground')) {
    recommendedTera = 'Grass';
    teraRationale = `太晶草可免疫孢子催眠並抵抗地面與水屬性重砲。`;
  } else if (myPokemon.id === 'dragonite') {
    recommendedTera = 'Normal';
    teraRationale = `快龍太晶一般可讓本系「神速」威力翻倍為 2.0x，達到一擊秒殺的效果。`;
  } else {
    recommendedTera = 'Water';
    teraRationale = `太晶水具備優秀的單一水屬性抗性（僅弱草電），是高分段最泛用的輪轉太晶防禦選擇。`;
  }

  // Recommended Ally Partner
  const partnerSynergies = [
    {
      recommendedAlly: myPokemon.builds[0]?.recommendedPartners[0] || '熾焰咆哮虎',
      synergyReason: '【宇宙第一聯手軸】：提供威嚇降物攻與擊掌奇襲掩護，完美填補輸出與防守節奏。',
    },
    {
      recommendedAlly: myPokemon.builds[0]?.recommendedPartners[1] || '快龍',
      synergyReason: '【物特雙核推進軸】：形成物理與特殊攻擊雙向壓制，令對手無法單純依靠防禦盾牌防守。',
    },
  ];

  return {
    myPokemon,
    opponentPokemon,
    format,
    winRate: clampedWinRate,
    advantageTier,
    typeMatchup: {
      myOffenseMultiplier,
      opponentOffenseMultiplier,
      summary: myOffenseMultiplier > opponentOffenseMultiplier
        ? `我方打擊優勢（造成 ${myOffenseMultiplier}x 傷害 vs 承受 ${opponentOffenseMultiplier}x 傷害）`
        : myOffenseMultiplier < opponentOffenseMultiplier
        ? `對手打擊優勢（承受 ${opponentOffenseMultiplier}x 傷害 vs 造成 ${myOffenseMultiplier}x 傷害）`
        : `屬性均勢（雙方打擊倍率相當）`,
    },
    speedAdvantage: {
      winner: speedAdvantage,
      mySpeed,
      opponentSpeed: oppSpeed,
      summary: speedAdvantage === 'my'
        ? `我方速度領先 (+${mySpeed - oppSpeed} Spe)`
        : speedAdvantage === 'opponent'
        ? `對手速度更快 (+${oppSpeed - mySpeed} Spe)`
        : '速度同速',
    },
    statBreakdown: {
      myBulkScore: Math.min(100, Math.round(((myPokemon.baseStats.hp * (myPokemon.baseStats.defense + myPokemon.baseStats.spDefense)) / 250))),
      opponentBulkScore: Math.min(100, Math.round(((opponentPokemon.baseStats.hp * (opponentPokemon.baseStats.defense + opponentPokemon.baseStats.spDefense)) / 250))),
      myOffenseScore: Math.min(100, Math.round((Math.max(myPokemon.baseStats.attack, myPokemon.baseStats.spAttack) / 1.5))),
      opponentOffenseScore: Math.min(100, Math.round((Math.max(opponentPokemon.baseStats.attack, opponentPokemon.baseStats.spAttack) / 1.5))),
    },
    tacticalDirectives,
    recommendedTeraAdaptation: {
      recommendedTera,
      rationale: teraRationale,
    },
    partnerSynergies,
  };
}

// Backward-compatible alias
export const calculateMatchup = calculateChampionsMatchup;

export interface TeamEvaluationReport {
  overallSynergyScore: number; // 0 - 100
  typeCoverageScore: number;
  speedControlScore: number;
  bulkBalanceScore: number;
  strengths: string[];
  weaknesses: string[];
  tacticalAdvice: string;
}

export function evaluateTeamComposition(
  myTeam: (Pokemon | null)[],
  enemyTeam: (Pokemon | null)[]
): TeamEvaluationReport {
  const activeMy = myTeam.filter((p): p is Pokemon => p !== null);
  const activeEnemy = enemyTeam.filter((p): p is Pokemon => p !== null);

  if (activeMy.length === 0) {
    return {
      overallSynergyScore: 50,
      typeCoverageScore: 50,
      speedControlScore: 50,
      bulkBalanceScore: 50,
      strengths: ['尚未選擇足夠的寶可夢'],
      weaknesses: ['需要至少配置核心寶可夢以展開戰力評估'],
      tacticalAdvice: '請在陣容中添加寶可夢以獲得 Champions 賽事級別陣容分析。',
    };
  }

  // Type variety
  const uniqueTypes = new Set<PokemonType>();
  activeMy.forEach(p => p.types.forEach(t => uniqueTypes.add(t)));
  const typeCoverageScore = Math.min(100, Math.round((uniqueTypes.size / 6) * 100));

  // Average speed
  const avgSpeed = activeMy.reduce((acc, p) => acc + p.baseStats.speed, 0) / activeMy.length;
  const speedControlScore = Math.min(100, Math.max(30, Math.round((avgSpeed / 120) * 100)));

  // Bulk balance
  const avgBulk = activeMy.reduce((acc, p) => acc + (p.baseStats.hp + p.baseStats.defense + p.baseStats.spDefense), 0) / activeMy.length;
  const bulkBalanceScore = Math.min(100, Math.max(30, Math.round((avgBulk / 300) * 100)));

  const overallSynergyScore = Math.round((typeCoverageScore * 0.4) + (speedControlScore * 0.3) + (bulkBalanceScore * 0.3));

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (uniqueTypes.size >= 5) {
    strengths.push('屬性聯防體系完整，涵蓋多種打擊面與防禦抗性');
  }
  if (activeMy.some(p => p.id === 'incineroar' || p.id === 'landorus_t')) {
    strengths.push('具備威嚇特性控場軸，大幅降低對手全體物理傷害威脅');
  }
  if (activeMy.some(p => p.id === 'flutter_mane' || p.id === 'urshifu_rapid')) {
    strengths.push('具備頂級高速/穿透收割爆發點');
  }

  if (uniqueTypes.size < 4) {
    weaknesses.push('屬性重複度較高，容易被特定屬性（如地面/水/妖精）聯防貫穿');
  }
  if (!activeMy.some(p => p.baseStats.speed >= 110)) {
    weaknesses.push('缺乏 110+ 極速先手打手，需依賴順風或空間等控速手段');
  }

  return {
    overallSynergyScore,
    typeCoverageScore,
    speedControlScore,
    bulkBalanceScore,
    strengths: strengths.length > 0 ? strengths : ['陣容具備基本作戰能力'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['防守聯防無明顯盲點'],
    tacticalAdvice: activeEnemy.length > 0
      ? `面對敵方陣容，我方應重點以 ${activeMy[0]?.nameZh || '核心寶可夢'} 為發動機，注意太晶屬性保護與首回合擊掌奇襲/守住博弈。`
      : '建議在首發中配置一名兼具威嚇或控場能力的中速肉盾，搭配一名高速特攻/物攻爆發手。',
  };
}
