/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { POKEMON_LIST } from './data/pokemonData';
import { Pokemon, BattleFormat, PokemonType, ChampionMove } from './types/pokemon';
import { calculateChampionsMatchup } from './utils/matchupEngine';
import { Header } from './components/Header';
import { PokemonSelectorModal } from './components/PokemonSelectorModal';
import { PhotoRecognitionModal } from './components/PhotoRecognitionModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import {
  ArrowLeftRight,
  Shield,
  Zap,
  Sparkles,
  Trophy,
  Crown,
  Gauge,
  Crosshair,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Square,
  ChevronDown,
} from 'lucide-react';

export default function App() {
  // Champions default matchup: Incineroar (熾焰咆哮虎) vs Flutter Mane (振翼髮)
  const [myPokemon, setMyPokemon] = useState<Pokemon>(() => {
    return POKEMON_LIST.find((p) => p.id === 'incineroar') || POKEMON_LIST[0];
  });

  const [opponentPokemon, setOpponentPokemon] = useState<Pokemon>(() => {
    return POKEMON_LIST.find((p) => p.id === 'flutter_mane') || POKEMON_LIST[1];
  });

  const [currentFormat, setCurrentFormat] = useState<BattleFormat>('Double');

  // Modals state
  const [isMySelectorOpen, setIsMySelectorOpen] = useState(false);
  const [isOpponentSelectorOpen, setIsOpponentSelectorOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Speech Synthesis state (語音朗讀)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Dynamic calculated matchup
  const matchupResult = useMemo(() => {
    return calculateChampionsMatchup(myPokemon, opponentPokemon, currentFormat);
  }, [myPokemon, opponentPokemon, currentFormat]);

  const myBuild = myPokemon.builds[0];
  const oppBuild = opponentPokemon.builds[0];
  const opponentWinRate = Math.round((100 - matchupResult.winRate) * 10) / 10;

  // Generate spoken text script for TTS
  const speechBriefingText = useMemo(() => {
    const moveNames = myBuild?.moves ? myBuild.moves.map((m) => m.nameZh).join('、') : '主力技能';
    return `我方【${myPokemon.nameZh}】對戰【${opponentPokemon.nameZh}】。對位勝率預測為百分之${matchupResult.winRate}，戰局判定為${matchupResult.advantageTier}。我方基準速度為${myPokemon.baseStats.speed}，${matchupResult.speedAdvantage.summary}。推薦攜帶道具【${myBuild?.heldItem.nameZh}】，推薦太晶化為【${myBuild?.teraType}】屬性。推薦 4 招技能出招：${moveNames}。對局核心戰術：${matchupResult.recommendedTeraAdaptation.rationale}`;
  }, [myPokemon, opponentPokemon, matchupResult, myBuild]);

  // Handle Speech Synthesis Toggle
  const handleToggleSpeech = () => {
    if (!synthRef.current) {
      alert('您的瀏覽器未支援語音朗讀功能。');
      return;
    }

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(speechBriefingText);
    utterance.lang = 'zh-TW';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try selecting a good traditional Chinese voice if available
    const voices = synthRef.current.getVoices();
    const zhVoice = voices.find((v) => v.lang.includes('zh-TW') || v.lang.includes('zh'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  // Swap sides
  const handleSwapPositions = () => {
    const temp = myPokemon;
    setMyPokemon(opponentPokemon);
    setOpponentPokemon(temp);
  };

  // Pick random matchup
  const handleRandomMatchup = () => {
    const list = [...POKEMON_LIST];
    const idx1 = Math.floor(Math.random() * list.length);
    let idx2 = Math.floor(Math.random() * list.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * list.length);
    }
    setMyPokemon(list[idx1]);
    setOpponentPokemon(list[idx2]);
  };

  // Quick meta picks for rapid 1-click test
  const quickMetaList = useMemo(() => {
    return [
      'incineroar',
      'flutter_mane',
      'zacian',
      'dragonite',
      'chien_pao',
      'gholdengo',
      'urshifu_rapid',
      'landorus_t',
      'ogerpon_water',
      'miraidon',
    ]
      .map((id) => POKEMON_LIST.find((p) => p.id === id))
      .filter((p): p is Pokemon => p !== undefined);
  }, []);

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
          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 font-mono">
            物理
          </span>
        );
      case 'Special':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
            特殊
          </span>
        );
      case 'Status':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300 font-mono">
            變化
          </span>
        );
    }
  };

  const getAdvantageBadge = (tier: string) => {
    if (tier.includes('絕對優勢')) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (tier.includes('屬性佔優')) return 'text-teal-700 bg-teal-50 border-teal-300';
    if (tier.includes('勢均力敵')) return 'text-amber-700 bg-amber-50 border-amber-300';
    if (tier.includes('對位劣勢')) return 'text-orange-700 bg-orange-50 border-orange-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Streamlined Header */}
      <Header
        format={currentFormat}
        onChangeFormat={setCurrentFormat}
        onRandomMatchup={handleRandomMatchup}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        onToggleSpeech={handleToggleSpeech}
        isSpeaking={isSpeaking}
      />

      {/* Main Single-Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* =========================================================
            SECTION 1: FIGHTER SELECTOR (我方 vs 對手)
        ========================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 sm:gap-6 items-center">
            {/* Left: My Pokemon Card */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-xs font-black text-blue-900 tracking-wider uppercase font-mono">
                    我方寶可夢 (My Pokémon)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsVoiceModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300 transition-all shadow-2xs cursor-pointer"
                    title="語音辨識指令"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">語音</span>
                  </button>
                  <button
                    onClick={() => setIsMySelectorOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-800 text-xs font-bold border border-blue-300 transition-all shadow-2xs cursor-pointer"
                  >
                    更換寶可夢
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl border border-blue-200 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src={myPokemon.officialArtUrl}
                    alt={myPokemon.nameZh}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-xs"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-blue-600 text-white">
                    #{myPokemon.pokedexNumber}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                      {myPokemon.nameZh}
                    </h2>
                    <span className="text-xs text-slate-500 font-mono truncate">
                      {myPokemon.nameEn}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {myPokemon.types.map(getTypeBadge)}
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                      {myPokemon.tier.split(' ')[0]}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 pt-0.5">
                    速度 <strong className="text-amber-700 font-mono font-black">{myPokemon.baseStats.speed}</strong> · 總種族值 <strong className="text-slate-800 font-mono">{myPokemon.baseStats.total}</strong> · 特性【{myPokemon.primaryAbility.nameZh}】
                  </div>
                </div>
              </div>

              {/* Quick Picks for My Pokemon */}
              <div className="pt-2 border-t border-blue-200/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-400 font-bold shrink-0 font-mono">熱門速選:</span>
                {quickMetaList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setMyPokemon(p)}
                    className={`px-2 py-0.5 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                      myPokemon.id === p.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {p.nameZh}
                  </button>
                ))}
              </div>
            </div>

            {/* Middle: Swap Button */}
            <div className="lg:col-span-1 flex justify-center">
              <button
                onClick={handleSwapPositions}
                className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-amber-100 border border-slate-200 hover:border-amber-300 flex items-center justify-center text-slate-700 hover:text-amber-700 transition-all active:scale-95 shadow-2xs cursor-pointer"
                title="互換雙方位置"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Opponent Pokemon Card */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-xs font-black text-rose-900 tracking-wider uppercase font-mono">
                    敵方寶可夢 (Opponent Pokémon)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Photo Recognition Button */}
                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 transition-all shadow-2xs cursor-pointer"
                    title="拍照或上傳截圖辨識對手角色"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>照片辨識</span>
                  </button>

                  <button
                    onClick={() => setIsOpponentSelectorOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-800 text-xs font-bold border border-rose-300 transition-all shadow-2xs cursor-pointer"
                  >
                    更換
                    <ChevronDown className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl border border-rose-200 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src={opponentPokemon.officialArtUrl}
                    alt={opponentPokemon.nameZh}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-xs"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-rose-600 text-white">
                    #{opponentPokemon.pokedexNumber}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                      {opponentPokemon.nameZh}
                    </h2>
                    <span className="text-xs text-slate-500 font-mono truncate">
                      {opponentPokemon.nameEn}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {opponentPokemon.types.map(getTypeBadge)}
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                      {opponentPokemon.tier.split(' ')[0]}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 pt-0.5">
                    速度 <strong className="text-amber-700 font-mono font-black">{opponentPokemon.baseStats.speed}</strong> · 弱點：
                    <span className="font-bold text-rose-700">
                      {opponentPokemon.weaknesses.slice(0, 3).join('/')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Picks for Opponent Pokemon */}
              <div className="pt-2 border-t border-rose-200/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-400 font-bold shrink-0 font-mono">熱門速選:</span>
                {quickMetaList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setOpponentPokemon(p)}
                    className={`px-2 py-0.5 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                      opponentPokemon.id === p.id
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    {p.nameZh}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 2: RECOMMENDED BUILDS & MOVESETS (我方推薦配置放在勝負判定上方)
        ========================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Champions 官方錦標賽推薦技能組合與配裝
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                4 招式技能表、攜帶裝備、特性、太晶屬性與努力值分配速查
              </p>
            </div>

            {/* Read Aloud Trigger */}
            <button
              onClick={handleToggleSpeech}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-500 text-white ring-2 ring-rose-200 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>停止朗讀戰術</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>語音朗讀此戰術</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ==========================================
                COLUMN 1: MY POKEMON RECOMMENDED BUILD (我方推薦配置)
            ========================================== */}
            <div className="bg-white rounded-3xl border-2 border-blue-200 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl border border-blue-200 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={myPokemon.officialArtUrl}
                      alt={myPokemon.nameZh}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-slate-900">
                        {myPokemon.nameZh}
                      </h4>
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        我方推薦配置
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {myBuild?.buildNameZh || 'WCS 冠軍標準型'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-400 block">推薦太晶</span>
                  <span className="inline-block text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 mt-0.5">
                    太晶【{myBuild?.teraType || 'Water'}】
                  </span>
                </div>
              </div>

              {/* 4 Moves Grid */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-slate-700 uppercase font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  推薦 4 招式組合 (Moveset)：
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {myBuild?.moves.map((move: ChampionMove, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {move.nameZh}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTypeBadge(move.type)}
                          {getCategoryBadge(move.category)}
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                        <span>威力: <strong className="text-slate-800">{move.power > 0 ? move.power : '—'}</strong></span>
                        <span>命中: <strong className="text-slate-800">{move.accuracy > 0 ? `${move.accuracy}%` : '必中'}</strong></span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {move.tacticalTip || move.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Items & Setup Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Held Item */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                  <div className="text-[10px] font-black text-amber-800 uppercase font-mono">
                    推薦持有道具 (Held Item)
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {myBuild?.heldItem.nameZh}
                    <span className="text-[10px] text-slate-400 font-mono ml-1">
                      ({myBuild?.heldItem.nameEn})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {myBuild?.heldItem.effect}
                  </p>
                </div>

                {/* Ability & Nature */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase font-mono">
                    核心特性與性格 (Ability & Nature)
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    特性：{myBuild?.ability.nameZh} · 性格：{myBuild?.nature}
                  </div>
                  <div className="text-[10px] font-mono text-amber-800 bg-white px-2 py-1 rounded border border-slate-200 font-bold truncate">
                    努力值: {myBuild?.evSpread}
                  </div>
                </div>
              </div>

              {/* Combo Strategy & Partners */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  推薦連鎖微操：
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {myBuild?.comboTactics}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 font-mono">最佳雙打搭檔:</span>
                  {myBuild?.recommendedPartners.map((partner: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700"
                    >
                      🤝 {partner}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ==========================================
                COLUMN 2: OPPONENT COUNTER & BUILD
            ========================================== */}
            <div className="bg-white rounded-3xl border-2 border-rose-200 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl border border-rose-200 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={opponentPokemon.officialArtUrl}
                      alt={opponentPokemon.nameZh}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-slate-900">
                        {opponentPokemon.nameZh}
                      </h4>
                      <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        對手預計配置
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {oppBuild?.buildNameZh || '主流對戰型'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-400 block">常用太晶</span>
                  <span className="inline-block text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 mt-0.5">
                    太晶【{oppBuild?.teraType || 'Ghost'}】
                  </span>
                </div>
              </div>

              {/* Opponent 4 Moves Grid */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-slate-700 uppercase font-mono flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  對手常見 4 招式組合預警：
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {oppBuild?.moves.map((move: ChampionMove, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/20 transition-all space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {move.nameZh}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTypeBadge(move.type)}
                          {getCategoryBadge(move.category)}
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                        <span>威力: <strong className="text-slate-800">{move.power > 0 ? move.power : '—'}</strong></span>
                        <span>命中: <strong className="text-slate-800">{move.accuracy > 0 ? `${move.accuracy}%` : '必中'}</strong></span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {move.tacticalTip || move.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opponent Weaknesses & Counter Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Weaknesses */}
                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1">
                  <div className="text-[10px] font-black text-rose-800 uppercase font-mono">
                    對手致命破防弱點 (Weaknesses)
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {opponentPokemon.weaknesses.map(getTypeBadge)}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight pt-1">
                    針對以上屬性使用本系或補盲招式可達成雙倍傷害斬殺。
                  </p>
                </div>

                {/* Opponent Held Item */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase font-mono">
                    對手預計攜帶道具 (Held Item)
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {oppBuild?.heldItem.nameZh}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {oppBuild?.heldItem.effect}
                  </p>
                </div>
              </div>

              {/* Specific Counter Guide Banner */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="text-xs font-black text-rose-900 flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  破招處決指南：
                </div>
                <p className="text-xs text-rose-900 leading-relaxed font-medium">
                  {myPokemon.counterAdvice?.[opponentPokemon.id] ||
                    `面對【${opponentPokemon.nameZh}】，注意其特性【${opponentPokemon.primaryAbility.nameZh}】。利用我方速度優勢或太晶抗性壓制其主要本系輸出。`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: CLASH & BATTLE ANALYSIS (勝負判定與勝率分析)
        ========================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-amber-600 uppercase font-mono tracking-wider">
                <Trophy className="w-4 h-4 text-amber-500" />
                Champions 即時對戰推演分析
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                【{myPokemon.nameZh}】對戰【{opponentPokemon.nameZh}】勝負判定
              </h3>
            </div>

            {/* Overall Advantage Badge */}
            <div className="flex items-center gap-3">
              <span
                className={`text-xs sm:text-sm font-black px-4 py-1.5 rounded-xl border ${getAdvantageBadge(
                  matchupResult.advantageTier
                )}`}
              >
                {matchupResult.advantageTier}
              </span>
            </div>
          </div>

          {/* Win Rate Bar & Key Metrics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black font-mono">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                我方勝率：{matchupResult.winRate}%
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                對手勝率：{opponentWinRate}%
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              </span>
            </div>

            {/* Visual Winrate Split Bar */}
            <div className="w-full h-3.5 bg-rose-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-blue-600 transition-all duration-500 ease-out h-full"
                style={{ width: `${matchupResult.winRate}%` }}
              />
              <div
                className="bg-rose-500 transition-all duration-500 ease-out h-full"
                style={{ width: `${opponentWinRate}%` }}
              />
            </div>

            {/* 3 Core Matchup Pillars (屬性倍率、速度線、太晶化建議) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {/* 1. Type Effectiveness */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[11px] font-black text-slate-500 uppercase font-mono">
                  18 屬性相剋倍率
                </div>
                <div className="text-sm font-black text-slate-900">
                  造成傷害：
                  <span className={matchupResult.typeMatchup.myOffenseMultiplier >= 2 ? 'text-emerald-700' : 'text-slate-800'}>
                    {matchupResult.typeMatchup.myOffenseMultiplier}x
                  </span>
                  {' '}vs 承受：
                  <span className={matchupResult.typeMatchup.opponentOffenseMultiplier >= 2 ? 'text-rose-700' : 'text-slate-800'}>
                    {matchupResult.typeMatchup.opponentOffenseMultiplier}x
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {matchupResult.typeMatchup.summary}
                </div>
              </div>

              {/* 2. Speed Tier Comparison */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[11px] font-black text-slate-500 uppercase font-mono">
                  速度線先手權 (Speed Tier)
                </div>
                <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-600" />
                  {matchupResult.speedAdvantage.summary}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {matchupResult.speedAdvantage.winner === 'my'
                    ? '我方享有自然先手主動權，可優先進攻或換人。'
                    : matchupResult.speedAdvantage.winner === 'opponent'
                    ? '對手先手速度更快，第一回合建議「守住」或靠道具換血。'
                    : '同速博弈，需注意隨機先手或先制招式。'}
                </div>
              </div>

              {/* 3. Recommended Tera Adaptation */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <div className="text-[11px] font-black text-amber-800 uppercase font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  對局推薦太晶屬性 (Tera Adaptation)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-950">
                    太晶【{matchupResult.recommendedTeraAdaptation.recommendedTera}】
                  </span>
                  {getTypeBadge(matchupResult.recommendedTeraAdaptation.recommendedTera)}
                </div>
                <div className="text-xs text-amber-900 font-medium">
                  {matchupResult.recommendedTeraAdaptation.rationale}
                </div>
              </div>
            </div>

            {/* Tactical Directives Summary Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 font-mono uppercase tracking-wider">
                  <Crosshair className="w-4 h-4" />
                  WCS 錦標賽核心對戰指令：
                </div>
                <button
                  onClick={handleToggleSpeech}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-white font-bold transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? '停止播報' : '語音播報指令'}</span>
                </button>
              </div>
              <ul className="space-y-1 text-xs text-slate-200 leading-relaxed font-sans">
                {matchupResult.tacticalDirectives.map((directive, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>{directive}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Streamlined Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-600 tracking-tight font-mono">POKÉMON CHAMPIONS</span>
            <span aria-hidden="true">·</span>
            <span>官方級別對戰配裝與 18 屬性勝率分析指南</span>
          </div>
          <div className="text-[11px] text-slate-600 font-mono">
            資料參考：
            <a
              href="https://victorpoke-champions.com/zh-TW/pokemon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:underline font-bold ml-1"
            >
              https://victorpoke-champions.com/zh-TW/pokemon
            </a>
          </div>
        </div>
      </footer>

      {/* Selectors Modals for Instant Pick from all Pokemon */}
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

      {/* Photo Recognition Modal */}
      <PhotoRecognitionModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSelectOpponent={(p) => setOpponentPokemon(p)}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSelectMyPokemon={(p) => setMyPokemon(p)}
        onSelectOpponentPokemon={(p) => setOpponentPokemon(p)}
        currentSpeechText={speechBriefingText}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
      />
    </div>
  );
}
