/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { POKEMON_LIST } from './data/pokemonData';
import { Pokemon, PokemonType } from './types/pokemon';
import { Header } from './components/Header';
import { PokemonSelectorModal } from './components/PokemonSelectorModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import {
  recommendCounterTeam,
  calculate6v6Matrix,
  analyze6v6Tactics,
  RecommendedTeamMember,
} from './utils/teamBuilderEngine';
import {
  Camera,
  Upload,
  Crown,
  Shield,
  Zap,
  Volume2,
  Square,
  Sparkles,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Swords,
  Flame,
  Target,
  Trophy,
} from 'lucide-react';

// Preset opponent team templates for 1-click test
const PRESET_OPPONENT_TEAMS = [
  {
    name: 'WCS 冠軍核心隊',
    tag: '主流頂尖',
    ids: ['flutter_mane', 'incineroar', 'chi_yu', 'ogerpon_water', 'terapagos', 'metagross'],
  },
  {
    name: '晴天古代猛攻隊',
    tag: '極限物攻',
    ids: ['charizard', 'gouging_fire', 'chi_yu', 'landorus_t', 'raging_bolt', 'lopunny'],
  },
  {
    name: 'MEGA 強權平衡隊',
    tag: '種族極限',
    ids: ['mega_metagross', 'mega_dragonite', 'mega_blastoise', 'snorlax', 'mega_gengar', 'garchomp'],
  },
  {
    name: '極限雨天快攻隊',
    tag: '氣候體系',
    ids: ['pelipper', 'swampert', 'palafin', 'ampharos', 'scizor', 'milotic'],
  },
];

export default function App() {
  // ==========================================================
  // STEP 1 STATE: Opponent Team (6 Pokémon)
  // ==========================================================
  const [opponentTeam, setOpponentTeam] = useState<Pokemon[]>(() => {
    return [
      POKEMON_LIST.find((p) => p.id === 'flutter_mane') || POKEMON_LIST[0],
      POKEMON_LIST.find((p) => p.id === 'incineroar') || POKEMON_LIST[1],
      POKEMON_LIST.find((p) => p.id === 'chi_yu') || POKEMON_LIST[2],
      POKEMON_LIST.find((p) => p.id === 'ogerpon_water') || POKEMON_LIST[3],
      POKEMON_LIST.find((p) => p.id === 'terapagos') || POKEMON_LIST[4],
      POKEMON_LIST.find((p) => p.id === 'metagross') || POKEMON_LIST[5],
    ];
  });

  // Photo recognition states
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  // Manual replacement modal state
  const [editingOpponentIndex, setEditingOpponentIndex] = useState<number | null>(null);
  const [editingMyIndex, setEditingMyIndex] = useState<number | null>(null);

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Custom overrides for My Team if user manually edits any slot
  const [myCustomOverrides, setMyCustomOverrides] = useState<(Pokemon | null)[]>([
    null, null, null, null, null, null,
  ]);

  // AI 6v6 deep coach analysis state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);

  // Active tactical sub-tab
  const [activeTacticsTab, setActiveTacticsTab] = useState<'matrix' | 'speed' | 'tera' | 'ai'>('matrix');

  // Matrix cell selected for details
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{
    myPokemon: Pokemon;
    oppPokemon: Pokemon;
    myOff: number;
    oppOff: number;
    tip: string;
  } | null>(null);

  // Speech Synthesis state (女聲朗讀)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Synthesis & Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const updateVoices = () => {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          setVoices(list);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // ==========================================================
  // STEP 2 CALCULATION: Recommend Our Counter Team (6 Pokémon)
  // ==========================================================
  const rawRecommendedMembers = useMemo(() => {
    return recommendCounterTeam(opponentTeam);
  }, [opponentTeam]);

  // Combine recommendations with any manual overrides the player made
  const myTeamMembers: RecommendedTeamMember[] = useMemo(() => {
    return rawRecommendedMembers.map((rec, index) => {
      const override = myCustomOverrides[index];
      if (!override) return rec;

      return {
        ...rec,
        pokemon: override,
        counterRationale: `玩家手動微調替換：【${override.nameZh}】（${override.tier.split(' ')[0]}，種族值 ${override.baseStats.total}）。`,
        keyMove: override.builds[0]?.moves[0]?.nameZh || '主力攻擊',
        speedCompare: `速 ${override.baseStats.speed}`,
      };
    });
  }, [rawRecommendedMembers, myCustomOverrides]);

  const myTeam = useMemo(() => myTeamMembers.map((m) => m.pokemon), [myTeamMembers]);

  // ==========================================================
  // STEP 3 CALCULATION: 6v6 Strategic Tactics Analysis
  // ==========================================================
  const tacticsAnalysis = useMemo(() => {
    return analyze6v6Tactics(myTeamMembers, opponentTeam);
  }, [myTeamMembers, opponentTeam]);

  const matrixCells = useMemo(() => {
    return calculate6v6Matrix(myTeam, opponentTeam);
  }, [myTeam, opponentTeam]);

  // Find Pokémon helper
  const findPokemonByName = (nameZh?: string, nameEn?: string): Pokemon | undefined => {
    if (!nameZh && !nameEn) return undefined;
    const cleanZh = (nameZh || '').trim().toLowerCase();
    const cleanEn = (nameEn || '').trim().toLowerCase();

    return (
      POKEMON_LIST.find((p) => p.nameZh.toLowerCase() === cleanZh) ||
      POKEMON_LIST.find((p) => p.nameEn.toLowerCase() === cleanEn) ||
      POKEMON_LIST.find((p) => p.nameZh.includes(cleanZh) || cleanZh.includes(p.nameZh)) ||
      POKEMON_LIST.find((p) => p.nameEn.toLowerCase().includes(cleanEn) || cleanEn.includes(p.nameEn.toLowerCase()))
    );
  };

  // Handle Photo Recognition of Opponent Team (6 Pokémon)
  const handleProcessImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('請上傳有效的圖片檔案（PNG, JPG, WEBP）。');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploadedPreview(base64);
      setIsRecognizing(true);
      setRecognitionStatus('AI 正在精準辨識圖片中的敵方 6 隻寶可夢...');

      try {
        const resp = await fetch('/api/vision/recognize-team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await resp.json();
        if (data.success && data.data?.pokemonList?.length > 0) {
          const matchedList: Pokemon[] = [];
          data.data.pokemonList.forEach((item: any) => {
            const match = findPokemonByName(item.nameZh, item.nameEn);
            if (match && !matchedList.some((m) => m.id === match.id)) {
              matchedList.push(match);
            }
          });

          if (matchedList.length > 0) {
            const newTeam = [...matchedList];
            // If fewer than 6, supplement from default roster
            let fillIdx = 0;
            while (newTeam.length < 6 && fillIdx < POKEMON_LIST.length) {
              const cand = POKEMON_LIST[fillIdx];
              if (!newTeam.some((t) => t.id === cand.id)) {
                newTeam.push(cand);
              }
              fillIdx++;
            }
            setOpponentTeam(newTeam);
            // Reset manual overrides so system re-evaluates fresh counter team
            setMyCustomOverrides([null, null, null, null, null, null]);
            setRecognitionStatus(
              `✅ 辨識成功！偵測到：${matchedList.map((m) => m.nameZh).join('、')}（${data.data.teamArchetype || '對戰陣容'}）`
            );
          } else {
            setRecognitionStatus('未能在照片中精確匹配到圖鑑寶可夢，已維持目前陣容。');
          }
        } else {
          setRecognitionStatus('照片辨識未取得具體陣容資料，請確認照片清晰度。');
        }
      } catch (err: any) {
        setRecognitionStatus('辨識連線異常，請手動調整陣容或重試。');
      } finally {
        setIsRecognizing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Load preset opponent template
  const handleLoadPreset = (preset: (typeof PRESET_OPPONENT_TEAMS)[0]) => {
    const list = preset.ids
      .map((id) => POKEMON_LIST.find((p) => p.id === id))
      .filter((p): p is Pokemon => p !== undefined);
    if (list.length === 6) {
      setOpponentTeam(list);
      setMyCustomOverrides([null, null, null, null, null, null]);
      setUploadedPreview(null);
      setRecognitionStatus(`已載入經典範本：【${preset.name}】`);
    }
  };

  // Female voice read aloud
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
    const utterance = new SpeechSynthesisUtterance(tacticsAnalysis.speechSummary);
    utterance.lang = 'zh-TW';
    utterance.rate = 1.0;
    utterance.pitch = 1.2; // 女生自然甜美音調

    const availableVoices = voices.length > 0 ? voices : (synthRef.current.getVoices() || []);
    const isFemaleName = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.includes('female') ||
        lower.includes('girl') ||
        lower.includes('woman') ||
        lower.includes('hsiaochen') ||
        lower.includes('xiaoxiao') ||
        lower.includes('xiaoyi') ||
        lower.includes('mei-jia') ||
        lower.includes('ting-ting') ||
        lower.includes('zhiyu') ||
        lower.includes('hanhan') ||
        lower.includes('yaoyao') ||
        lower.includes('yating') ||
        lower.includes('sin-ji') ||
        lower.includes('huihui') ||
        name.includes('女') ||
        name.includes('國語（臺灣）') ||
        name.includes('美佳') ||
        name.includes('曉') ||
        name.includes('婷')
      );
    };

    const zhFemaleVoice = availableVoices.find(
      (v) => (v.lang.includes('zh') || v.lang.includes('cmn')) && isFemaleName(v.name)
    );
    const twVoice = availableVoices.find(
      (v) => v.lang.includes('zh-TW') || v.name.includes('Taiwan') || v.name.includes('國語')
    );
    const anyZhVoice = availableVoices.find((v) => v.lang.includes('zh'));
    const anyFemaleVoice = availableVoices.find((v) => isFemaleName(v.name));

    const selectedVoice = zhFemaleVoice || twVoice || anyZhVoice || anyFemaleVoice;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  // Live Gemini AI 6v6 Strategic Coach Analysis
  const handleGetAiAnalysis = async () => {
    setIsGeneratingAi(true);
    setActiveTacticsTab('ai');
    try {
      const resp = await fetch('/api/tactics/gemini-team-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myTeam: myTeamMembers.map((m) => ({
            nameZh: m.pokemon.nameZh,
            types: m.pokemon.types,
            baseStats: m.pokemon.baseStats,
            roleTitle: m.roleTitle,
          })),
          opponentTeam: opponentTeam.map((p) => ({
            nameZh: p.nameZh,
            types: p.types,
            baseStats: p.baseStats,
            weaknesses: p.weaknesses,
          })),
        }),
      });
      const data = await resp.json();
      if (data.analysis) {
        setAiAnalysisText(data.analysis);
      }
    } catch (err: any) {
      console.error('AI team analysis failed:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Type Badges styling
  const getTypeBadge = (type: PokemonType) => {
    const colors: Record<PokemonType, string> = {
      Normal: 'bg-slate-100 text-slate-700 border-slate-300',
      Fire: 'bg-orange-100 text-orange-800 border-orange-200',
      Water: 'bg-blue-100 text-blue-800 border-blue-200',
      Grass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Electric: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Ice: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      Fighting: 'bg-red-100 text-red-800 border-red-200',
      Poison: 'bg-purple-100 text-purple-800 border-purple-200',
      Ground: 'bg-amber-100 text-amber-800 border-amber-300',
      Flying: 'bg-sky-100 text-sky-800 border-sky-200',
      Psychic: 'bg-pink-100 text-pink-800 border-pink-200',
      Bug: 'bg-lime-100 text-lime-800 border-lime-200',
      Rock: 'bg-stone-100 text-stone-800 border-stone-300',
      Ghost: 'bg-violet-100 text-violet-800 border-violet-200',
      Dragon: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Steel: 'bg-zinc-200 text-zinc-800 border-zinc-300',
      Dark: 'bg-neutral-800 text-neutral-100 border-neutral-700',
      Fairy: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    const typeZhMap: Record<PokemonType, string> = {
      Normal: '一般', Fire: '火', Water: '水', Grass: '草', Electric: '電', Ice: '冰',
      Fighting: '格鬥', Poison: '毒', Ground: '地面', Flying: '飛行', Psychic: '超能力', Bug: '蟲',
      Rock: '岩石', Ghost: '幽靈', Dragon: '龍', Steel: '鋼', Dark: '惡', Fairy: '妖精',
    };

    return (
      <span
        key={type}
        className={`px-2 py-0.5 rounded-md text-xs font-bold border ${colors[type] || 'bg-slate-100 text-slate-800'}`}
      >
        {typeZhMap[type] || type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Header */}
      <Header
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onToggleSpeech={handleToggleSpeech}
        isSpeaking={isSpeaking}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* =========================================================
            WORKFLOW STEP INDICATOR BANNER
        ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                1
              </div>
              <div>
                <div className="text-xs font-black text-rose-900 uppercase font-mono tracking-wider">
                  步驟 (1) 照片辨識
                </div>
                <div className="text-sm font-bold text-slate-800">
                  對方寶可夢（6隻陣容）
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                2
              </div>
              <div>
                <div className="text-xs font-black text-blue-900 uppercase font-mono tracking-wider">
                  步驟 (2) 智能演算
                </div>
                <div className="text-sm font-bold text-slate-800">
                  建議我方對應寶可夢（6隻）
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                3
              </div>
              <div>
                <div className="text-xs font-black text-emerald-900 uppercase font-mono tracking-wider">
                  步驟 (3) 核心復盤
                </div>
                <div className="text-sm font-bold text-slate-800">
                  戰術分析
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 1: (1) 照片辨識對方寶可夢（6隻）
        ========================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 font-mono uppercase">
                  Step 1
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  (1) 照片辨識對方寶可夢（6隻）
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                拍攝或上傳 Switch 選人畫面、Showdown 對戰截圖，AI 自動提取並配置敵方 6 隻陣容
              </p>
            </div>

            {/* Photo Recognition Action Controls */}
            <div className="flex items-center flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImage(file);
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImage(file);
                }}
              />

              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={isRecognizing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
                title="即時拍照辨識"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>拍照辨識 6 隻</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecognizing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-800 text-xs font-bold border border-rose-300 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
                title="上傳圖片辨識"
              >
                <Upload className="w-3.5 h-3.5 text-rose-600" />
                <span>上傳截圖辨識</span>
              </button>
            </div>
          </div>

          {/* Photo recognition status & feedback banner */}
          {(isRecognizing || recognitionStatus || uploadedPreview) && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              {uploadedPreview && (
                <img
                  src={uploadedPreview}
                  alt="辨識照片預覽"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-300 shrink-0 shadow-2xs"
                />
              )}
              <div className="flex-1 text-xs">
                {isRecognizing ? (
                  <div className="flex items-center gap-2 text-rose-600 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini AI 正在深度辨識隊伍畫面中的 6 隻寶可夢角色...</span>
                  </div>
                ) : (
                  <div className="font-medium text-slate-700">
                    {recognitionStatus}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preset templates for quick 1-click test */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold shrink-0 font-mono text-[11px]">
              一鍵載入經典對手範本:
            </span>
            {PRESET_OPPONENT_TEAMS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleLoadPreset(preset)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 hover:border-rose-300 text-slate-700 font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs"
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Opponent 6-Pokemon Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {opponentTeam.map((pokemon, index) => (
              <div
                key={`${pokemon.id}-${index}`}
                className="relative rounded-2xl bg-rose-50/40 border border-rose-200/90 p-3 flex flex-col justify-between hover:border-rose-400 transition-all shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-rose-600 text-white">
                    Slot {index + 1}
                  </span>
                  <button
                    onClick={() => setEditingOpponentIndex(index)}
                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                  >
                    更換
                  </button>
                </div>

                <div className="my-2 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white rounded-xl border border-rose-200/80 p-1 flex items-center justify-center shadow-2xs">
                    <img
                      src={pokemon.officialArtUrl}
                      alt={pokemon.nameZh}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-2 truncate w-full">
                    {pokemon.nameZh}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono truncate w-full">
                    {pokemon.nameEn}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-rose-200/50">
                  <div className="flex flex-wrap justify-center gap-1">
                    {pokemon.types.map(getTypeBadge)}
                  </div>
                  <div className="text-[10px] text-slate-600 text-center font-mono">
                    速 <strong className="text-amber-700">{pokemon.baseStats.speed}</strong> · 總 {pokemon.baseStats.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 2: (2) 建議我方對應對戰寶可夢（6隻）
        ========================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300 font-mono uppercase">
                  Step 2
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  (2) 建議我方對應對戰寶可夢（6隻）
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                依據敵方 6 隻之弱點分佈與主力威脅，自動演算世界冠軍級最佳聯防反制陣容與 4 招式配置
              </p>
            </div>

            <button
              onClick={() => {
                setMyCustomOverrides([null, null, null, null, null, null]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="重設為演算法最佳建議"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>重新演算最佳推薦</span>
            </button>
          </div>

          {/* Recommended 6 Counter Pokémon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTeamMembers.map((member, index) => {
              const p = member.pokemon;
              const build = p.builds[0];

              return (
                <div
                  key={`${p.id}-${index}`}
                  className="rounded-2xl bg-blue-50/30 border border-blue-200 p-4 flex flex-col justify-between hover:border-blue-400 transition-all shadow-2xs space-y-3"
                >
                  {/* Card Header with Role Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white shadow-2xs font-mono">
                      {member.roleBadge}
                    </span>
                    <button
                      onClick={() => setEditingMyIndex(index)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                    >
                      更換
                    </button>
                  </div>

                  {/* Pokemon Main Info */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-18 h-18 bg-white rounded-xl border border-blue-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                      <img
                        src={p.officialArtUrl}
                        alt={p.nameZh}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain filter drop-shadow-xs"
                      />
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-black px-1 rounded bg-blue-600 text-white">
                        #{p.pokedexNumber}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <h4 className="text-base font-black text-slate-900 truncate">
                          {p.nameZh}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono truncate">
                          {p.nameEn}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {p.types.map(getTypeBadge)}
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {p.tier.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        速度 <strong className="text-amber-700 font-black">{p.baseStats.speed}</strong> · 總種族值 {p.baseStats.total}
                      </div>
                    </div>
                  </div>

                  {/* Target Opponents Chips */}
                  {member.targetOpponents.length > 0 && (
                    <div className="p-2 rounded-xl bg-white border border-blue-100 text-xs space-y-1">
                      <div className="text-[10px] font-black text-rose-700 uppercase font-mono">
                        🎯 針對打擊敵方目標:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.targetOpponents.map((opp) => (
                          <span
                            key={opp.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold"
                          >
                            <img
                              src={opp.officialArtUrl}
                              alt={opp.nameZh}
                              referrerPolicy="no-referrer"
                              className="w-3.5 h-3.5 object-contain"
                            />
                            {opp.nameZh}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tactical Rationale */}
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-blue-100">
                    {member.counterRationale}
                  </p>

                  {/* Competitive 4 Moves & Build Specs */}
                  <div className="pt-2 border-t border-blue-200/60 space-y-2 text-xs">
                    <div className="font-bold text-slate-700 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">推薦 4 技能組合:</span>
                      <span className="text-[11px] text-blue-700 font-mono font-bold">
                        太晶【{build?.teraType || 'Water'}】
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {build?.moves.slice(0, 4).map((move, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[11px]"
                        >
                          <span className="font-bold text-slate-800 truncate">{move.nameZh}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono shrink-0 ml-1">
                            {move.type}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                      <span>道具：<strong className="text-slate-800">{build?.heldItem.nameZh}</strong></span>
                      <span>特性：<strong className="text-slate-800">{build?.ability.nameZh}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            SECTION 3: (3) 戰術分析 (Tactics Analysis & Female TTS)
        ========================================================= */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono uppercase">
                  Step 3
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  (3) 戰術分析
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                全隊剋制矩陣、最佳首發推薦、速度線排行與太晶化發動時機速查
              </p>
            </div>

            {/* Read Aloud & AI Coach buttons */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-500 text-white ring-2 ring-rose-200 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                title="以甜美女聲朗讀戰術分析"
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>停止女聲朗讀</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>女聲朗讀戰術分析</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGetAiAnalysis}
                disabled={isGeneratingAi}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{isGeneratingAi ? 'AI 正在分析...' : 'AI 世界冠軍深度復盤'}</span>
              </button>
            </div>
          </div>

          {/* Top Key Tactical Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Win Rate Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-black text-slate-500 uppercase font-mono">
                整體預測勝率
              </span>
              <div className="my-2">
                <div className="text-3xl font-black text-blue-600 font-mono">
                  {tacticsAnalysis.winRate}%
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1">
                  {tacticsAnalysis.advantageTier}
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${tacticsAnalysis.winRate}%` }}
                />
              </div>
            </div>

            {/* 2. Lead Recommendation Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-black text-blue-700 uppercase font-mono flex items-center gap-1">
                <Zap className="w-3 h-3" />
                建議最佳首發組合 (Leads)
              </span>
              <div className="my-2 flex items-center gap-2">
                {tacticsAnalysis.leadRecommendation.leadPokemon.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                  >
                    <img
                      src={lead.officialArtUrl}
                      alt={lead.nameZh}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 object-contain"
                    />
                    <span>{lead.nameZh}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                掌握首回合控速與先手權
              </p>
            </div>

            {/* 3. Threat Neutralization Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-black text-rose-700 uppercase font-mono flex items-center gap-1">
                <Target className="w-3 h-3" />
                敵方頭號威脅消滅
              </span>
              <div className="my-2 flex items-center gap-2">
                <img
                  src={tacticsAnalysis.threatAnalysis.highestThreat.officialArtUrl}
                  alt={tacticsAnalysis.threatAnalysis.highestThreat.nameZh}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain"
                />
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {tacticsAnalysis.threatAnalysis.highestThreat.nameZh}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    速 {tacticsAnalysis.threatAnalysis.highestThreat.baseStats.speed}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                {tacticsAnalysis.threatAnalysis.counterSolution}
              </p>
            </div>

            {/* 4. Tera Priority Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-black text-amber-700 uppercase font-mono flex items-center gap-1">
                <Crown className="w-3 h-3" />
                第一優先太晶化推薦
              </span>
              <div className="my-2 flex items-center gap-2">
                <img
                  src={tacticsAnalysis.teraPriority.recommendedPokemon.officialArtUrl}
                  alt={tacticsAnalysis.teraPriority.recommendedPokemon.nameZh}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain"
                />
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {tacticsAnalysis.teraPriority.recommendedPokemon.nameZh}
                  </div>
                  <div className="text-[10px] text-amber-800 font-bold font-mono">
                    太晶【{tacticsAnalysis.teraPriority.teraType}】
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                規避弱點致命傷並提供斬殺火力
              </p>
            </div>
          </div>

          {/* Tactical Sub-Tabs Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTacticsTab('matrix')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTacticsTab === 'matrix'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ⚔️ 6v6 剋制覆蓋矩陣
            </button>
            <button
              onClick={() => setActiveTacticsTab('speed')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTacticsTab === 'speed'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ⚡ 雙方速度線排行 (12隻比對)
            </button>
            <button
              onClick={() => setActiveTacticsTab('tera')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTacticsTab === 'tera'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🛡️ 開局博弈與太晶化轉折
            </button>
            {aiAnalysisText && (
              <button
                onClick={() => setActiveTacticsTab('ai')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTacticsTab === 'ai'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                ✨ AI 世界冠軍復盤分析
              </button>
            )}
          </div>

          {/* Sub-Tab 1: 6x6 Coverage Matrix */}
          {activeTacticsTab === 'matrix' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                點擊任一網格查看該對位的屬性打擊倍率與實戰出招提示：
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3 font-black text-slate-500 font-mono">我方 \ 敵方</th>
                      {opponentTeam.map((opp, idx) => (
                        <th key={opp.id} className="p-2 text-center">
                          <div className="flex flex-col items-center">
                            <img
                              src={opp.officialArtUrl}
                              alt={opp.nameZh}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 object-contain"
                            />
                            <span className="font-bold text-slate-800 text-[11px] mt-1 truncate max-w-[64px]">
                              {opp.nameZh}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myTeam.map((my) => (
                      <tr key={my.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50/40 border-r border-slate-200">
                          <div className="flex items-center gap-2">
                            <img
                              src={my.officialArtUrl}
                              alt={my.nameZh}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 object-contain shrink-0"
                            />
                            <span className="truncate max-w-[90px]">{my.nameZh}</span>
                          </div>
                        </td>

                        {opponentTeam.map((opp) => {
                          const cell = matrixCells.find(
                            (c) => c.myPokemonId === my.id && c.opponentPokemonId === opp.id
                          );
                          const isAdv = cell?.status === 'advantage';
                          const isDis = cell?.status === 'disadvantage';

                          return (
                            <td
                              key={opp.id}
                              onClick={() => {
                                if (cell) {
                                  setSelectedMatrixCell({
                                    myPokemon: my,
                                    oppPokemon: opp,
                                    myOff: cell.myOffenseMult,
                                    oppOff: cell.opponentOffenseMult,
                                    tip: cell.tip,
                                  });
                                }
                              }}
                              className={`p-2 text-center font-mono font-bold cursor-pointer transition-colors border-r border-slate-100 ${
                                isAdv
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : isDis
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div className="text-[11px]">
                                {cell?.myOffenseMult}x
                              </div>
                              <span className="text-[9px] font-normal block text-slate-400">
                                {isAdv ? '🟢 佔優' : isDis ? '🔴 劣勢' : '⚪ 平手'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected Cell Modal/Detail */}
              {selectedMatrixCell && (
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-blue-900">
                      【我方 {selectedMatrixCell.myPokemon.nameZh}】VS【敵方 {selectedMatrixCell.oppPokemon.nameZh}】
                    </div>
                    <div className="text-slate-600">
                      我方輸出打擊：<strong className="text-emerald-700 font-mono">{selectedMatrixCell.myOff}x</strong> · 對手輸出打擊：<strong className="text-rose-700 font-mono">{selectedMatrixCell.oppOff}x</strong>。
                      {selectedMatrixCell.tip}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMatrixCell(null)}
                    className="text-xs text-blue-700 font-bold underline cursor-pointer shrink-0"
                  >
                    關閉
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Speed Tiers Ranking */}
          {activeTacticsTab === 'speed' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                速度線全體排行（決定首回合出招先手權，藍色為我方，紅色為敵方）：
              </div>
              <div className="space-y-1.5">
                {tacticsAnalysis.speedTiers.map((item) => (
                  <div
                    key={`${item.pokemon.id}-${item.speedRank}`}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      item.isMyTeam
                        ? 'bg-blue-50/60 border-blue-200 text-blue-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-mono font-black text-slate-400 text-xs">
                        #{item.speedRank}
                      </span>
                      <img
                        src={item.pokemon.officialArtUrl}
                        alt={item.pokemon.nameZh}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 object-contain"
                      />
                      <span className="font-bold">{item.pokemon.nameZh}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                        {item.isMyTeam ? '我方隊伍' : '敵方對手'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-200 rounded-full h-1.5 hidden sm:block overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${item.isMyTeam ? 'bg-blue-600' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, (item.speed / 160) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-black text-sm">
                        速 {item.speed}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Tera & Lead Strategy Details */}
          {activeTacticsTab === 'tera' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                <h4 className="font-black text-blue-900 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  首回合開局與先手權博弈指引
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {tacticsAnalysis.leadRecommendation.leadStrategy}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                <h4 className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-600" />
                  關鍵太晶化發動時機與防禦轉折
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {tacticsAnalysis.teraPriority.rationale}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                <h4 className="font-black text-rose-900 text-sm flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-rose-600" />
                  敵方頭號主力威脅消滅指引
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {tacticsAnalysis.threatAnalysis.threatReason} {tacticsAnalysis.threatAnalysis.counterSolution}
                </p>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: AI Deep Coach Breakdown */}
          {activeTacticsTab === 'ai' && aiAnalysisText && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed space-y-3 font-sans">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 font-black text-slate-800 text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Gemini AI 世界大賽冠軍教練 6v6 深度戰術復盤
              </div>
              <div className="whitespace-pre-wrap text-slate-700">
                {aiAnalysisText}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Streamlined Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-600 tracking-tight font-mono">POKÉMON CHAMPIONS</span>
            <span aria-hidden="true">·</span>
            <span>(1) 照片辨識 (2) 建議我方6隻 (3) 戰術分析</span>
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

      {/* Selector Modal for Opponent Slot Replacement */}
      <PokemonSelectorModal
        isOpen={editingOpponentIndex !== null}
        onClose={() => setEditingOpponentIndex(null)}
        onSelect={(p) => {
          if (editingOpponentIndex !== null) {
            const updated = [...opponentTeam];
            updated[editingOpponentIndex] = p;
            setOpponentTeam(updated);
            setEditingOpponentIndex(null);
          }
        }}
        title={`更換敵方第 ${editingOpponentIndex !== null ? editingOpponentIndex + 1 : 1} 隻寶可夢`}
        currentSelectedId={editingOpponentIndex !== null ? opponentTeam[editingOpponentIndex]?.id : undefined}
      />

      {/* Selector Modal for My Team Slot Replacement */}
      <PokemonSelectorModal
        isOpen={editingMyIndex !== null}
        onClose={() => setEditingMyIndex(null)}
        onSelect={(p) => {
          if (editingMyIndex !== null) {
            const updatedOverrides = [...myCustomOverrides];
            updatedOverrides[editingMyIndex] = p;
            setMyCustomOverrides(updatedOverrides);
            setEditingMyIndex(null);
          }
        }}
        title={`更換我方第 ${editingMyIndex !== null ? editingMyIndex + 1 : 1} 隻寶可夢`}
        currentSelectedId={editingMyIndex !== null ? myTeam[editingMyIndex]?.id : undefined}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSelectMyPokemon={(p) => {
          const updated = [...myCustomOverrides];
          updated[0] = p;
          setMyCustomOverrides(updated);
        }}
        onSelectOpponentPokemon={(p) => {
          const updated = [...opponentTeam];
          updated[0] = p;
          setOpponentTeam(updated);
        }}
        currentSpeechText={tacticsAnalysis.speechSummary}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
      />
    </div>
  );
}
