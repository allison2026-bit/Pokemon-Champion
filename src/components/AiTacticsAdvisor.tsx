import React, { useState } from 'react';
import { Pokemon, CompetitiveBuild, BattleFormat } from '../types/pokemon';
import { Sparkles, Send, X, Loader2, Bot, HelpCircle, CheckCircle2, Trophy, Swords } from 'lucide-react';

interface AiTacticsAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  myPokemon: Pokemon;
  opponentPokemon: Pokemon;
  format?: BattleFormat;
  myBuild?: CompetitiveBuild;
}

export const AiTacticsAdvisor: React.FC<AiTacticsAdvisorProps> = ({
  isOpen,
  onClose,
  myPokemon,
  opponentPokemon,
  format = 'Double',
  myBuild,
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeBuild = myBuild || myPokemon.builds[0];

  const quickPrompts = [
    '【首回合站位與擊掌奇襲博弈】：開局面對對手首發，如何利用威嚇、先制招式搶佔第一回合控場優勢？',
    '【太晶屬性切入時機】：面對敵方剋制招式，何時交出太晶化（Tera）規避致死打擊並打出反殺？',
    '【速度線與順風/空間軸】：雙方基準速度與圍巾/驅勁能量交鋒，如何奪取絕對先手權？',
    '【殘局收割與保排輪轉】：如何透過屬性抵抗聯防換人，並掩護核心主力完成最後清場？',
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const q = customPrompt || question;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/tactics/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myPokemon,
          opponentPokemon,
          format,
          myBuild: activeBuild,
          question: q,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data.analysis);
      } else {
        setErrorMsg(data.error || '分析生成失敗');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('無法連接至伺服器戰術分析模組，請稍後重試。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                Champions 冠軍級戰術 AI 顧問
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                  Gemini 3.8 Pro Tactics
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                WCS 世界錦標賽標準 ·【{myPokemon.nameZh} vs {opponentPokemon.nameZh}】勝負微操推演
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
          {/* Quick Matchup Context Pill Bar */}
          <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900">{myPokemon.nameZh}</span>
              <span className="text-slate-400">({myPokemon.types.join('/')})</span>
              <span className="text-amber-600 font-black">VS</span>
              <span className="font-black text-slate-900">{opponentPokemon.nameZh}</span>
              <span className="text-slate-400">({opponentPokemon.types.join('/')})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono">賽制:</span>
              <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-mono">
                {format === 'Double' ? 'VGC 官方雙打' : '單打對抗'}
              </span>
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <label className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              常見 Champions 頂級賽事決策課題：
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((promptText, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleGenerate(promptText)}
                  className="text-left p-3 rounded-xl bg-white hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 text-xs text-slate-700 transition-all font-medium flex items-start gap-2 group shadow-2xs active:scale-98"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-100 group-hover:bg-amber-100 text-slate-500 group-hover:text-amber-700 flex items-center justify-center text-[10px] shrink-0 font-mono font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="line-clamp-2 leading-relaxed">{promptText}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Question Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 font-mono">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              自訂對局戰術提問：
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例如：面對對手帶太晶草的土地雲，我方第一回合應該優先開順風還是直接打巨獸斬？"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-2xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && question.trim()) {
                    handleGenerate();
                  }
                }}
              />
              <button
                disabled={isLoading || !question.trim()}
                onClick={() => handleGenerate()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                諮詢戰術
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Analysis Result Display */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <div className="text-sm font-bold text-slate-800">
                Champions AI 正在計算屬性倍率、速度線與太晶輪轉鏈...
              </div>
              <p className="text-xs text-slate-400 font-mono">
                分析雙打保護機制、道具互動與勝率最佳解
              </p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="p-5 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black text-amber-800 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  WCS 冠軍教練組戰術推演決策報告
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  即時推演完成
                </span>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                {analysisResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
