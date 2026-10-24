import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Check, Sparkles, AlertCircle, Play, Square } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { POKEMON_LIST } from '../data/pokemonData';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMyPokemon: (pokemon: Pokemon) => void;
  onSelectOpponentPokemon: (pokemon: Pokemon) => void;
  currentSpeechText?: string;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectMyPokemon,
  onSelectOpponentPokemon,
  currentSpeechText,
  isSpeaking,
  onToggleSpeech,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'zh-TW';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
        setVoiceFeedback('正在聆聽您的語音指令...');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('麥克風存取權限遭拒，請至瀏覽器設定允許存取麥克風。');
        } else if (event.error === 'no-speech') {
          setVoiceFeedback('未偵測到清晰語音，請重試或靠近麥克風。');
        } else {
          setErrorMsg(`語音辨識錯誤：${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Parse speech transcript to extract Pokemon and target (my or opponent)
  useEffect(() => {
    if (!transcript) return;

    const clean = transcript.trim();
    let target: 'my' | 'opponent' = 'opponent'; // default target is opponent
    let spokenName = clean;

    if (clean.includes('我方') || clean.includes('自己') || clean.includes('我選') || clean.includes('更換我')) {
      target = 'my';
      spokenName = clean.replace(/我方|自己|我選|更換我|是|切換成/g, '').trim();
    } else if (clean.includes('對手') || clean.includes('敵方') || clean.includes('打') || clean.includes('對象')) {
      target = 'opponent';
      spokenName = clean.replace(/對手|敵方|打|對象|是|切換成/g, '').trim();
    }

    // Try finding in POKEMON_LIST
    const matched = POKEMON_LIST.find((p) => {
      const zh = p.nameZh.toLowerCase();
      const en = p.nameEn.toLowerCase();
      const s = spokenName.toLowerCase();
      return (
        zh.includes(s) ||
        s.includes(zh) ||
        en.includes(s) ||
        s.includes(en)
      );
    });

    if (matched) {
      if (target === 'my') {
        onSelectMyPokemon(matched);
        setVoiceFeedback(`✅ 已識別指令！已將【我方】設為【${matched.nameZh}】`);
      } else {
        onSelectOpponentPokemon(matched);
        setVoiceFeedback(`✅ 已識別指令！已將【敵方對手】設為【${matched.nameZh}】`);
      }
    } else if (!isListening && clean.length > 0) {
      setVoiceFeedback(`已聽到：「${clean}」，未比對到對應寶可夢，請說出具體名稱（如：噴火龍、振翼髮）。`);
    }
  }, [transcript, isListening, onSelectMyPokemon, onSelectOpponentPokemon]);

  // Start listening
  const handleStartListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg('此瀏覽器未支援語音識別 API，建議使用 Google Chrome 或 Edge 瀏覽器。');
      return;
    }
    setTranscript('');
    setVoiceFeedback(null);
    setErrorMsg(null);
    try {
      recognitionRef.current.start();
    } catch {
      recognitionRef.current.stop();
      setTimeout(() => recognitionRef.current.start(), 200);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Quick preset voice test simulator buttons
  const handleSimulateVoice = (phrase: string) => {
    setTranscript(phrase);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                語音辨識與戰術朗讀助手
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                口說指令快速設定寶可夢，並支援世界冠軍級戰術即時語音朗讀
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Section A: Speech Recognition (語音輸入) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
            <div className="text-xs font-black text-slate-500 uppercase font-mono tracking-wider">
              語音辨識輸入 (Voice Input)
            </div>

            {/* Mic Pulse Button */}
            <div className="flex justify-center">
              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 scale-105 ring-4 ring-rose-200 animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-600 active:scale-95'
                }`}
                title={isListening ? '點擊停止聆聽' : '點擊開始語音辨識'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="text-xs font-bold text-slate-700">
              {isListening ? (
                <span className="text-rose-600 font-mono animate-pulse">
                  ● 正在聆聽中... 請說出指令（例如：「對手是振翼髮」）
                </span>
              ) : (
                <span>點擊麥克風按鈕開始口述指令</span>
              )}
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-800">
                辨識結果：「{transcript}」
              </div>
            )}

            {/* Feedback Status */}
            {voiceFeedback && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                {voiceFeedback}
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Preset Voice Command Chips */}
            <div className="pt-2 text-left space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                快捷語音模擬指令 (點擊測試)：
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '對手是古玉魚',
                  '對手是超級噴火龍X',
                  '對手是海豚俠',
                  '我方是熾焰咆哮虎',
                  '我方是超級巨金怪',
                ].map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulateVoice(cmd)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-slate-200 text-xs text-slate-700 font-bold transition-all cursor-pointer"
                  >
                    💬 {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section B: Speech Synthesis (女聲朗讀) */}
          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black text-blue-900 uppercase font-mono">
                  女聲戰術語音朗讀 (Female Voice Read Aloud)
                </span>
              </div>
              <button
                onClick={onToggleSpeech}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  isSpeaking
                    ? 'bg-rose-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    停止朗讀
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    開始女聲朗讀戰術
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-blue-100 font-medium">
              {currentSpeechText || '點擊上方按鈕，以自然優雅女聲即時朗讀當前對局勝率分析、速度線先手權及推薦出招策略。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
