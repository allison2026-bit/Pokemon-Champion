import React, { useState, useMemo } from 'react';
import { Pokemon, PokemonType } from '../types/pokemon';
import { POKEMON_LIST } from '../data/pokemonData';
import { Search, X, Trophy, Sparkles, Filter } from 'lucide-react';

interface PokemonSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemon: Pokemon) => void;
  title: string;
  currentSelectedId?: string;
}

const ALL_TYPES: PokemonType[] = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy',
];

const TYPE_TRANSLATIONS: Record<PokemonType, string> = {
  Normal: '一般', Fire: '火', Water: '水', Grass: '草', Electric: '電', Ice: '冰',
  Fighting: '格鬥', Poison: '毒', Ground: '地面', Flying: '飛行', Psychic: '超能力', Bug: '蟲',
  Rock: '岩石', Ghost: '幽靈', Dragon: '龍', Steel: '鋼', Dark: '惡', Fairy: '妖精',
};

export const PokemonSelectorModal: React.FC<PokemonSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  currentSelectedId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const filteredPokemon = useMemo(() => {
    return POKEMON_LIST.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.nameZh.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.pokedexNumber.toString().includes(q);

      const matchesType =
        selectedType === 'ALL' || p.types.includes(selectedType as PokemonType);

      const matchesTier =
        selectedTier === 'ALL' || p.tier.startsWith(selectedTier);

      return matchesSearch && matchesType && matchesTier;
    });
  }, [searchQuery, selectedType, selectedTier]);

  if (!isOpen) return null;

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
        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${colors[type] || 'bg-slate-100'}`}
      >
        {TYPE_TRANSLATIONS[type]} ({type})
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header - Pure White */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                從 52POKE Champions 官方級別賽名單挑選參賽寶可夢
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

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/60 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋寶可夢中文名、英文名或全國圖鑑編號（例如：咆哮虎、Incineroar、727）..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                清除
              </button>
            )}
          </div>

          {/* Tier & 18-Type Filter Chips */}
          <div className="space-y-2">
            {/* Tier Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 font-mono">階層：</span>
              {['ALL', 'S+', 'S', 'A+'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedTier === tier
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tier === 'ALL' ? '全部階層' : tier}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 font-mono">屬性：</span>
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedType === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                全部屬性
              </button>
              {ALL_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedType === type
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {TYPE_TRANSLATIONS[type]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pokemon Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
          <div className="text-xs text-slate-500 font-bold mb-3 font-mono">
            共找到 {filteredPokemon.length} 隻符合條件的 Champions 寶可夢
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPokemon.map((p) => {
              const isSelected = p.id === currentSelectedId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
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
                        <span className="text-[10px] font-mono text-slate-400">
                          #{p.pokedexNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.types.map(getTypeBadge)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        速度 <span className="font-bold text-amber-700">{p.baseStats.speed}</span> · 勝率 <span className="font-bold text-emerald-700">{p.winRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-block text-[10px] font-mono font-black text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
                      {p.tier.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
