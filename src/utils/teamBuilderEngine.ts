import { Pokemon, PokemonType } from '../types/pokemon';
import { POKEMON_LIST } from '../data/pokemonData';
import { getMaxOffensiveMultiplier, ALL_18_TYPES } from './matchupEngine';

export interface RecommendedTeamMember {
  pokemon: Pokemon;
  roleTitle: string;
  roleBadge: string;
  targetOpponents: Pokemon[];
  counterRationale: string;
  speedCompare: string;
  keyMove: string;
}

export interface TeamMatchupMatrixCell {
  myPokemonId: string;
  opponentPokemonId: string;
  myOffenseMult: number; // e.g. 2, 4, 1, 0.5, 0
  opponentOffenseMult: number;
  status: 'advantage' | 'even' | 'disadvantage';
  tip: string;
}

export interface TeamTacticsAnalysis {
  winRate: number; // 0 - 100
  advantageTier: string;
  leadRecommendation: {
    leadPokemon: [Pokemon, Pokemon];
    leadStrategy: string;
  };
  threatAnalysis: {
    highestThreat: Pokemon;
    threatReason: string;
    counterSolution: string;
  };
  teraPriority: {
    recommendedPokemon: Pokemon;
    teraType: PokemonType;
    rationale: string;
  };
  speedTiers: {
    pokemon: Pokemon;
    isMyTeam: boolean;
    speed: number;
    speedRank: number;
  }[];
  speechSummary: string;
}

/**
 * Automatically recommends 6 optimal counter Pokémon against the opponent's 6 Pokémon team
 */
export function recommendCounterTeam(opponentTeam: Pokemon[]): RecommendedTeamMember[] {
  if (!opponentTeam || opponentTeam.length === 0) {
    // Fallback default team if empty
    return getDefaultRecommendedTeam();
  }

  // 1. Analyze opponent weaknesses and type frequencies
  const weaknessCount: Partial<Record<PokemonType, number>> = {};
  opponentTeam.forEach((opp) => {
    opp.weaknesses.forEach((w) => {
      weaknessCount[w] = (weaknessCount[w] || 0) + 1;
    });
  });

  // Sort candidate Pokémon by how well they counter the opponent's team
  const candidatesWithScore = POKEMON_LIST.map((cand) => {
    let score = 0;
    const targetedOpponents: Pokemon[] = [];

    // Check offensive coverage against each opponent
    opponentTeam.forEach((opp) => {
      const offMult = getMaxOffensiveMultiplier(cand.types, opp.types);
      const defMult = getMaxOffensiveMultiplier(opp.types, cand.types);

      if (offMult >= 2.0) {
        score += offMult === 4.0 ? 35 : 20;
        targetedOpponents.push(opp);
      } else if (offMult === 1.0) {
        score += 5;
      }

      // Defensive resistance
      if (defMult <= 0.5) {
        score += defMult === 0 ? 25 : 15;
      } else if (defMult >= 2.0) {
        score -= 10;
      }
    });

    // Tier bonuses
    if (cand.tier.includes('S+')) score += 15;
    else if (cand.tier.includes('S ')) score += 10;
    else if (cand.tier.includes('A+')) score += 5;

    // Speed bonus
    if (cand.baseStats.speed >= 110) score += 8;

    return {
      cand,
      score,
      targetedOpponents,
    };
  });

  // Sort descending by score
  candidatesWithScore.sort((a, b) => b.score - a.score);

  const selectedMembers: RecommendedTeamMember[] = [];
  const chosenIds = new Set<string>();

  // Ensure we don't choose Pokémon identical to opponent if avoidable
  const opponentIdSet = new Set(opponentTeam.map((p) => p.id));

  // Role 1: 先發速度壓制手 (Lead Disruptor) - Speed >= 110
  const leadCandidate = candidatesWithScore.find(
    (c) => !chosenIds.has(c.cand.id) && c.cand.baseStats.speed >= 110
  ) || candidatesWithScore[0];
  if (leadCandidate) {
    chosenIds.add(leadCandidate.cand.id);
    const keyMove = leadCandidate.cand.builds[0]?.moves[0]?.nameZh || '主力先制/控速招式';
    selectedMembers.push({
      pokemon: leadCandidate.cand,
      roleTitle: '先發速度壓制手',
      roleBadge: '⚡ 先發先手權',
      targetOpponents: leadCandidate.targetedOpponents.slice(0, 3),
      counterRationale: `速度高達 ${leadCandidate.cand.baseStats.speed}，具備超高速壓制力，開局先手發動【${keyMove}】破除對手氣勢披帶並掌控第一回合節奏。`,
      speedCompare: `速 ${leadCandidate.cand.baseStats.speed}（領先多數對手）`,
      keyMove,
    });
  }

  // Role 2: 極限物攻破盾手 (Physical Wallbreaker) - Attack >= 120 or high Physical
  const physCandidate = candidatesWithScore.find(
    (c) =>
      !chosenIds.has(c.cand.id) &&
      (c.cand.baseStats.attack >= 115 || c.cand.id === 'chien_pao' || c.cand.id === 'urshifu_rapid' || c.cand.id === 'zacian')
  ) || candidatesWithScore.find((c) => !chosenIds.has(c.cand.id));
  if (physCandidate) {
    chosenIds.add(physCandidate.cand.id);
    const keyMove = physCandidate.cand.builds[0]?.moves.find((m) => m.category === 'Physical')?.nameZh || '極限物理斬殺招';
    selectedMembers.push({
      pokemon: physCandidate.cand,
      roleTitle: '極限物攻破盾手',
      roleBadge: '🥊 物理極限破盾',
      targetOpponents: physCandidate.targetedOpponents.slice(0, 3),
      counterRationale: `物攻種族值達 ${physCandidate.cand.baseStats.attack}，強力貫穿敵方特防盾牌，專責壓制對方特攻核心並提供實體斬殺線。`,
      speedCompare: `速 ${physCandidate.cand.baseStats.speed}`,
      keyMove,
    });
  }

  // Role 3: 極限特攻清場手 (Special Sweeper) - SpAttack >= 120
  const specCandidate = candidatesWithScore.find(
    (c) =>
      !chosenIds.has(c.cand.id) &&
      (c.cand.baseStats.spAttack >= 115 || c.cand.id === 'chi_yu' || c.cand.id === 'gholdengo' || c.cand.id === 'flutter_mane')
  ) || candidatesWithScore.find((c) => !chosenIds.has(c.cand.id));
  if (specCandidate) {
    chosenIds.add(specCandidate.cand.id);
    const keyMove = specCandidate.cand.builds[0]?.moves.find((m) => m.category === 'Special')?.nameZh || '大範圍特攻轟炸';
    selectedMembers.push({
      pokemon: specCandidate.cand,
      roleTitle: '極限特攻清場手',
      roleBadge: '💥 特攻範圍重砲',
      targetOpponents: specCandidate.targetedOpponents.slice(0, 3),
      counterRationale: `特攻高達 ${specCandidate.cand.baseStats.spAttack}，配合【${specCandidate.cand.builds[0]?.heldItem.nameZh || '專屬道具'}】形成恐怖火力覆蓋，殘局直接橫掃敵方。`,
      speedCompare: `速 ${specCandidate.cand.baseStats.speed}`,
      keyMove,
    });
  }

  // Role 4: 耐久威嚇聯防盾牌 (Bulky Pivot & Utility Tank)
  const tankCandidate = candidatesWithScore.find(
    (c) =>
      !chosenIds.has(c.cand.id) &&
      (c.cand.id === 'incineroar' ||
        c.cand.id === 'amoonguss' ||
        c.cand.id === 'ting_lu' ||
        c.cand.id === 'vaporeon' ||
        c.cand.baseStats.hp + c.cand.baseStats.defense + c.cand.baseStats.spDefense >= 300)
  ) || candidatesWithScore.find((c) => !chosenIds.has(c.cand.id));
  if (tankCandidate) {
    chosenIds.add(tankCandidate.cand.id);
    const keyMove = tankCandidate.cand.builds[0]?.moves.find((m) => m.category === 'Status' || m.nameZh.includes('擊掌') || m.nameZh.includes('守住'))?.nameZh || '輪轉防守招式';
    selectedMembers.push({
      pokemon: tankCandidate.cand,
      roleTitle: '威嚇耐久聯防盾牌',
      roleBadge: '🛡️ 核心換人輪轉',
      targetOpponents: tankCandidate.targetedOpponents.slice(0, 3),
      counterRationale: `極致三防三圍綜合值 ${tankCandidate.cand.baseStats.hp + tankCandidate.cand.baseStats.defense + tankCandidate.cand.baseStats.spDefense}，具備【${tankCandidate.cand.primaryAbility.nameZh}】輪轉能力，穩吃敵方爆發攻勢。`,
      speedCompare: `速 ${tankCandidate.cand.baseStats.speed}`,
      keyMove,
    });
  }

  // Role 5: 體系終結核心 (Core Anchor / Win Condition)
  const anchorCandidate = candidatesWithScore.find(
    (c) =>
      !chosenIds.has(c.cand.id) &&
      (c.cand.tier.includes('S+') || c.cand.baseStats.total >= 600)
  ) || candidatesWithScore.find((c) => !chosenIds.has(c.cand.id));
  if (anchorCandidate) {
    chosenIds.add(anchorCandidate.cand.id);
    const keyMove = anchorCandidate.cand.builds[0]?.moves[0]?.nameZh || '強攻絕招';
    selectedMembers.push({
      pokemon: anchorCandidate.cand,
      roleTitle: '體系核心終結者',
      roleBadge: '👑 決賽終結收割',
      targetOpponents: anchorCandidate.targetedOpponents.slice(0, 3),
      counterRationale: `種族值總合高達 ${anchorCandidate.cand.baseStats.total}，身為【${anchorCandidate.cand.tier.split(' ')[0]}】王牌，擔任中後期斬殺與太晶化逆轉的終結支柱。`,
      speedCompare: `速 ${anchorCandidate.cand.baseStats.speed}`,
      keyMove,
    });
  }

  // Role 6: 特化對策手 (Tech Counter for Opponent's #1 Threat)
  // Identify opponent with highest BST or highest threat
  const sortedOpponents = [...opponentTeam].sort((a, b) => b.baseStats.total - a.baseStats.total);
  const primaryThreat = sortedOpponents[0];

  const techCandidate = candidatesWithScore.find((c) => {
    if (chosenIds.has(c.cand.id)) return false;
    if (!primaryThreat) return true;
    const off = getMaxOffensiveMultiplier(c.cand.types, primaryThreat.types);
    return off >= 2.0;
  }) || candidatesWithScore.find((c) => !chosenIds.has(c.cand.id));

  if (techCandidate) {
    chosenIds.add(techCandidate.cand.id);
    const keyMove = techCandidate.cand.builds[0]?.moves[0]?.nameZh || '對策重擊';
    selectedMembers.push({
      pokemon: techCandidate.cand,
      roleTitle: '特化剋制對策手',
      roleBadge: '🎯 精準狙擊威脅',
      targetOpponents: primaryThreat ? [primaryThreat] : techCandidate.targetedOpponents.slice(0, 2),
      counterRationale: `特化針對敵方頭號主力【${primaryThreat?.nameZh || '對手主力'}】進行雙倍剋制打擊，徹底封殺對手王牌的核心輸出空間。`,
      speedCompare: `速 ${techCandidate.cand.baseStats.speed}`,
      keyMove,
    });
  }

  // If still fewer than 6, fill from top scored candidates
  while (selectedMembers.length < 6) {
    const nextCand = candidatesWithScore.find((c) => !chosenIds.has(c.cand.id));
    if (!nextCand) break;
    chosenIds.add(nextCand.cand.id);
    selectedMembers.push({
      pokemon: nextCand.cand,
      roleTitle: '陣容強勢對策手',
      roleBadge: '⚔️ 綜合打擊覆蓋',
      targetOpponents: nextCand.targetedOpponents.slice(0, 2),
      counterRationale: `提供額外的屬性打擊覆蓋，補強全隊對抗敵方多個成員的殘局斬殺線。`,
      speedCompare: `速 ${nextCand.cand.baseStats.speed}`,
      keyMove: nextCand.cand.builds[0]?.moves[0]?.nameZh || '主力攻擊',
    });
  }

  return selectedMembers;
}

/**
 * Default standard balanced Champions counter team
 */
function getDefaultRecommendedTeam(): RecommendedTeamMember[] {
  const ids = ['flutter_mane', 'chien_pao', 'chi_yu', 'incineroar', 'zacian', 'dragonite'];
  const titles = [
    '先發速度壓制手',
    '極限物攻破盾手',
    '極限特攻清場手',
    '威嚇耐久聯防盾牌',
    '體系核心終結者',
    '特化剋制對策手',
  ];
  const badges = [
    '⚡ 先發先手權',
    '🥊 物理極限破盾',
    '💥 特攻範圍重砲',
    '🛡️ 核心換人輪轉',
    '👑 決賽終結收割',
    '🎯 精準狙擊威脅',
  ];

  return ids.map((id, index) => {
    const p = POKEMON_LIST.find((pk) => pk.id === id) || POKEMON_LIST[index];
    return {
      pokemon: p,
      roleTitle: titles[index],
      roleBadge: badges[index],
      targetOpponents: [],
      counterRationale: `世界錦標賽 Champions 標準核心對策配置。`,
      speedCompare: `速 ${p.baseStats.speed}`,
      keyMove: p.builds[0]?.moves[0]?.nameZh || '主力技能',
    };
  });
}

/**
 * Calculates 6v6 coverage matrix (myTeam vs opponentTeam)
 */
export function calculate6v6Matrix(
  myTeam: Pokemon[],
  opponentTeam: Pokemon[]
): TeamMatchupMatrixCell[] {
  const cells: TeamMatchupMatrixCell[] = [];

  myTeam.forEach((my) => {
    opponentTeam.forEach((opp) => {
      const myOff = getMaxOffensiveMultiplier(my.types, opp.types);
      const oppOff = getMaxOffensiveMultiplier(opp.types, my.types);

      let status: 'advantage' | 'even' | 'disadvantage' = 'even';
      let tip = '';

      if (myOff >= 2.0 && oppOff < 2.0) {
        status = 'advantage';
        tip = `我方打擊 ${myOff}x，對手打擊 ${oppOff}x，我方佔絕對優勢`;
      } else if (oppOff >= 2.0 && myOff < 2.0) {
        status = 'disadvantage';
        tip = `對手打擊 ${oppOff}x 剋制我方，需靠太晶化或輪轉規避`;
      } else if (myOff >= 2.0 && oppOff >= 2.0) {
        // mutually super effective: speed decides
        if (my.baseStats.speed > opp.baseStats.speed) {
          status = 'advantage';
          tip = `雙方互剋，但我方速度 ${my.baseStats.speed} 佔先手先動優勢`;
        } else {
          status = 'disadvantage';
          tip = `雙方互剋，對手速度 ${opp.baseStats.speed} 較快，需防備先攻`;
        }
      } else {
        status = 'even';
        tip = `常規對局，依靠數值與技能效果博弈`;
      }

      cells.push({
        myPokemonId: my.id,
        opponentPokemonId: opp.id,
        myOffenseMult: myOff,
        opponentOffenseMult: oppOff,
        status,
        tip,
      });
    });
  });

  return cells;
}

/**
 * Generate full comprehensive tactics analysis for 6v6
 */
export function analyze6v6Tactics(
  myTeamMembers: RecommendedTeamMember[],
  opponentTeam: Pokemon[]
): TeamTacticsAnalysis {
  const myTeam = myTeamMembers.map((m) => m.pokemon);

  // 1. Calculate win rate
  let totalMatchups = 0;
  let advantageCount = 0;

  myTeam.forEach((my) => {
    opponentTeam.forEach((opp) => {
      totalMatchups++;
      const myOff = getMaxOffensiveMultiplier(my.types, opp.types);
      const oppOff = getMaxOffensiveMultiplier(opp.types, my.types);
      if (myOff > oppOff) advantageCount += 1;
      else if (myOff === oppOff) advantageCount += 0.5;
    });
  });

  const baseRatio = totalMatchups > 0 ? advantageCount / totalMatchups : 0.6;
  const winRate = Math.min(94, Math.max(58, Math.round(baseRatio * 75 + 20)));

  let advantageTier = '勢均力敵 Even Match';
  if (winRate >= 80) advantageTier = '🟢 絕對剋制優勢 Major Advantage';
  else if (winRate >= 70) advantageTier = '🟢 聯防打擊佔優 Solid Edge';
  else if (winRate >= 60) advantageTier = '🟡 勢均力敵博弈 Even Match';
  else advantageTier = '🟠 微幅抗衡對局 Balanced Fight';

  // 2. Lead Recommendation: pick the fastest lead and bulky pivot
  const lead1 = myTeamMembers[0].pokemon; // fast disruptor
  const lead2 = myTeamMembers[3]?.pokemon || myTeamMembers[1].pokemon; // tank pivot

  const leadStrategy = `建議先發派出【${lead1.nameZh}】配合【${lead2.nameZh}】開局。以【${lead1.nameZh}】的超高速度線（速 ${lead1.baseStats.speed}）掌控首回合先制節奏，並由【${lead2.nameZh}】提供特性威嚇或換人輪轉保護，第一回合逼迫對手交出守住或交出太晶化。`;

  // 3. Highest Threat Opponent
  const sortedThreats = [...opponentTeam].sort(
    (a, b) => b.baseStats.total * 0.7 + b.baseStats.speed * 0.3 - (a.baseStats.total * 0.7 + a.baseStats.speed * 0.3)
  );
  const highestThreat = sortedThreats[0] || opponentTeam[0];
  const threatCounter = myTeamMembers.find((m) =>
    m.targetOpponents.some((o) => o.id === highestThreat?.id)
  ) || myTeamMembers[1];

  const threatReason = `種族值高達 ${highestThreat?.baseStats.total}，速度 ${highestThreat?.baseStats.speed}，具備強大爆發輸出能力，是我方防守輪轉的主要威脅。`;
  const counterSolution = `保留我方【${threatCounter.pokemon.nameZh}】在後備伺機換入，對位發動【${threatCounter.keyMove}】直接壓制斬殺。`;

  // 4. Tera Priority
  const sweeperMember = myTeamMembers[2] || myTeamMembers[1] || myTeamMembers[0];
  const teraPriority = {
    recommendedPokemon: sweeperMember.pokemon,
    teraType: sweeperMember.pokemon.builds[0]?.teraType || 'Water',
    rationale: `建議保留太晶化給【${sweeperMember.pokemon.nameZh}】，轉變為【${sweeperMember.pokemon.builds[0]?.teraType || 'Water'}】屬性後不僅能規避敵方弱點致命傷害，更能將核心技能輸出提升至極致斬殺門檻。`,
  };

  // 5. Speed Tiers
  const all12 = [
    ...myTeam.map((p) => ({ pokemon: p, isMyTeam: true, speed: p.baseStats.speed })),
    ...opponentTeam.map((p) => ({ pokemon: p, isMyTeam: false, speed: p.baseStats.speed })),
  ];
  all12.sort((a, b) => b.speed - a.speed);
  const speedTiers = all12.map((item, idx) => ({
    ...item,
    speedRank: idx + 1,
  }));

  // 6. Speech script for TTS (Female voice)
  const speechSummary = `戰術分析播報。我方推薦 6 隻陣容對戰敵方 6 隻隊伍，整體預測勝率為百分之${winRate}，戰局判定為${advantageTier}。建議開局首發【${lead1.nameZh}】配合【${lead2.nameZh}】搶佔先手權。敵方頭號威脅為【${highestThreat?.nameZh}】，請由我方【${threatCounter.pokemon.nameZh}】針對打擊。關鍵太晶化推薦保留給【${sweeperMember.pokemon.nameZh}】發動。我方 6 隻寶可夢的 4 招技能與裝備已完成全方位對策配置！`;

  return {
    winRate,
    advantageTier,
    leadRecommendation: {
      leadPokemon: [lead1, lead2],
      leadStrategy,
    },
    threatAnalysis: {
      highestThreat: highestThreat || myTeam[0],
      threatReason,
      counterSolution,
    },
    teraPriority,
    speedTiers,
    speechSummary,
  };
}
