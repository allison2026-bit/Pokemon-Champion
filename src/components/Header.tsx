import React from 'react';
import { Crown } from 'lucide-react';

interface HeaderProps {
  onOpenVoiceModal?: () => void;
  onOpenPhotoModal?: () => void;
  onToggleSpeech?: () => void;
  isSpeaking?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
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
                <span className="text-amber-600">CHAMPION</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              級別賽對戰分析 · ① 照片辨識對方(6隻) ② 建議我方對應(6隻) ③ 戰術分析
            </p>
          </div>
        </div>

        {/* Controls: Voice, Photo, Speech */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Voice Read Aloud Toggle (Female Voice) */}
          {onToggleSpeech && (
            <button
              onClick={onToggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white ring-2 ring-rose-200 animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
              title={isSpeaking ? '點擊停止語音朗讀' : '點擊開始女聲朗讀戰術分析'}
            >
              <span>{isSpeaking ? '🔊 播報中' : '🔈 女聲朗讀'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
