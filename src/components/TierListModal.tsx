import React, { useState } from 'react';
import { Pokemon, ChampionsTier, PokemonType } from '../types/pokemon';
import { POKEMON_LIST } from '../data/pokemonData';
import { Trophy, X, ArrowRight, Zap, Shield, Swords, Sparkles } from 'lucide-react';

interface TierListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsMyPokemon: (pokemon: Pokemon) => void;
  onSelectAsOpponentPokemon: (pokemon: Pokemon) => void;
}

const ALL_TYPES: PokemonType[] = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy',
];

export const TierListModal: React.FC<TierListModalProps> = ({
  isOpen,
  onClose,
  onSelectAsMyPokemon,
  onSelectAsOpponentPokemon,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');

  if (!isOpen) return null;

  const tiers: ChampionsTier[] = [
    'S+ (賽事超一線)',
    'S (強勢核心)',
    'A+ (主力對策)',
    'A (特定體系)',
  ];

  const getTierHeading = (tier: ChampionsTier) => {
    switch (tier) {
      case 'S+ (賽事超一線)':
        return {
          label: 'S+ 階層 · 賽事最高優先級 (Meta Defining & Rule Makers)',
          color: 'text-amber-800 bg-amber-50 border-amber-300',
        };
      case 'S (強勢核心)':
        return {
          label: 'S 階層 · 主流高勝率體系核心 (Top Tier Anchors)',
          color: 'text-indigo-800 bg-indigo-50 border-indigo-300',
        };
      case 'A+ (主力對策)':
        return {
          label: 'A+ 階層 · 強力環境對策與輪轉主力 (Tournament Staples)',
          color: 'text-emerald-800 bg-emerald-50 border-emerald-300',
        };
      case 'A (特定體系)':
        return {
          label: 'A 階層 · 特定軸心體系核心（晴天/雨天/沙暴/空間）',
          color: 'text-slate-700 bg-slate-100 border-slate-300',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header - Pure White */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                Pokémon Champions · 官方級別賽事天梯榜
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                  Master Rank / WCS 錦標賽
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                基於 52POKE 官方對戰數據、雙打環境禁用率 (Pick/Ban) 與天梯勝率統計
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 font-mono">屬性過濾:</span>
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedType === 'ALL'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            全部屬性
          </button>
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedType === t
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body Tiers */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          {tiers.map((tier) => {
            const list = POKEMON_LIST.filter(
              (p) =>
                p.tier === tier &&
                (selectedType === 'ALL' || p.types.includes(selectedType as PokemonType))
            );

            if (list.length === 0) return null;

            const heading = getTierHeading(tier);

            return (
              <div key={tier} className="space-y-3">
                <div
                  className={`px-4 py-2 rounded-xl border text-xs font-black tracking-wide flex items-center justify-between ${heading.color}`}
                >
                  <span>{heading.label}</span>
                  <span className="font-mono text-[11px]">{list.length} 隻</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={p.officialArtUrl}
                            alt={p.nameZh}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain filter drop-shadow-xs"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-slate-900 truncate">
                              {p.nameZh}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{p.pokedexNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {p.nameEn}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.types.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono py-1.5 px-2 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">速度</span>
                          <span className="font-black text-amber-700">{p.baseStats.speed}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">登場率</span>
                          <span className="font-black text-slate-700">{p.usageRate}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">勝率</span>
                          <span className="font-black text-emerald-700">{p.winRate}%</span>
                        </div>
                      </div>

                      {/* Quick Select Buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            onSelectAsMyPokemon(p);
                            onClose();
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-2xs"
                        >
                          設為我方
                        </button>
                        <button
                          onClick={() => {
                            onSelectAsOpponentPokemon(p);
                            onClose();
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
                        >
                          設為對手
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
