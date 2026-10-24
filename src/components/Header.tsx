import React from 'react';
import { Trophy, Swords, Shield, Crown } from 'lucide-react';

interface HeaderProps {
  activeTab: 'matchup' | 'builds' | 'tierlist';
  onSelectTab: (tab: 'matchup' | 'builds' | 'tierlist') => void;
  onRandomMatchup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onRandomMatchup,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center shadow-sm shadow-amber-500/20 text-white">
            <Crown className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900 whitespace-nowrap">
                POKÉMON <span className="text-amber-600">CHAMPIONS</span>
              </span>
              <span className="text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase font-mono">
                52POKE 對戰指南
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight hidden sm:block">
              Pokémon Champions 官方對戰數據庫 · 屬性剋制與賽事配裝推薦
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
          <button
            onClick={() => onSelectTab('matchup')}
            className={`transition-colors whitespace-nowrap pb-1 flex items-center gap-1.5 ${
              activeTab === 'matchup'
                ? 'text-amber-600 border-b-2 border-amber-600 font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Swords className="w-4 h-4" />
            對戰勝率與剋制推演
          </button>
          <button
            onClick={() => onSelectTab('builds')}
            className={`transition-colors whitespace-nowrap pb-1 flex items-center gap-1.5 ${
              activeTab === 'builds'
                ? 'text-amber-600 border-b-2 border-amber-600 font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            Champions 最佳配招裝備
          </button>
          <button
            onClick={() => onSelectTab('tierlist')}
            className={`transition-colors whitespace-nowrap pb-1 flex items-center gap-1.5 ${
              activeTab === 'tierlist'
                ? 'text-amber-600 border-b-2 border-amber-600 font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Champions 級別天梯榜
          </button>
        </nav>

        {/* Zone 3: 1 Primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRandomMatchup}
            className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            隨機對決推薦
          </button>
        </div>
      </div>
    </header>
  );
};
