import React from 'react';
import { Crown, Sparkles, Shuffle, Shield, Swords } from 'lucide-react';
import { BattleFormat } from '../types/pokemon';

interface HeaderProps {
  format: BattleFormat;
  onChangeFormat: (format: BattleFormat) => void;
  onRandomMatchup: () => void;
  onOpenVoiceModal?: () => void;
  onOpenPhotoModal?: () => void;
  onToggleSpeech?: () => void;
  isSpeaking?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  format,
  onChangeFormat,
  onRandomMatchup,
  onOpenVoiceModal,
  onOpenPhotoModal,
  onToggleSpeech,
  isSpeaking = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <Crown className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 whitespace-nowrap">
                POKÉMON <span className="text-amber-600">CHAMPIONS</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase font-mono">
                VICTOR POKE 冠軍級別
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              官方級別賽對戰分析 · 最佳 4 技能組合與裝備推薦速查
            </p>
          </div>
        </div>

        {/* Controls: Battle Format & Random Matchup */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Format Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => onChangeFormat('Double')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                format === 'Double'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              VGC 雙打
            </button>
            <button
              onClick={() => onChangeFormat('Single')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                format === 'Single'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              單打對戰
            </button>
          </div>

          {/* Random Button */}
          <button
            onClick={onRandomMatchup}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="隨機推薦熱門對局"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">隨機</span>
          </button>

          {/* Voice Assistant Button */}
          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="語音辨識指令"
            >
              <span className="text-amber-600 font-bold">🎙️</span>
              <span className="hidden md:inline">語音助手</span>
            </button>
          )}

          {/* Photo Recognition Button */}
          {onOpenPhotoModal && (
            <button
              onClick={onOpenPhotoModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="照片辨識對方寶可夢"
            >
              <span className="text-rose-600 font-bold">📷</span>
              <span className="hidden md:inline">照片辨識</span>
            </button>
          )}

          {/* Voice Read Aloud Toggle */}
          {onToggleSpeech && (
            <button
              onClick={onToggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer ${
                isSpeaking
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
              title={isSpeaking ? '點擊停止語音朗讀' : '點擊語音朗讀戰術分析'}
            >
              <span>{isSpeaking ? '🔊 播報中' : '🔈 朗讀'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
