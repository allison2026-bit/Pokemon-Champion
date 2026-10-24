import React, { useState } from 'react';
import { Pokemon, CompetitiveBuild, PokemonType } from '../types/pokemon';
import { Shield, Zap, Sparkles, Flame, CheckCircle2, Crown, Sparkle, Award, Users, Crosshair } from 'lucide-react';

interface BuildDetailPanelProps {
  pokemon: Pokemon;
  onSelectAnotherPokemon?: () => void;
}

export const BuildDetailPanel: React.FC<BuildDetailPanelProps> = ({
  pokemon,
  onSelectAnotherPokemon,
}) => {
  const [selectedBuildIndex, setSelectedBuildIndex] = useState(0);
  const currentBuild: CompetitiveBuild =
    pokemon.builds[selectedBuildIndex] || pokemon.builds[0];

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
        className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[type] || 'bg-slate-100 text-slate-700'}`}
      >
        {type}
      </span>
    );
  };

  const getCategoryBadge = (category: 'Physical' | 'Special' | 'Status') => {
    switch (category) {
      case 'Physical':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 font-mono">
            <Zap className="w-3 h-3 text-rose-600" />
            物理
          </span>
        );
      case 'Special':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            特殊
          </span>
        );
      case 'Status':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 font-mono">
            <Shield className="w-3 h-3 text-slate-600" />
            變化
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Panel Top Header - Pure White */}
      <div className="p-6 sm:p-8 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 bg-slate-50 rounded-2xl border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-inner">
            <img
              src={pokemon.officialArtUrl}
              alt={pokemon.nameZh}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {pokemon.nameZh}
              </h2>
              <span className="text-xs font-mono font-bold text-slate-500">
                {pokemon.nameEn} · #{pokemon.pokedexNumber.toString().padStart(3, '0')}
              </span>
              <span className="text-xs font-black text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono">
                {pokemon.tier}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs font-bold text-slate-500">屬性：</span>
              <div className="flex gap-1.5">{pokemon.types.map(getTypeBadge)}</div>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600">
                賽事登場率：<strong className="text-emerald-700 font-mono font-bold">{pokemon.usageRate}%</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600">
                排位勝率：<strong className="text-amber-700 font-mono font-bold">{pokemon.winRate}%</strong>
              </span>
            </div>
          </div>
        </div>

        {onSelectAnotherPokemon && (
          <button
            onClick={onSelectAnotherPokemon}
            className="text-xs font-extrabold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 font-mono"
          >
            更換冠軍寶可夢
          </button>
        )}
      </div>

      {/* Base Stats Overview Bar */}
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100">
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 text-center">
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-slate-400 font-mono">HP</div>
            <div className="text-sm font-black text-slate-800 font-mono">{pokemon.baseStats.hp}</div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-rose-500 font-mono">物攻 (Atk)</div>
            <div className="text-sm font-black text-slate-800 font-mono">{pokemon.baseStats.attack}</div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-blue-500 font-mono">物防 (Def)</div>
            <div className="text-sm font-black text-slate-800 font-mono">{pokemon.baseStats.defense}</div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-indigo-500 font-mono">特攻 (SpA)</div>
            <div className="text-sm font-black text-slate-800 font-mono">{pokemon.baseStats.spAttack}</div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-teal-500 font-mono">特防 (SpD)</div>
            <div className="text-sm font-black text-slate-800 font-mono">{pokemon.baseStats.spDefense}</div>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-amber-500 font-mono">速度 (Spe)</div>
            <div className="text-sm font-black text-amber-700 font-mono font-bold">{pokemon.baseStats.speed}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-amber-50/80 border border-amber-200 shadow-2xs">
            <div className="text-[10px] font-extrabold text-amber-700 font-mono">種族值總和</div>
            <div className="text-sm font-black text-amber-900 font-mono">{pokemon.baseStats.total}</div>
          </div>
        </div>
      </div>

      {/* Build Selector Tabs if multiple */}
      {pokemon.builds.length > 1 && (
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap mr-2 font-mono">
            Champions 賽制配裝:
          </span>
          {pokemon.builds.map((b, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedBuildIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedBuildIndex === idx
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {b.buildNameZh}
              <span className="ml-1.5 opacity-90 text-[10px] font-mono">
                [{b.format}]
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Build Content */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Section 1: 4 Competitive Moves */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-amber-600" />
              Champions 錦標賽最佳 4 技能配置與戰術訣竅 (4-Move Competitive Set)
            </h3>
            <span className="text-xs text-amber-700 font-bold font-mono">
              賽制：{currentBuild.format === 'Double' ? 'VGC 官方雙打' : '單打排位'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBuild.moves.map((move, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-amber-400 hover:bg-white transition-all space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold font-mono flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">
                      {move.nameZh}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {move.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getTypeBadge(move.type)}
                    {getCategoryBadge(move.category)}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                  <span>威力：<strong className="text-slate-800">{move.power > 0 ? move.power : '— (變化)'}</strong></span>
                  <span>·</span>
                  <span>命中率：<strong className="text-slate-800">{move.accuracy > 0 ? `${move.accuracy}%` : '必中'}</strong></span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {move.description}
                </p>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-amber-800 font-medium bg-amber-50/60 p-2 rounded-lg">
                  💡 <strong>對戰訣竅：</strong>{move.tacticalTip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Competitive Specs (Held Item, Tera Type, Ability, EV spread) */}
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4 font-mono">
            <Crown className="w-4 h-4 text-amber-600" />
            對戰核心配置：攜帶道具、太晶屬性、特性與努力值
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Held Item */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  推薦持有裝備 (Held Item)
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">
                    {currentBuild.heldItem.nameZh}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentBuild.heldItem.nameEn}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {currentBuild.heldItem.effect}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-medium text-emerald-800">
                🎯 {currentBuild.heldItem.tacticalRole}
              </div>
            </div>

            {/* Tera Type */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  推薦太晶屬性 (Tera Type)
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">
                    太晶【{currentBuild.teraType}】
                  </span>
                  {getTypeBadge(currentBuild.teraType)}
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  提供強大的屬性抗性防護，規避敵方致命弱點打擊，或強化關鍵本系技能的爆發上限。
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-medium text-indigo-700">
                ✨ 太晶防禦與斬殺反轉
              </div>
            </div>

            {/* Ability */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  核心特性 (Ability)
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">
                    {currentBuild.ability.nameZh}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentBuild.ability.nameEn}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {currentBuild.ability.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-medium text-amber-800">
                ⚡ 戰場機制發動機
              </div>
            </div>

            {/* Nature & EV spread */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  性格與努力值分配 (EVs & Nature)
                </span>
                <div className="mt-1">
                  <div className="text-xs font-bold text-slate-700">
                    性格：<span className="font-black text-slate-900">{currentBuild.nature}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    努力值：
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-700 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                    {currentBuild.evSpread}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-medium text-slate-500">
                📊 精準速度卡線與坦度極限化
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Combo Tactics & Recommended Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Crosshair className="w-4 h-4 text-amber-600" />
              Champions 級別交鋒操作與戰術連鎖 (Tactical Directives)
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              {currentBuild.comboTactics}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Users className="w-4 h-4 text-indigo-600" />
              WCS 雙打黃金聯手搭檔推薦 (Recommended Partners)
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentBuild.recommendedPartners.map((partner, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-black text-indigo-800 shadow-2xs font-mono"
                >
                  🤝 {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
