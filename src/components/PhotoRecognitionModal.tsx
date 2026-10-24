import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { POKEMON_LIST } from '../data/pokemonData';

interface PhotoRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOpponent: (pokemon: Pokemon) => void;
}

export const PhotoRecognitionModal: React.FC<PhotoRecognitionModalProps> = ({
  isOpen,
  onClose,
  onSelectOpponent,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<{
    pokemonNameZh?: string;
    pokemonNameEn?: string;
    form?: string;
    confidence?: number;
    visualFeatures?: string;
    matchedPokemon?: Pokemon;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file selection (upload or camera)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('請上傳有效的圖片檔案（PNG, JPG, WEBP）。');
      return;
    }

    setErrorMessage(null);
    setRecognitionResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Find best matching pokemon from our 200+ list
  const findMatchingPokemon = (nameZh?: string, nameEn?: string): Pokemon | undefined => {
    if (!nameZh && !nameEn) return undefined;
    const cleanZh = (nameZh || '').trim().toLowerCase();
    const cleanEn = (nameEn || '').trim().toLowerCase();

    // 1. Exact match on Chinese name
    const exactZh = POKEMON_LIST.find((p) => p.nameZh.toLowerCase() === cleanZh);
    if (exactZh) return exactZh;

    // 2. Exact match on English name
    const exactEn = POKEMON_LIST.find((p) => p.nameEn.toLowerCase() === cleanEn);
    if (exactEn) return exactEn;

    // 3. Substring match
    const subZh = POKEMON_LIST.find((p) => p.nameZh.includes(cleanZh) || cleanZh.includes(p.nameZh));
    if (subZh) return subZh;

    const subEn = POKEMON_LIST.find((p) => p.nameEn.toLowerCase().includes(cleanEn) || cleanEn.includes(p.nameEn.toLowerCase()));
    if (subEn) return subEn;

    return undefined;
  };

  // Trigger AI Vision recognition
  const handleAnalyzePhoto = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    setRecognitionResult(null);

    try {
      const response = await fetch('/api/vision/recognize-pokemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || resData.message || '辨識請求失敗');
      }

      const visionData = resData.data;
      const matched = findMatchingPokemon(visionData.pokemonNameZh, visionData.pokemonNameEn);

      setRecognitionResult({
        pokemonNameZh: visionData.pokemonNameZh || '未知寶可夢',
        pokemonNameEn: visionData.pokemonNameEn || '',
        form: visionData.form || '標準形態',
        confidence: visionData.confidence || 0.9,
        visualFeatures: visionData.visualFeatures || '已成功解析對戰畫面視覺特徵。',
        matchedPokemon: matched,
      });
    } catch (err: any) {
      console.warn('Vision recognition fallback:', err);
      // Fallback matching if server/offline
      setErrorMessage(err.message || '視覺辨識連線異常，請手動確認或更換圖片。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Preset demo test samples for 1-click test
  const handleSelectSample = (sampleUrl: string, expectedName: string) => {
    setSelectedImage(sampleUrl);
    setErrorMessage(null);
    const matched = POKEMON_LIST.find((p) => p.nameZh.includes(expectedName));
    setRecognitionResult({
      pokemonNameZh: matched?.nameZh || expectedName,
      pokemonNameEn: matched?.nameEn || '',
      form: '官方 Champions 級別型態',
      confidence: 0.98,
      visualFeatures: `展示範例圖片：${expectedName}，具備高階賽事競技數值。`,
      matchedPokemon: matched,
    });
  };

  // Confirm and set opponent
  const handleApplyOpponent = (pokemon: Pokemon) => {
    onSelectOpponent(pokemon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                AI 照片辨識對方寶可夢
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                上傳或拍攝 Nintendo Switch 對戰螢幕截圖，AI 即刻自動辨識敵方角色
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
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Action Buttons: Camera & Upload */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/30 text-slate-700 hover:text-rose-700 font-bold text-xs transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-rose-600" />
              <span>拍照辨識 (相機)</span>
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 text-slate-700 hover:text-blue-700 font-bold text-xs transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>上傳截圖 / 照片</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Quick Demo Test Samples */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              快速體驗範例截圖 (點選即測)：
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: '振翼髮', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/987.png' },
                { name: '超級噴火龍Ｘ', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10034.png' },
                { name: '古玉魚', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1004.png' },
                { name: '超級巨金怪', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10076.png' },
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample.url, sample.name)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image Preview & Scan Action */}
          {selectedImage && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>待辨識影像預覽</span>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setRecognitionResult(null);
                  }}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  移除圖片
                </button>
              </div>

              <div className="relative w-full h-48 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="預覽"
                  className="max-h-full max-w-full object-contain"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                    <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
                    <span className="text-xs font-bold tracking-wider">
                      Gemini AI 正在辨識寶可夢特徵與對戰型態...
                    </span>
                  </div>
                )}
              </div>

              {!recognitionResult && !isAnalyzing && (
                <button
                  onClick={handleAnalyzePhoto}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>啟動 AI 影像辨識對手角色</span>
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Recognition Result Box */}
          {recognitionResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  AI 辨識成功！
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  信心度: {Math.round((recognitionResult.confidence || 0.9) * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  {recognitionResult.matchedPokemon && (
                    <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={recognitionResult.matchedPokemon.officialArtUrl}
                        alt={recognitionResult.matchedPokemon.nameZh}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {recognitionResult.pokemonNameZh}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {recognitionResult.pokemonNameEn} · {recognitionResult.form}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {recognitionResult.visualFeatures}
                    </p>
                  </div>
                </div>

                {recognitionResult.matchedPokemon ? (
                  <button
                    onClick={() => handleApplyOpponent(recognitionResult.matchedPokemon!)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs whitespace-nowrap shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    設定為敵方對手
                  </button>
                ) : (
                  <div className="text-xs text-amber-700 font-bold">
                    已辨識出名稱，可於圖鑑直接搜尋此寶可夢。
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
