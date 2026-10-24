/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { POKEMON_LIST } from './data/pokemonData';
import { Pokemon, BattleFormat } from './types/pokemon';
import { calculateChampionsMatchup } from './utils/matchupEngine';
import { Header } from './components/Header';
import { MatchupArena } from './components/MatchupArena';
import { BuildDetailPanel } from './components/BuildDetailPanel';
import { PokemonSelectorModal } from './components/PokemonSelectorModal';
import { AiTacticsAdvisor } from './components/AiTacticsAdvisor';
import { TeamBuilderModal } from './components/TeamBuilderModal';
import { TierListModal } from './components/TierListModal';
import { Swords, Shield, Users, Trophy, Crown } from 'lucide-react';

export default function App() {
  // Champion default matchup: Incineroar (熾焰咆哮虎 - 宇宙第一控場) vs Flutter Mane (振翼髮 - 極速妖精鬼炮)
  const [myPokemon, setMyPokemon] = useState<Pokemon>(() => {
    return POKEMON_LIST.find((p) => p.id === 'incineroar') || POKEMON_LIST[0];
  });

  const [opponentPokemon, setOpponentPokemon] = useState<Pokemon>(() => {
    return POKEMON_LIST.find((p) => p.id === 'flutter_mane') || POKEMON_LIST[1];
  });

  const [currentFormat, setCurrentFormat] = useState<BattleFormat>('Double');
  const [activeTab, setActiveTab] = useState<'matchup' | 'builds' | 'tierlist'>('matchup');

  // Modals state
  const [isMySelectorOpen, setIsMySelectorOpen] = useState(false);
  const [isOpponentSelectorOpen, setIsOpponentSelectorOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isTeamBuilderOpen, setIsTeamBuilderOpen] = useState(false);
  const [isTierListOpen, setIsTierListOpen] = useState(false);

  // Dynamic calculated matchup
  const matchupResult = useMemo(() => {
    return calculateChampionsMatchup(myPokemon, opponentPokemon, currentFormat);
  }, [myPokemon, opponentPokemon, currentFormat]);

  // Swap sides
  const handleSwapPositions = () => {
    const temp = myPokemon;
    setMyPokemon(opponentPokemon);
    setOpponentPokemon(temp);
  };

  // Pick random matchup
  const handleRandomMatchup = () => {
    const list = [...POKEMON_LIST];
    const randomIndex1 = Math.floor(Math.random() * list.length);
    let randomIndex2 = Math.floor(Math.random() * list.length);
    while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * list.length);
    }
    setMyPokemon(list[randomIndex1]);
    setOpponentPokemon(list[randomIndex2]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top Header compliant with 3-Zone Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'tierlist') {
            setIsTierListOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onRandomMatchup={handleRandomMatchup}
      />

      {/* Main Content Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Quick Mode Switcher and Extra Tool Triggers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('matchup')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'matchup'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Swords className="w-4 h-4" />
              Champions 級別對位推演
            </button>

            <button
              onClick={() => setActiveTab('builds')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'builds'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              最佳配招裝備 ({myPokemon.nameZh})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTeamBuilderOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              雙打隊伍體系構築
            </button>

            <button
              onClick={() => setIsTierListOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              52POKE 天梯榜
            </button>
          </div>
        </div>

        {/* View 1: Matchup Arena */}
        {activeTab === 'matchup' && (
          <div className="space-y-8 animate-fade-in">
            <MatchupArena
              myPokemon={myPokemon}
              opponentPokemon={opponentPokemon}
              matchupResult={matchupResult}
              currentFormat={currentFormat}
              onChangeFormat={(fmt) => setCurrentFormat(fmt)}
              onOpenMySelector={() => setIsMySelectorOpen(true)}
              onOpenOpponentSelector={() => setIsOpponentSelectorOpen(true)}
              onSwapPositions={handleSwapPositions}
              onOpenAiCoach={() => setIsAiCoachOpen(true)}
            />

            {/* Sub-section: Best Build for My Pokemon in this matchup */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    【{myPokemon.nameZh}】Champions 錦標賽最佳配裝、招式與對策微操
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    已精確考量對手【{opponentPokemon.nameZh}】的屬性剋制倍率、速度線與太晶屬性博弈
                  </p>
                </div>
              </div>

              <BuildDetailPanel
                pokemon={myPokemon}
                onSelectAnotherPokemon={() => setIsMySelectorOpen(true)}
              />
            </div>
          </div>
        )}

        {/* View 2: Full Build Detail Mode */}
        {activeTab === 'builds' && (
          <div className="space-y-6 animate-fade-in">
            <BuildDetailPanel
              pokemon={myPokemon}
              onSelectAnotherPokemon={() => setIsMySelectorOpen(true)}
            />

            {/* Also show opponent build for reference */}
            <div className="pt-4 border-t border-slate-200">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider font-mono">
                  對手【{opponentPokemon.nameZh}】Champions 官方級別賽配裝情報：
                </h3>
              </div>
              <BuildDetailPanel
                pokemon={opponentPokemon}
                onSelectAnotherPokemon={() => setIsOpponentSelectorOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer - Pure White */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-600 tracking-tight font-mono">POKÉMON CHAMPIONS</span>
            <span aria-hidden="true">·</span>
            <span>官方級別對戰配裝配置與 18 屬性剋制勝率分析指南</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            資料參考自 52POKE 百科 · Pokémon 及各角色為 The Pokémon Company / Nintendo 之商標
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PokemonSelectorModal
        isOpen={isMySelectorOpen}
        onClose={() => setIsMySelectorOpen(false)}
        onSelect={(p) => setMyPokemon(p)}
        title="選擇我方參戰寶可夢 (Select My Pokémon)"
        currentSelectedId={myPokemon.id}
      />

      <PokemonSelectorModal
        isOpen={isOpponentSelectorOpen}
        onClose={() => setIsOpponentSelectorOpen(false)}
        onSelect={(p) => setOpponentPokemon(p)}
        title="選擇敵方對手寶可夢 (Select Opponent Pokémon)"
        currentSelectedId={opponentPokemon.id}
      />

      <AiTacticsAdvisor
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        myPokemon={myPokemon}
        opponentPokemon={opponentPokemon}
        format={currentFormat}
      />

      <TeamBuilderModal
        isOpen={isTeamBuilderOpen}
        onClose={() => setIsTeamBuilderOpen(false)}
        defaultMyPokemon={myPokemon}
        defaultOpponentPokemon={opponentPokemon}
      />

      <TierListModal
        isOpen={isTierListOpen}
        onClose={() => setIsTierListOpen(false)}
        onSelectAsMyPokemon={(p) => {
          setMyPokemon(p);
          setActiveTab('matchup');
        }}
        onSelectAsOpponentPokemon={(p) => {
          setOpponentPokemon(p);
          setActiveTab('matchup');
        }}
      />
    </div>
  );
}
