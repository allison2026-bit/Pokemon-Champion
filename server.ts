import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API route for AI Champions Strategic Matchup Analysis
app.post('/api/tactics/gemini-analysis', async (req, res) => {
  try {
    const { myPokemon, opponentPokemon, format = 'Double', myBuild, question } = req.body;

    if (!myPokemon || !opponentPokemon) {
      return res.status(400).json({ error: '缺少寶可夢資料' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        analysis: `【戰術分析提示】目前處於本機離線戰術模式。
對戰建議：${myPokemon.nameZh}（屬性：${myPokemon.types.join('/')}）面對 ${opponentPokemon.nameZh}（屬性：${opponentPokemon.types.join('/')}）時，請參考「對位勝率分析」中的屬性剋制倍率與速度線優先度。
在 ${format === 'Double' ? 'VGC 雙打' : '單打'} 環境下，請特別注意首回合「守住」與「擊掌奇襲」的博弈，並在敵方交出高威力剋制技能時精準太晶化進行反制！`,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const activeBuild = myBuild || myPokemon.builds?.[0];

    const prompt = `你是《寶可夢 Champions》（Pokémon Champions）WCS 世界錦標賽（World Championships）總冠軍主教練與資深職業選手對戰數據分析師。
請針對以下兩位玩家的 Champions 官方級別賽對決，提供具備世界冠軍決賽水準的精闢對局戰術指引（請以繁體中文回答）：

【賽制規格】：${format === 'Double' ? 'VGC 官方雙打 (Double Battle)' : '官方單打排位 (Single Battle)'}

【我方寶可夢 (藍方)】：${myPokemon.nameZh}（${myPokemon.nameEn} · #${myPokemon.pokedexNumber}）
- 屬性：${myPokemon.types.join(' / ')}
- 基準速度：${myPokemon.baseStats.speed} | 總種族值：${myPokemon.baseStats.total}
- 核心特性：${activeBuild?.ability?.nameZh || myPokemon.primaryAbility.nameZh}
- 攜帶道具：${activeBuild?.heldItem?.nameZh || '推薦道具'}（${activeBuild?.heldItem?.effect || ''}）
- 推薦太晶屬性：太晶【${activeBuild?.teraType || 'Water'}】
- 性格與努力值：${activeBuild?.nature || '爽朗'} | ${activeBuild?.evSpread || '標準分配'}
- 4 招式配置：${activeBuild?.moves ? activeBuild.moves.map((m: any) => `${m.nameZh}(${m.type} ${m.category})`).join('、') : '標準四招'}

【敵方對手寶可夢 (紅方)】：${opponentPokemon.nameZh}（${opponentPokemon.nameEn} · #${opponentPokemon.pokedexNumber}）
- 屬性：${opponentPokemon.types.join(' / ')}
- 基準速度：${opponentPokemon.baseStats.speed} | 總種族值：${opponentPokemon.baseStats.total}
- 弱點屬性：${opponentPokemon.weaknesses?.join('、') || '無'}

${question ? `【玩家戰術諮詢提問】：${question}` : ''}

請以世界錦標賽決賽級別之博弈維度，提供以下 4 大結構化戰術拆解：
1. ⚡【首回合出招與先手權博弈】：速度線比對（${myPokemon.nameZh} 速 ${myPokemon.baseStats.speed} vs ${opponentPokemon.nameZh} 速 ${opponentPokemon.baseStats.speed}）、先制招式（如神速/擊掌奇襲/突襲）、圍巾/驅勁能量可能造成的速度翻轉，以及開局該強攻、守住還是換人。
2. 🛡️【太晶屬性防禦與斬殺反轉】：我方太晶化【${activeBuild?.teraType || 'Water'}】的最佳發動時機，如何化解對手的剋制招式，並在何種血線下直接觸發逆轉擊殺。
3. 🎯【招式選擇與傷害計算臨界點】：面對對手的屬性抗性與防守特點，我方 4 個招式的最優出招優先級，以及如何規避對手氣勢披帶或強化特性的陷阱。
4. 🤝【雙打聯手輪轉與聯防保排】：${format === 'Double' ? '推薦的最佳聯手搭檔（如熾焰咆哮虎威嚇、快龍神速、敗露球菇憤怒粉），如何透過換人輪轉化解敵方攻勢並維持主動權。' : '後備隊友聯防切換建議，如何透過屬性抵抗換入並完成殘局清場。'}

要求：繁體中文、專業電競對戰術語精確（VGC 雙打博弈、守住、輪轉、太晶化、速度線、確一/確二斬殺線），條理清晰有權威感！`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Gemini analysis error:', error);
    return res.status(500).json({
      error: error.message || 'AI 戰術顧問分析生成失敗，請稍後再試。',
    });
  }
});

// Start Express server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
