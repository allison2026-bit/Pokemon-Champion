import React from 'react';
import { Pokemon, MatchupAnalysisResult, BattleFormat, PokemonType } from '../types/pokemon';
import { ArrowLeftRight, Shield, Zap, Sparkles, Swords, Target, AlertTriangle, CheckCircle, ChevronDown, Trophy, Gauge, Users, Sparkle } from 'lucide-react';

interface MatchupArenaProps {
  myPokemon: Pokemon;
  opponentPokemon: Pokemon;
  matchupResult: MatchupAnalysisResult;
  currentFormat: BattleFormat;
  onChangeFormat: (fmt: BattleFormat) => void;
  onOpenMySelector: () => void;
  onOpenOpponentSelector: () => void;
  onSwapPositions: () => void;
  onOpenAiCoach: () => void;
}

export const MatchupArena: React.FC<MatchupArenaProps> = ({
  myPokemon,
  opponentPokemon,
  matchupResult,
  currentFormat,
  onChangeFormat,
  onOpenMySelector,
  onOpenOpponentSelector,
  onSwapPositions,
  onOpenAiCoach,
}) => {
  const getTypeBadge = (type: PokemonType) => {
    const colors: Record<PokemonType, string> = {
      Normal: 'bg-slate-100 text-slate-700 border-slate-300',
      Fire: 'bg-orange-100 text-orange-800 border-orange-200',
      Water: 'bg-blue-100 text-blue-800 border-blue-200',
      Grass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Electric: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Ice: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      Fighting: 'bg-amber-100 text-amber-900 border-amber-300',
      Poison: 'bg-purple-100 text-purple-800 border-purple-200',
      Ground: 'bg-amber-100 text-amber-800 border-amber-300',
      Flying: 'bg-sky-100 text-sky-800 border-sky-200',
      Psychic: 'bg-pink-100 text-pink-800 border-pink-200',
      Bug: 'bg-lime-100 text-lime-800 border-lime-300',
      Rock: 'bg-stone-100 text-stone-800 border-stone-300',
      Ghost: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Dragon: 'bg-violet-100 text-violet-800 border-violet-300',
      Steel: 'bg-zinc-100 text-zinc-800 border-zinc-300',
      Dark: 'bg-neutral-800 text-white border-neutral-700',
      Fairy: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return (
      <span
        key={type}
        className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[type] || 'bg-slate-100'}`}
      >
        {type}
      </span>
    );
  };

  const getAdvantageBadge = (tier: MatchupAnalysisResult['advantageTier']) => {
    switch (tier) {
      case '絕對優勢 Major Advantage':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
      case '屬性佔優 Slight Edge':
        return 'text-teal-700 bg-teal-50 border-teal-300';
      case '勢均力敵 Even Match':
        return 'text-amber-700 bg-amber-50 border-amber-300';
      case '對位劣勢 Disadvantage':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      case '嚴重受制 Countered':
        return 'text-rose-700 bg-rose-50 border-rose-300';
    }
  };

  const opponentWinRate = Math.round((100 - matchupResult.winRate) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Top Banner & Battle Format Switcher (Pure White Card) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-1 font-mono">
              <Trophy className="w-4 h-4 text-amber-500" />
              Champion · 級別對戰對位推演
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Champion 對戰組合與勝率分析
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Format Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => onChangeFormat('Double')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentFormat === 'Double'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                雙打對戰 (VGC 級別賽規則)
              </button>
              <button
                onClick={() => onChangeFormat('Single')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentFormat === 'Single'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                單打對戰 (Single Battle)
              </button>
            </div>

            <button
              onClick={onSwapPositions}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-500" />
              互換對局位置
            </button>

            <button
              onClick={onOpenAiCoach}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              AI 冠軍戰術剖析
            </button>
          </div>
        </div>

        {/* Dual Fighters Arena Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-8">
          {/* LEFT: Blue Corner (My Pokemon) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/60 to-white border border-blue-200 rounded-2xl p-5 shadow-sm relative group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-xs font-black text-blue-800 tracking-wider uppercase font-mono">
                  我方寶可夢 (My Pokémon)
                </span>
              </div>
              <button
                onClick={onOpenMySelector}
                className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors shadow-sm"
              >
                更換寶可夢
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl border border-blue-100 p-2 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={myPokemon.officialArtUrl}
                  alt={myPokemon.nameZh}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1 right-1 text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-sm">
                  #{myPokemon.pokedexNumber}
                </span>
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {myPokemon.nameZh}
                  </h2>
                  <span className="text-xs font-mono text-slate-500 truncate">
                    {myPokemon.nameEn}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {myPokemon.types.map((t) => getTypeBadge(t))}
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    {myPokemon.tier.split(' ')[0]}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                  特性【{myPokemon.primaryAbility.nameZh}】：{myPokemon.primaryAbility.description}
                </p>
              </div>
            </div>

            {/* Base Stats Bar Breakdown */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 grid grid-cols-6 gap-1 text-center">
              <div>
                <div className="text-[10px] text-slate-500">HP</div>
                <div className="text-xs font-mono font-bold text-slate-800">{myPokemon.baseStats.hp}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">物攻</div>
                <div className="text-xs font-mono font-bold text-amber-700">{myPokemon.baseStats.attack}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">物防</div>
                <div className="text-xs font-mono font-bold text-emerald-700">{myPokemon.baseStats.defense}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">特攻</div>
                <div className="text-xs font-mono font-bold text-blue-700">{myPokemon.baseStats.spAttack}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">特防</div>
                <div className="text-xs font-mono font-bold text-indigo-700">{myPokemon.baseStats.spDefense}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">速度</div>
                <div className="text-xs font-mono font-bold text-rose-700">{myPokemon.baseStats.speed}</div>
              </div>
            </div>
          </div>

          {/* CENTER: Clash Win Rate & Dial */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center text-center space-y-3 py-4 lg:py-0">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-slate-300" />
              <span className="text-xs font-black text-slate-500 tracking-widest font-mono">VS</span>
              <span className="h-px w-6 bg-slate-300" />
            </div>

            {/* Main Win Rate Indicator */}
            <div className="w-full max-w-[210px] p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center shadow-md">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">
                推演勝率 (Win Rate)
              </span>
              <div className="text-3xl font-black font-mono tracking-tight text-slate-900 flex items-baseline">
                <span className={matchupResult.winRate >= 50 ? 'text-emerald-600' : 'text-rose-600'}>
                  {matchupResult.winRate}%
                </span>
                <span className="text-xs text-slate-400 mx-1.5 font-sans">:</span>
                <span className="text-slate-500 text-xl">
                  {opponentWinRate}%
                </span>
              </div>

              {/* Advantage Badge */}
              <span
                className={`mt-2 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${getAdvantageBadge(
                  matchupResult.advantageTier
                )} whitespace-nowrap`}
              >
                {matchupResult.advantageTier}
              </span>

              {/* Win Rate Progress Track */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden flex border border-slate-200">
                <div
                  className="bg-blue-600 h-full transition-all duration-500"
                  style={{ width: `${matchupResult.winRate}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${opponentWinRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Red Corner (Opponent Pokemon) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-rose-50/60 to-white border border-rose-200 rounded-2xl p-5 shadow-sm relative group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="text-xs font-black text-rose-800 tracking-wider uppercase font-mono">
                  敵方寶可夢 (Opponent)
                </span>
              </div>
              <button
                onClick={onOpenOpponentSelector}
                className="flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors shadow-sm"
              >
                更換對手
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl border border-rose-100 p-2 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={opponentPokemon.officialArtUrl}
                  alt={opponentPokemon.nameZh}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1 right-1 text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-sm">
                  #{opponentPokemon.pokedexNumber}
                </span>
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {opponentPokemon.nameZh}
                  </h2>
                  <span className="text-xs font-mono text-slate-500 truncate">
                    {opponentPokemon.nameEn}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {opponentPokemon.types.map((t) => getTypeBadge(t))}
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    {opponentPokemon.tier.split(' ')[0]}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                  特性【{opponentPokemon.primaryAbility.nameZh}】：{opponentPokemon.primaryAbility.description}
                </p>
              </div>
            </div>

            {/* Base Stats Bar Breakdown */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 grid grid-cols-6 gap-1 text-center">
              <div>
                <div className="text-[10px] text-slate-500">HP</div>
                <div className="text-xs font-mono font-bold text-slate-800">{opponentPokemon.baseStats.hp}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">物攻</div>
                <div className="text-xs font-mono font-bold text-amber-700">{opponentPokemon.baseStats.attack}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">物防</div>
                <div className="text-xs font-mono font-bold text-emerald-700">{opponentPokemon.baseStats.defense}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">特攻</div>
                <div className="text-xs font-mono font-bold text-blue-700">{opponentPokemon.baseStats.spAttack}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">特防</div>
                <div className="text-xs font-mono font-bold text-indigo-700">{opponentPokemon.baseStats.spDefense}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">速度</div>
                <div className="text-xs font-mono font-bold text-rose-700">{opponentPokemon.baseStats.speed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 18-Type Matchup and Speed Tier Analysis (White Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type Multiplier */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
              屬性剋制倍率 (Type Effectiveness)
            </h3>
          </div>
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-slate-900">
              我方打擊：<span className="font-mono text-emerald-600 font-extrabold">{matchupResult.typeMatchup.myOffenseMultiplier}x</span> 傷害
            </div>
            <div className="text-sm font-bold text-slate-900">
              敵方打擊：<span className="font-mono text-rose-600 font-extrabold">{matchupResult.typeMatchup.opponentOffenseMultiplier}x</span> 傷害
            </div>
            <p className="text-xs text-slate-500 pt-1 leading-relaxed">
              {matchupResult.typeMatchup.summary}
            </p>
          </div>
        </div>

        {/* Speed Tier & Initiative */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
              速度先手權 (Speed Initiative)
            </h3>
          </div>
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-slate-900">
              我方基準速度：<span className="font-mono text-blue-600 font-extrabold">{myPokemon.baseStats.speed}</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              敵方基準速度：<span className="font-mono text-rose-600 font-extrabold">{opponentPokemon.baseStats.speed}</span>
            </div>
            <p className="text-xs text-slate-500 pt-1 leading-relaxed">
              {matchupResult.speedAdvantage.summary}
            </p>
          </div>
        </div>

        {/* Recommended Tera Adaptation */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkle className="w-4 h-4 text-violet-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
              推薦太晶化對策 (Tera Type)
            </h3>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-bold text-slate-900">建議太晶屬性：</span>
            {getTypeBadge(matchupResult.recommendedTeraAdaptation.recommendedTera)}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {matchupResult.recommendedTeraAdaptation.rationale}
          </p>
        </div>
      </div>

      {/* Battle Directives & Partner Synergy (White Surface) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tactical Directives */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Champion 級別對戰作戰指令 (Battle Directives)
          </h3>
          <div className="space-y-3">
            {matchupResult.tacticalDirectives.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-sans"
              >
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Partner Synergies */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Users className="w-4 h-4 text-amber-600" />
            推薦聯手搭檔與聯防軸 (Synergy Partners)
          </h3>
          <div className="space-y-3">
            {matchupResult.partnerSynergies.map((partner, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1"
              >
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>最佳搭檔：{partner.recommendedAlly}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {partner.synergyReason}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">需要針對特定賽季規則的詳細排兵布陣？</span>
            <button
              onClick={onOpenAiCoach}
              className="text-xs font-black text-amber-600 hover:text-amber-700 underline underline-offset-4 font-mono"
            >
              進入 AI 戰術教練分析室 &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
