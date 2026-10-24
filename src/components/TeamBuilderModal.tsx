import React, { useState } from 'react';
import { Pokemon } from '../types/pokemon';
import { POKEMON_LIST } from '../data/pokemonData';
import { evaluateTeamComposition } from '../utils/matchupEngine';
import { Users, X, Plus, Trash2, Shield, Zap, Sparkles, Swords, AlertCircle, RefreshCw } from 'lucide-react';
import { PokemonSelectorModal } from './PokemonSelectorModal';

interface TeamBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMyPokemon: Pokemon;
  defaultOpponentPokemon: Pokemon;
}

export const TeamBuilderModal: React.FC<TeamBuilderModalProps> = ({
  isOpen,
  onClose,
  defaultMyPokemon,
  defaultOpponentPokemon,
}) => {
  const [myTeam, setMyTeam] = useState<(Pokemon | null)[]>([
    defaultMyPokemon,
    POKEMON_LIST.find((p) => p.id === 'incineroar') || null,
    POKEMON_LIST.find((p) => p.id === 'flutter_mane') || null,
    POKEMON_LIST.find((p) => p.id === 'urshifu_rapid') || null,
  ]);

  const [enemyTeam, setEnemyTeam] = useState<(Pokemon | null)[]>([
    defaultOpponentPokemon,
    POKEMON_LIST.find((p) => p.id === 'amoonguss') || null,
    POKEMON_LIST.find((p) => p.id === 'landorus_t') || null,
    POKEMON_LIST.find((p) => p.id === 'gholdengo') || null,
  ]);

  const [selectorTarget, setSelectorTarget] = useState<{
    side: 'my' | 'enemy';
    index: number;
  } | null>(null);

  const report = evaluateTeamComposition(myTeam, enemyTeam);

  const handleSelectPokemon = (pokemon: Pokemon) => {
    if (!selectorTarget) return;
    if (selectorTarget.side === 'my') {
      const next = [...myTeam];
      next[selectorTarget.index] = pokemon;
      setMyTeam(next);
    } else {
      const next = [...enemyTeam];
      next[selectorTarget.index] = pokemon;
      setEnemyTeam(next);
    }
    setSelectorTarget(null);
  };

  const handleRemoveSlot = (side: 'my' | 'enemy', index: number) => {
    if (side === 'my') {
      const next = [...myTeam];
      next[index] = null;
      setMyTeam(next);
    } else {
      const next = [...enemyTeam];
      next[index] = null;
      setEnemyTeam(next);
    }
  };

  const handleAutoFill = () => {
    const sample = [...POKEMON_LIST];
    const newMy = [...myTeam];
    for (let i = 0; i < 4; i++) {
      if (!newMy[i]) {
        newMy[i] = sample[i % sample.length];
      }
    }
    setMyTeam(newMy);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header - Pure White */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Champions 雙打/單打隊伍體系構築模擬 (Team Synergy Builder)
              </h2>
              <p className="text-xs text-slate-500">
                評估 4 隻首發/後備陣容之屬性打擊面、威嚇保排、先手速度線與聯防抗性
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoFill}
              className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              自動補全主流核心
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
          {/* My Team (Blue/Amber) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                我方 Champions 參賽陣容 (My Team · 4 Pokémon)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {myTeam.map((p, idx) => (
                <div
                  key={idx}
                  className={`relative p-3.5 rounded-2xl border flex flex-col items-center justify-center min-h-[140px] text-center transition-all ${
                    p
                      ? 'bg-white border-slate-200 shadow-2xs hover:border-amber-400'
                      : 'bg-white/60 border-dashed border-slate-300 hover:bg-white hover:border-amber-400 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!p) setSelectorTarget({ side: 'my', index: idx });
                  }}
                >
                  {p ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSlot('my', idx);
                        }}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center mb-2">
                        <img
                          src={p.officialArtUrl}
                          alt={p.nameZh}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-black text-slate-900 truncate w-full">
                        {p.nameZh}
                      </span>
                      <div className="flex gap-1 mt-1">
                        {p.types.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <Plus className="w-6 h-6 stroke-[1.5]" />
                      <span className="text-xs font-bold">點擊配置席位 {idx + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enemy Team (Red/Slate) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              敵方推演陣容 (Opponent Team · 4 Pokémon)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {enemyTeam.map((p, idx) => (
                <div
                  key={idx}
                  className={`relative p-3.5 rounded-2xl border flex flex-col items-center justify-center min-h-[140px] text-center transition-all ${
                    p
                      ? 'bg-white border-slate-200 shadow-2xs hover:border-rose-400'
                      : 'bg-white/60 border-dashed border-slate-300 hover:bg-white hover:border-rose-400 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!p) setSelectorTarget({ side: 'enemy', index: idx });
                  }}
                >
                  {p ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSlot('enemy', idx);
                        }}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center mb-2">
                        <img
                          src={p.officialArtUrl}
                          alt={p.nameZh}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-black text-slate-900 truncate w-full">
                        {p.nameZh}
                      </span>
                      <div className="flex gap-1 mt-1">
                        {p.types.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <Plus className="w-6 h-6 stroke-[1.5]" />
                      <span className="text-xs font-bold">點擊配置對手席位 {idx + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Synergy Evaluation Report */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  WCS 大賽陣容體系評級
                </span>
                <h4 className="text-base font-black text-slate-900">
                  全隊綜合聯動分數：
                  <span className="text-amber-600 font-mono text-xl ml-2">
                    {report.overallSynergyScore} / 100
                  </span>
                </h4>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block">屬性覆蓋面</span>
                  <span className="font-black text-slate-800">{report.typeCoverageScore}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">先手速度線</span>
                  <span className="font-black text-slate-800">{report.speedControlScore}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">整體耐久度</span>
                  <span className="font-black text-slate-800">{report.bulkBalanceScore}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <span className="font-black text-emerald-900 flex items-center gap-1.5 font-mono">
                  ✨ 陣容戰術優勢：
                </span>
                <ul className="list-disc list-inside text-emerald-800 space-y-1">
                  {report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <span className="font-black text-amber-900 flex items-center gap-1.5 font-mono">
                  ⚠️ 潛在防守盲點與對策建議：
                </span>
                <ul className="list-disc list-inside text-amber-800 space-y-1">
                  {report.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              💡 <strong>教練戰術指引：</strong>{report.tacticalAdvice}
            </div>
          </div>
        </div>
      </div>

      {/* Target Selector Modal */}
      {selectorTarget && (
        <PokemonSelectorModal
          isOpen={true}
          onClose={() => setSelectorTarget(null)}
          onSelect={handleSelectPokemon}
          title={
            selectorTarget.side === 'my'
              ? `選擇我方席位 ${selectorTarget.index + 1} 寶可夢`
              : `選擇敵方席位 ${selectorTarget.index + 1} 寶可夢`
          }
        />
      )}
    </div>
  );
};
