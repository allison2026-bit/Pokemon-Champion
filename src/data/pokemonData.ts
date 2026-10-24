import { Pokemon, PokemonType, ChampionsTier, CompetitiveBuild, ChampionMove } from '../types/pokemon';
import { CHAMPION_HELD_ITEMS } from './heldItems';
import { calculateTypeRelations } from '../utils/matchupEngine';

interface RawChampionSpec {
  id: string;
  num: number;
  nameZh: string;
  nameEn: string;
  types: PokemonType[];
  tier?: ChampionsTier;
  isMega?: boolean;
  hp?: number;
  atk?: number;
  def?: number;
  spa?: number;
  spd?: number;
  spe?: number;
  abilityZh?: string;
  abilityEn?: string;
  abilityDesc?: string;
  signatureMove?: {
    nameZh: string;
    nameEn: string;
    type: PokemonType;
    category: 'Physical' | 'Special' | 'Status';
    power: number;
    accuracy: number;
    tip: string;
  };
}

// Complete Champions Roster from victorpoke-champions.com and 52poke database (over 200+ confirmed entries)
const RAW_ROSTER: RawChampionSpec[] = [
  // Gen 1
  { id: 'venusaur', num: 3, nameZh: '妙蛙花', nameEn: 'Venusaur', types: ['Grass', 'Poison'], hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80, abilityZh: '葉綠素', abilityDesc: '晴天下速度翻倍。' },
  { id: 'mega_venusaur', num: 3, nameZh: '超級妙蛙花', nameEn: 'Mega Venusaur', types: ['Grass', 'Poison'], isMega: true, hp: 80, atk: 100, def: 123, spa: 122, spd: 120, spe: 80, abilityZh: '厚脂肪', abilityDesc: '受到的火屬性與冰屬性傷害減半。' },
  { id: 'charizard', num: 6, nameZh: '噴火龍', nameEn: 'Charizard', types: ['Fire', 'Flying'], hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100, abilityZh: '太陽之力', abilityDesc: '晴天特攻提升 50%。' },
  { id: 'mega_charizard_x', num: 6, nameZh: '超級噴火龍Ｘ', nameEn: 'Mega Charizard X', types: ['Fire', 'Dragon'], isMega: true, hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100, abilityZh: '硬爪', abilityDesc: '接觸類招式威力提升 30%。' },
  { id: 'mega_charizard_y', num: 6, nameZh: '超級噴火龍Ｙ', nameEn: 'Mega Charizard Y', types: ['Fire', 'Flying'], isMega: true, hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100, abilityZh: '日照', abilityDesc: '出場布下大晴天。' },
  { id: 'blastoise', num: 9, nameZh: '水箭龜', nameEn: 'Blastoise', types: ['Water'], hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78, abilityZh: '激流', abilityDesc: '殘血水屬性招式威力提升 50%。' },
  { id: 'mega_blastoise', num: 9, nameZh: '超級水箭龜', nameEn: 'Mega Blastoise', types: ['Water'], isMega: true, hp: 79, atk: 103, def: 120, spa: 135, spd: 115, spe: 78, abilityZh: '超級發射器', abilityDesc: '波動類招式威力提升 50%。' },
  { id: 'beedrill', num: 15, nameZh: '大針蜂', nameEn: 'Beedrill', types: ['Bug', 'Poison'], hp: 65, atk: 90, def: 40, spa: 45, spd: 80, spe: 75, abilityZh: '蟲之預感', abilityDesc: '殘血蟲系招式威力提升。' },
  { id: 'mega_beedrill', num: 15, nameZh: '超級大針蜂', nameEn: 'Mega Beedrill', types: ['Bug', 'Poison'], isMega: true, hp: 65, atk: 150, def: 40, spa: 15, spd: 80, spe: 145, abilityZh: '適應力', abilityDesc: '本系招式修正由 1.5 倍提升為 2.0 倍！' },
  { id: 'pidgeot', num: 18, nameZh: '大比鳥', nameEn: 'Pidgeot', types: ['Normal', 'Flying'], hp: 83, atk: 80, def: 75, spa: 70, spd: 70, spe: 101, abilityZh: '銳利目光', abilityDesc: '命中率不會被降低。' },
  { id: 'mega_pidgeot', num: 18, nameZh: '超級大比鳥', nameEn: 'Mega Pidgeot', types: ['Normal', 'Flying'], isMega: true, hp: 83, atk: 80, def: 80, spa: 135, spd: 80, spe: 121, abilityZh: '無防守', abilityDesc: '雙方施展的所有招式均必定命中（暴風必中）。' },
  { id: 'arbok', num: 24, nameZh: '阿柏怪', nameEn: 'Arbok', types: ['Poison'], hp: 60, atk: 95, def: 69, spa: 65, spd: 79, spe: 80, abilityZh: '威嚇', abilityDesc: '登場削弱敵方物攻。' },
  { id: 'pikachu', num: 25, nameZh: '皮卡丘', nameEn: 'Pikachu', types: ['Electric'], hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90, abilityZh: '避雷針', abilityDesc: '吸收全場電屬性傷害並特攻提升 1 級。' },
  { id: 'raichu', num: 26, nameZh: '雷丘', nameEn: 'Raichu', types: ['Electric'], hp: 60, atk: 90, def: 55, spa: 90, spd: 80, spe: 110, abilityZh: '避雷針', abilityDesc: '吸收全場電屬性攻擊。' },
  { id: 'raichu_alola', num: 26, nameZh: '雷丘 (阿羅拉的樣子)', nameEn: 'Raichu (Alolan Form)', types: ['Electric', 'Psychic'], hp: 60, atk: 85, def: 50, spa: 95, spd: 85, spe: 110, abilityZh: '衝浪之尾', abilityDesc: '電氣場地下速度翻倍。' },
  { id: 'mega_raichu_x', num: 26, nameZh: '超級雷丘Ｘ', nameEn: 'Mega Raichu X', types: ['Electric'], isMega: true, hp: 60, atk: 125, def: 75, spa: 115, spd: 90, spe: 120, abilityZh: '電氣皮膚', abilityDesc: '一般屬性招式轉為電屬性且威力提升。' },
  { id: 'mega_raichu_y', num: 26, nameZh: '超級雷丘Ｙ', nameEn: 'Mega Raichu Y', types: ['Electric'], isMega: true, hp: 60, atk: 80, def: 65, spa: 140, spd: 100, spe: 140, abilityZh: '強子引擎', abilityDesc: '布下電氣場地並大幅提升特攻。' },
  { id: 'clefable', num: 36, nameZh: '皮可西', nameEn: 'Clefable', types: ['Fairy'], hp: 95, atk: 70, def: 73, spa: 95, spd: 90, spe: 60, abilityZh: '魔法防守', abilityDesc: '只承受直接攻擊傷害，免疫任何間接傷害。' },
  { id: 'mega_clefable', num: 36, nameZh: '超級皮可西', nameEn: 'Mega Clefable', types: ['Fairy', 'Flying'], isMega: true, hp: 95, atk: 80, def: 95, spa: 125, spd: 115, spe: 73, abilityZh: '天恩', abilityDesc: '招式附加效果觸發機率翻倍。' },
  { id: 'ninetales', num: 38, nameZh: '九尾', nameEn: 'Ninetales', types: ['Fire'], hp: 73, atk: 76, def: 75, spa: 81, spd: 100, spe: 100, abilityZh: '日照', abilityDesc: '進場開啟大晴天。' },
  { id: 'ninetales_alola', num: 38, nameZh: '九尾 (阿羅拉的樣子)', nameEn: 'Ninetales (Alolan Form)', types: ['Ice', 'Fairy'], hp: 73, atk: 67, def: 75, spa: 81, spd: 100, spe: 109, abilityZh: '降雪', abilityDesc: '進場布下雪景，一鍵極光幕。' },
  { id: 'wigglytuff', num: 40, nameZh: '胖可丁', nameEn: 'Wigglytuff', types: ['Normal', 'Fairy'], hp: 140, atk: 70, def: 45, spa: 85, spd: 50, spe: 45, abilityZh: '好勝', abilityDesc: '能力被對手降低時特攻提升 2 級。' },
  { id: 'vileplume', num: 45, nameZh: '霸王花', nameEn: 'Vileplume', types: ['Grass', 'Poison'], hp: 75, atk: 80, def: 85, spa: 110, spd: 90, spe: 50, abilityZh: '葉綠素', abilityDesc: '晴天下速度翻倍。' },
  { id: 'persian', num: 53, nameZh: '貓老大', nameEn: 'Persian', types: ['Normal'], hp: 65, atk: 70, def: 60, spa: 65, spd: 65, spe: 115, abilityZh: '技術高手', abilityDesc: '低威力招式傷害提升 50%。' },
  { id: 'persian_alola', num: 53, nameZh: '貓老大 (阿羅拉的樣子)', nameEn: 'Persian (Alolan Form)', types: ['Dark'], hp: 65, atk: 60, def: 60, spa: 75, spd: 65, spe: 115, abilityZh: '毛茸茸', abilityDesc: '受到接觸攻擊傷害減半。' },
  { id: 'arcanine', num: 59, nameZh: '風速狗', nameEn: 'Arcanine', types: ['Fire'], hp: 90, atk: 110, def: 80, spa: 100, spd: 80, spe: 95, abilityZh: '威嚇', abilityDesc: '經典雙打首選威嚇手。' },
  { id: 'arcanine_hisui', num: 59, nameZh: '風速狗 (洗翠的樣子)', nameEn: 'Arcanine (Hisuian Form)', types: ['Fire', 'Rock'], hp: 95, atk: 115, def: 80, spa: 95, spd: 80, spe: 90, abilityZh: '威嚇', abilityDesc: '岩火雙屬性高爆發打手。' },
  { id: 'alakazam', num: 65, nameZh: '胡地', nameEn: 'Alakazam', types: ['Psychic'], hp: 55, atk: 50, def: 45, spa: 135, spd: 95, spe: 120, abilityZh: '魔法防守', abilityDesc: '免疫所有非直接攻擊傷害。' },
  { id: 'mega_alakazam', num: 65, nameZh: '超級胡地', nameEn: 'Mega Alakazam', types: ['Psychic'], isMega: true, hp: 55, atk: 50, def: 65, spa: 175, spd: 105, spe: 150, abilityZh: '複製', abilityDesc: '複製對手特性。' },
  { id: 'machamp', num: 68, nameZh: '怪力', nameEn: 'Machamp', types: ['Fighting'], hp: 90, atk: 130, def: 80, spa: 65, spd: 85, spe: 55, abilityZh: '無防守', abilityDesc: '爆裂拳必定命中混亂對手。' },
  { id: 'victreebel', num: 71, nameZh: '大食花', nameEn: 'Victreebel', types: ['Grass', 'Poison'], hp: 80, atk: 105, def: 65, spa: 100, spd: 70, spe: 70, abilityZh: '葉綠素', abilityDesc: '晴天下高速生長強攻。' },
  { id: 'mega_victreebel', num: 71, nameZh: '超級大食花', nameEn: 'Mega Victreebel', types: ['Grass', 'Poison'], isMega: true, hp: 80, atk: 125, def: 85, spa: 135, spd: 85, spe: 80, abilityZh: '強效溶解', abilityDesc: '腐蝕特性溶解防線。' },
  { id: 'slowbro', num: 80, nameZh: '呆殼獸', nameEn: 'Slowbro', types: ['Water', 'Psychic'], hp: 95, atk: 75, def: 110, spa: 100, spd: 80, spe: 30, abilityZh: '再生力', abilityDesc: '換人退場自動回復 1/3 HP。' },
  { id: 'slowbro_galar', num: 80, nameZh: '呆殼獸 (伽勒爾的樣子)', nameEn: 'Slowbro (Galarian Form)', types: ['Poison', 'Psychic'], hp: 95, atk: 100, def: 95, spa: 100, spd: 70, spe: 30, abilityZh: '速擊', abilityDesc: '一定機率搶先手。' },
  { id: 'mega_slowbro', num: 80, nameZh: '超級呆殼獸', nameEn: 'Mega Slowbro', types: ['Water', 'Psychic'], isMega: true, hp: 95, atk: 75, def: 180, spa: 130, spd: 80, spe: 30, abilityZh: '硬殼盔甲', abilityDesc: '絕不會被擊中要害，防禦高達 180！' },
  { id: 'farfetchd', num: 83, nameZh: '大蔥鴨', nameEn: 'Farfetch’d', types: ['Normal', 'Flying'], hp: 52, atk: 90, def: 55, spa: 58, spd: 62, spe: 60, abilityZh: '不服輸', abilityDesc: '能力下降時攻擊提升 2 級。' },
  { id: 'gengar', num: 94, nameZh: '耿鬼', nameEn: 'Gengar', types: ['Ghost', 'Poison'], hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110, abilityZh: '詛咒之軀', abilityDesc: '被攻擊時機率封鎖對手技能。' },
  { id: 'mega_gengar', num: 94, nameZh: '超級耿鬼', nameEn: 'Mega Gengar', types: ['Ghost', 'Poison'], isMega: true, hp: 60, atk: 65, def: 80, spa: 170, spd: 95, spe: 130, abilityZh: '踩影', abilityDesc: '踩住影子，對手全體無法換人退場！' },
  { id: 'kangaskhan', num: 115, nameZh: '袋獸', nameEn: 'Kangaskhan', types: ['Normal'], hp: 105, atk: 95, def: 80, spa: 40, spd: 80, spe: 90, abilityZh: '膽量', abilityDesc: '一般與格鬥招式可擊中幽靈系。' },
  { id: 'mega_kangaskhan', num: 115, nameZh: '超級袋獸', nameEn: 'Mega Kangaskhan', types: ['Normal'], isMega: true, hp: 105, atk: 125, def: 100, spa: 60, spd: 100, spe: 100, abilityZh: '親子愛', abilityDesc: '每回合連續攻擊 2 次！' },
  { id: 'starmie', num: 121, nameZh: '寶石海星', nameEn: 'Starmie', types: ['Water', 'Psychic'], hp: 60, atk: 75, def: 85, spa: 100, spd: 85, spe: 115, abilityZh: '自然回復', abilityDesc: '退場解除異常狀態。' },
  { id: 'mega_starmie', num: 121, nameZh: '超級寶石海星', nameEn: 'Mega Starmie', types: ['Water', 'Psychic'], isMega: true, hp: 60, atk: 75, def: 105, spa: 140, spd: 105, spe: 135, abilityZh: '分析', abilityDesc: '後手出招威力提升 30%。' },
  { id: 'mr_mime', num: 122, nameZh: '魔牆人偶', nameEn: 'Mr. Mime', types: ['Psychic', 'Fairy'], hp: 40, atk: 45, def: 65, spa: 100, spd: 120, spe: 90, abilityZh: '隔音', abilityDesc: '免疫所有聲音類技能。' },
  { id: 'pinsir', num: 127, nameZh: '凱羅斯', nameEn: 'Pinsir', types: ['Bug'], hp: 65, atk: 125, def: 100, spa: 55, spd: 70, spe: 85, abilityZh: '怪力鉗', abilityDesc: '攻擊力不會被降低。' },
  { id: 'mega_pinsir', num: 127, nameZh: '超級凱羅斯', nameEn: 'Mega Pinsir', types: ['Bug', 'Flying'], isMega: true, hp: 65, atk: 155, def: 120, spa: 65, spd: 90, spe: 105, abilityZh: '飛行皮膚', abilityDesc: '一般屬性招式轉為飛行屬性且威力大幅提升。' },
  { id: 'tauros', num: 128, nameZh: '肯泰羅', nameEn: 'Tauros', types: ['Normal'], hp: 75, atk: 100, def: 95, spa: 40, spd: 70, spe: 110, abilityZh: '威嚇', abilityDesc: '進場降低對手攻擊。' },
  { id: 'tauros_combat', num: 128, nameZh: '肯泰羅 (帕底亞鬥戰種)', nameEn: 'Tauros (Paldean Combat)', types: ['Fighting'], hp: 75, atk: 110, def: 105, spa: 30, spd: 70, spe: 100, abilityZh: '威嚇', abilityDesc: '格鬥系強勢威嚇手。' },
  { id: 'tauros_blaze', num: 128, nameZh: '肯泰羅 (帕底亞火熾種)', nameEn: 'Tauros (Paldean Blaze)', types: ['Fighting', 'Fire'], hp: 75, atk: 110, def: 105, spa: 30, spd: 70, spe: 100, abilityZh: '威嚇', abilityDesc: '怒火衝鋒火格衝鋒手。' },
  { id: 'tauros_aqua', num: 128, nameZh: '肯泰羅 (帕底亞水瀾種)', nameEn: 'Tauros (Paldean Aqua)', types: ['Fighting', 'Water'], hp: 75, atk: 110, def: 105, spa: 30, spd: 70, spe: 100, abilityZh: '威嚇', abilityDesc: '波動衝水格雙系強攻。' },
  { id: 'gyarados', num: 130, nameZh: '暴鯉龍', nameEn: 'Gyarados', types: ['Water', 'Flying'], hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81, abilityZh: '威嚇', abilityDesc: '老牌雙打頂級威嚇龍舞手。' },
  { id: 'mega_gyarados', num: 130, nameZh: '超級暴鯉龍', nameEn: 'Mega Gyarados', types: ['Water', 'Dark'], isMega: true, hp: 95, atk: 155, def: 109, spa: 70, spd: 130, spe: 81, abilityZh: '破格', abilityDesc: '無視對手任何防禦特性。' },
  { id: 'ditto', num: 132, nameZh: '百變怪', nameEn: 'Ditto', types: ['Normal'], hp: 48, atk: 48, def: 48, spa: 48, spd: 48, spe: 48, abilityZh: '變身者', abilityDesc: '進場立刻變身為對手寶可夢並複製能力階級！' },
  { id: 'vaporeon', num: 134, nameZh: '水伊布', nameEn: 'Vaporeon', types: ['Water'], hp: 130, atk: 65, def: 60, spa: 110, spd: 95, spe: 65, abilityZh: '儲水', abilityDesc: '受到水屬性招式時免疫並回血。' },
  { id: 'jolteon', num: 135, nameZh: '雷伊布', nameEn: 'Jolteon', types: ['Electric'], hp: 65, atk: 65, def: 60, spa: 110, spd: 95, spe: 130, abilityZh: '蓄電', abilityDesc: '受到電招式時免疫並回血。' },
  { id: 'flareon', num: 136, nameZh: '火伊布', nameEn: 'Flareon', types: ['Fire'], hp: 65, atk: 130, def: 60, spa: 95, spd: 110, spe: 65, abilityZh: '引火', abilityDesc: '受到火招式時吸收增傷。' },
  { id: 'aerodactyl', num: 142, nameZh: '化石翼龍', nameEn: 'Aerodactyl', types: ['Rock', 'Flying'], hp: 80, atk: 105, def: 65, spa: 60, spd: 75, spe: 130, abilityZh: '壓迫感', abilityDesc: '極速岩崩先手壓制。' },
  { id: 'mega_aerodactyl', num: 142, nameZh: '超級化石翼龍', nameEn: 'Mega Aerodactyl', types: ['Rock', 'Flying'], isMega: true, hp: 80, atk: 135, def: 85, spa: 70, spd: 95, spe: 150, abilityZh: '硬爪', abilityDesc: '接觸類招式威力提升 30%，150 極速！' },
  { id: 'snorlax', num: 143, nameZh: '卡比獸', nameEn: 'Snorlax', types: ['Normal'], hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30, abilityZh: '厚脂肪', abilityDesc: '火與冰屬性傷害減半，腹鼓空間重砲。' },
  { id: 'dragonite', num: 149, nameZh: '快龍', nameEn: 'Dragonite', types: ['Dragon', 'Flying'], hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80, abilityZh: '多重鱗片', abilityDesc: '滿血傷害減半，太晶一般神速核心。' },
  { id: 'mega_dragonite', num: 149, nameZh: '超級快龍', nameEn: 'Mega Dragonite', types: ['Dragon', 'Flying'], isMega: true, hp: 91, atk: 164, def: 115, spa: 120, spd: 115, spe: 95, abilityZh: '天空霸者', abilityDesc: '龍神速與飛行本系爆發極限化。' },

  // Gen 2
  { id: 'meganium', num: 154, nameZh: '大竺葵', nameEn: 'Meganium', types: ['Grass'], hp: 80, atk: 82, def: 100, spa: 83, spd: 100, spe: 80, abilityZh: '葉子防守', abilityDesc: '晴天下免疫異常。' },
  { id: 'mega_meganium', num: 154, nameZh: '超級大竺葵', nameEn: 'Mega Meganium', types: ['Grass', 'Fairy'], isMega: true, hp: 80, atk: 92, def: 125, spa: 113, spd: 130, spe: 85, abilityZh: '妖精光環', abilityDesc: '妖精與草系耐久大幅飆升。' },
  { id: 'typhlosion', num: 157, nameZh: '火爆獸', nameEn: 'Typhlosion', types: ['Fire'], hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100, abilityZh: '引火', abilityDesc: '滿血噴火一擊毀滅全場。' },
  { id: 'typhlosion_hisui', num: 157, nameZh: '火爆獸 (洗翠的樣子)', nameEn: 'Typhlosion (Hisuian Form)', types: ['Fire', 'Ghost'], hp: 73, atk: 84, def: 78, spa: 119, spd: 85, spe: 95, abilityZh: '察覺', abilityDesc: '看穿道具並施展幽靈火系雙群體爆發。' },
  { id: 'feraligatr', num: 160, nameZh: '大力鱷', nameEn: 'Feraligatr', types: ['Water'], hp: 85, atk: 105, def: 100, spa: 79, spd: 83, spe: 78, abilityZh: '強行', abilityDesc: '放棄招式追加效果使威力提升 30%。' },
  { id: 'mega_feraligatr', num: 160, nameZh: '超級大力鱷', nameEn: 'Mega Feraligatr', types: ['Water', 'Dragon'], isMega: true, hp: 85, atk: 145, def: 125, spa: 89, spd: 93, spe: 93, abilityZh: '堅硬下顎', abilityDesc: '啃咬招式威力提升 50%。' },
  { id: 'ariados', num: 168, nameZh: '阿利多斯', nameEn: 'Ariados', types: ['Bug', 'Poison'], hp: 70, atk: 90, def: 70, spa: 60, spd: 70, spe: 40, abilityZh: '狙擊手', abilityDesc: '擊中要害傷害倍率提升。' },
  { id: 'ampharos', num: 181, nameZh: '電龍', nameEn: 'Ampharos', types: ['Electric'], hp: 90, atk: 75, def: 85, spa: 115, spd: 90, spe: 55, abilityZh: '靜電', abilityDesc: '接觸時機率使對手麻痺。' },
  { id: 'mega_ampharos', num: 181, nameZh: '超級電龍', nameEn: 'Mega Ampharos', types: ['Electric', 'Dragon'], isMega: true, hp: 90, atk: 95, def: 105, spa: 165, spd: 110, spe: 45, abilityZh: '破格', abilityDesc: '無視對手防守特性，空間特攻巨砲。' },
  { id: 'azumarill', num: 184, nameZh: '瑪力露麗', nameEn: 'Azumarill', types: ['Water', 'Fairy'], hp: 100, atk: 50, def: 80, spa: 60, spd: 80, spe: 50, abilityZh: '大力士', abilityDesc: '物理攻擊力直接翻倍（實戰 2.0x 物攻）！' },
  { id: 'politoed', num: 186, nameZh: '蚊香蛙皇', nameEn: 'Politoed', types: ['Water'], hp: 90, atk: 75, def: 75, spa: 90, spd: 100, spe: 70, abilityZh: '降雨', abilityDesc: '出場布下大雨天氣，啟動雨天隊。' },
  { id: 'espeon', num: 196, nameZh: '太陽伊布', nameEn: 'Espeon', types: ['Psychic'], hp: 65, atk: 65, def: 60, spa: 130, spd: 95, spe: 110, abilityZh: '魔法鏡', abilityDesc: '將所有變化招式反彈給對手！' },
  { id: 'umbreon', num: 197, nameZh: '月亮伊布', nameEn: 'Umbreon', types: ['Dark'], hp: 95, atk: 65, def: 110, spa: 60, spd: 130, spe: 65, abilityZh: '同步', abilityDesc: '對戰最強受盾之一。' },
  { id: 'slowking', num: 199, nameZh: '呆呆王', nameEn: 'Slowking', types: ['Water', 'Psychic'], hp: 95, atk: 75, def: 80, spa: 100, spd: 110, spe: 30, abilityZh: '再生力', abilityDesc: '輪轉回血，空間核心。' },
  { id: 'slowking_galar', num: 199, nameZh: '呆呆王 (伽勒爾的樣子)', nameEn: 'Slowking (Galarian Form)', types: ['Poison', 'Psychic'], hp: 95, atk: 65, def: 80, spa: 110, spd: 110, spe: 30, abilityZh: '怪藥', abilityDesc: '進場清除隊友能力下降。' },
  { id: 'forretress', num: 205, nameZh: '佛烈托斯', nameEn: 'Forretress', types: ['Bug', 'Steel'], hp: 75, atk: 90, def: 140, spa: 60, spd: 60, spe: 40, abilityZh: '結實', abilityDesc: '撒菱出釘要塞。' },
  { id: 'steelix', num: 208, nameZh: '大鋼蛇', nameEn: 'Steelix', types: ['Steel', 'Ground'], hp: 75, atk: 85, def: 200, spa: 55, spd: 65, spe: 30, abilityZh: '結實', abilityDesc: '防禦高達 200。' },
  { id: 'mega_steelix', num: 208, nameZh: '超級大鋼蛇', nameEn: 'Mega Steelix', types: ['Steel', 'Ground'], isMega: true, hp: 75, atk: 125, def: 230, spa: 55, spd: 95, spe: 30, abilityZh: '沙之力', abilityDesc: '防禦高達 230，沙暴下地面鋼系增傷。' },
  { id: 'qwilfish', num: 211, nameZh: '千針魚', nameEn: 'Qwilfish', types: ['Water', 'Poison'], hp: 65, atk: 95, def: 85, spa: 55, spd: 55, spe: 85, abilityZh: '威嚇', abilityDesc: '雨天悠游自如或威嚇輔助。' },
  { id: 'scizor', num: 212, nameZh: '巨鉗螳螂', nameEn: 'Scizor', types: ['Bug', 'Steel'], hp: 70, atk: 130, def: 100, spa: 55, spd: 80, spe: 65, abilityZh: '技術高手', abilityDesc: '子彈拳享受技師 1.5 倍加成。' },
  { id: 'mega_scizor', num: 212, nameZh: '超級巨鉗螳螂', nameEn: 'Mega Scizor', types: ['Bug', 'Steel'], isMega: true, hp: 70, atk: 150, def: 140, spa: 65, spd: 100, spe: 75, abilityZh: '技術高手', abilityDesc: '高耐久高物攻鋼先制核心。' },
  { id: 'heracross', num: 214, nameZh: '赫拉克羅斯', nameEn: 'Heracross', types: ['Bug', 'Fighting'], hp: 80, atk: 125, def: 75, spa: 40, spd: 95, spe: 85, abilityZh: '毅力', abilityDesc: '異常狀態下攻擊力提升 50%。' },
  { id: 'mega_heracross', num: 214, nameZh: '超級赫拉克羅斯', nameEn: 'Mega Heracross', types: ['Bug', 'Fighting'], isMega: true, hp: 80, atk: 185, def: 115, spa: 40, spd: 105, spe: 75, abilityZh: '連續攻擊', abilityDesc: '多段攻擊必定滿額打擊 5 次，185 恐怖物攻！' },
  { id: 'skarmory', num: 227, nameZh: '盔甲鳥', nameEn: 'Skarmory', types: ['Steel', 'Flying'], hp: 65, atk: 80, def: 140, spa: 40, spd: 70, spe: 70, abilityZh: '結實', abilityDesc: '經典鋼飛物理大盾。' },
  { id: 'mega_skarmory', num: 227, nameZh: '超級盔甲鳥', nameEn: 'Mega Skarmory', types: ['Steel', 'Flying'], isMega: true, hp: 65, atk: 110, def: 180, spa: 40, spd: 105, spe: 90, abilityZh: '羽翼之壁', abilityDesc: '極致物理防護要塞。' },
  { id: 'houndoom', num: 229, nameZh: '黑魯加', nameEn: 'Houndoom', types: ['Dark', 'Fire'], hp: 75, atk: 90, def: 50, spa: 110, spd: 80, spe: 95, abilityZh: '引火', abilityDesc: '吸收火屬性增強特攻。' },
  { id: 'mega_houndoom', num: 229, nameZh: '超級黑魯加', nameEn: 'Mega Houndoom', types: ['Dark', 'Fire'], isMega: true, hp: 75, atk: 90, def: 90, spa: 140, spd: 90, spe: 115, abilityZh: '太陽之力', abilityDesc: '晴天下特攻提升 50% 毀滅輸出。' },
  { id: 'tyranitar', num: 248, nameZh: '班基拉斯', nameEn: 'Tyranitar', types: ['Rock', 'Dark'], hp: 100, atk: 134, def: 110, spa: 95, spd: 100, spe: 61, abilityZh: '揚沙', abilityDesc: '出場揚起沙暴，岩石特防提升 50%。' },
  { id: 'mega_tyranitar', num: 248, nameZh: '超級班基拉斯', nameEn: 'Mega Tyranitar', types: ['Rock', 'Dark'], isMega: true, hp: 100, atk: 164, def: 150, spa: 95, spd: 120, spe: 71, abilityZh: '揚沙', abilityDesc: '總種族值高達 700 的沙暴之王。' },

  // Gen 3
  { id: 'sceptile', num: 254, nameZh: '蜥蜴王', nameEn: 'Sceptile', types: ['Grass'], hp: 70, atk: 85, def: 65, spa: 105, spd: 85, spe: 120, abilityZh: '輕裝', abilityDesc: '消耗道具後速度翻倍。' },
  { id: 'mega_sceptile', num: 254, nameZh: '超級蜥蜴王', nameEn: 'Mega Sceptile', types: ['Grass', 'Dragon'], isMega: true, hp: 70, atk: 110, def: 75, spa: 145, spd: 85, spe: 145, abilityZh: '避雷針', abilityDesc: '吸收電屬性，145 極速草龍。' },
  { id: 'blaziken', num: 257, nameZh: '火焰雞', nameEn: 'Blaziken', types: ['Fire', 'Fighting'], hp: 80, atk: 120, def: 70, spa: 110, spd: 70, spe: 80, abilityZh: '加速', abilityDesc: '每回合結束時速度提升 1 級。' },
  { id: 'mega_blaziken', num: 257, nameZh: '超級火焰雞', nameEn: 'Mega Blaziken', types: ['Fire', 'Fighting'], isMega: true, hp: 80, atk: 160, def: 80, spa: 130, spd: 80, spe: 100, abilityZh: '加速', abilityDesc: '無限提速，160 超強物攻。' },
  { id: 'swampert', num: 260, nameZh: '巨沼怪', nameEn: 'Swampert', types: ['Water', 'Ground'], hp: 100, atk: 110, def: 90, spa: 85, spd: 90, spe: 60, abilityZh: '激流', abilityDesc: '僅弱草的水地全能戰士。' },
  { id: 'mega_swampert', num: 260, nameZh: '超級巨沼怪', nameEn: 'Mega Swampert', types: ['Water', 'Ground'], isMega: true, hp: 100, atk: 150, def: 110, spa: 95, spd: 110, spe: 70, abilityZh: '悠游自如', abilityDesc: '雨天下速度翻倍，雨天隊物理推土機。' },
  { id: 'pelipper', num: 279, nameZh: '大嘴鷗', nameEn: 'Pelipper', types: ['Water', 'Flying'], hp: 60, atk: 50, def: 100, spa: 95, spd: 70, spe: 65, abilityZh: '降雨', abilityDesc: '雨天隊靈魂發動機。' },
  { id: 'gardevoir', num: 282, nameZh: '沙奈朵', nameEn: 'Gardevoir', types: ['Psychic', 'Fairy'], hp: 68, atk: 65, def: 65, spa: 125, spd: 115, spe: 80, abilityZh: '複製', abilityDesc: '複製對手核心特性。' },
  { id: 'mega_gardevoir', num: 282, nameZh: '超級沙奈朵', nameEn: 'Mega Gardevoir', types: ['Psychic', 'Fairy'], isMega: true, hp: 68, atk: 85, def: 65, spa: 165, spd: 135, spe: 100, abilityZh: '妖精皮膚', abilityDesc: '巨聲轉為妖精屬性群體毀滅輸出！' },
  { id: 'sableye', num: 302, nameZh: '勾魂眼', nameEn: 'Sableye', types: ['Dark', 'Ghost'], hp: 50, atk: 75, def: 75, spa: 65, spd: 65, spe: 50, abilityZh: '惡作劇之心', abilityDesc: '先制鬼火、擊掌奇襲、延後控速。' },
  { id: 'mega_sableye', num: 302, nameZh: '超級勾魂眼', nameEn: 'Mega Sableye', types: ['Dark', 'Ghost'], isMega: true, hp: 50, atk: 85, def: 125, spa: 85, spd: 115, spe: 20, abilityZh: '魔法鏡', abilityDesc: '反彈一切變化技，極致空間盾。' },
  { id: 'mawile', num: 303, nameZh: '大嘴娃', nameEn: 'Mawile', types: ['Steel', 'Fairy'], hp: 50, atk: 85, def: 85, spa: 55, spd: 55, spe: 50, abilityZh: '威嚇', abilityDesc: '登場威嚇削弱對手。' },
  { id: 'mega_mawile', num: 303, nameZh: '超級大嘴娃', nameEn: 'Mega Mawile', types: ['Steel', 'Fairy'], isMega: true, hp: 50, atk: 105, def: 125, spa: 55, spd: 95, spe: 50, abilityZh: '大力士', abilityDesc: '大力士翻倍物攻，鋼妖第一核彈！' },
  { id: 'aggron', num: 306, nameZh: '波士可多拉', nameEn: 'Aggron', types: ['Steel', 'Rock'], hp: 70, atk: 110, def: 180, spa: 60, spd: 60, spe: 50, abilityZh: '堅硬腦袋', abilityDesc: '雙刃頭錘無反傷。' },
  { id: 'mega_aggron', num: 306, nameZh: '超級波士可多拉', nameEn: 'Mega Aggron', types: ['Steel'], isMega: true, hp: 70, atk: 140, def: 230, spa: 60, spd: 80, spe: 50, abilityZh: '過濾', abilityDesc: '弱點傷害減傷 25%，純鋼 230 防禦！' },
  { id: 'medicham', num: 308, nameZh: '恰雷姆', nameEn: 'Medicham', types: ['Fighting', 'Psychic'], hp: 60, atk: 60, def: 75, spa: 60, spd: 75, spe: 80, abilityZh: '瑜伽之力', abilityDesc: '攻擊力翻倍。' },
  { id: 'mega_medicham', num: 308, nameZh: '超級恰雷姆', nameEn: 'Mega Medicham', types: ['Fighting', 'Psychic'], isMega: true, hp: 60, atk: 100, def: 85, spa: 80, spd: 85, spe: 100, abilityZh: '瑜伽之力', abilityDesc: '瑜伽之力加成下飛膝踢確一秒殺萬物。' },
  { id: 'manectric', num: 310, nameZh: '雷電獸', nameEn: 'Manectric', types: ['Electric'], hp: 70, atk: 75, def: 60, spa: 105, spd: 60, spe: 105, abilityZh: '避雷針', abilityDesc: '吸電增強特攻。' },
  { id: 'mega_manectric', num: 310, nameZh: '超級雷電獸', nameEn: 'Mega Manectric', types: ['Electric'], isMega: true, hp: 70, atk: 75, def: 80, spa: 135, spd: 80, spe: 135, abilityZh: '威嚇', abilityDesc: '登場威嚇 + 135 極速伏特替換。' },
  { id: 'swalot', num: 317, nameZh: '吞食獸', nameEn: 'Swalot', types: ['Poison'], hp: 100, atk: 73, def: 83, spa: 73, spd: 83, spe: 55, abilityZh: '污泥漿', abilityDesc: '吸收招式反傷。' },
  { id: 'sharpedo', num: 319, nameZh: '巨牙鯊', nameEn: 'Sharpedo', types: ['Water', 'Dark'], hp: 70, atk: 120, def: 40, spa: 95, spd: 40, spe: 95, abilityZh: '加速', abilityDesc: '每回合自動加速。' },
  { id: 'mega_sharpedo', num: 319, nameZh: '超級巨牙鯊', nameEn: 'Mega Sharpedo', types: ['Water', 'Dark'], isMega: true, hp: 70, atk: 140, def: 70, spa: 110, spd: 65, spe: 105, abilityZh: '強壯之顎', abilityDesc: '啃咬類技能威力提升 50%。' },
  { id: 'camerupt', num: 323, nameZh: '噴火駝', nameEn: 'Camerupt', types: ['Fire', 'Ground'], hp: 70, atk: 100, def: 70, spa: 105, spd: 75, spe: 40, abilityZh: '堅硬岩石', abilityDesc: '空間火地特攻重砲。' },
  { id: 'mega_camerupt', num: 323, nameZh: '超級噴火駝', nameEn: 'Mega Camerupt', types: ['Fire', 'Ground'], isMega: true, hp: 70, atk: 120, def: 100, spa: 145, spd: 105, spe: 20, abilityZh: '強行', abilityDesc: '空間下熱風與大地之力核彈清場。' },
  { id: 'torkoal', num: 324, nameZh: '煤炭龜', nameEn: 'Torkoal', types: ['Fire'], hp: 70, atk: 85, def: 140, spa: 85, spd: 70, spe: 20, abilityZh: '日照', abilityDesc: '最低速晴天發動機，空間噴火。' },
  { id: 'altaria', num: 334, nameZh: '七夕青鳥', nameEn: 'Altaria', types: ['Dragon', 'Flying'], hp: 75, atk: 70, def: 90, spa: 70, spd: 105, spe: 80, abilityZh: '自然回復', abilityDesc: '棉花防守與羽棲。' },
  { id: 'mega_altaria', num: 334, nameZh: '超級七夕青鳥', nameEn: 'Mega Altaria', types: ['Dragon', 'Fairy'], isMega: true, hp: 75, atk: 110, def: 110, spa: 110, spd: 105, spe: 80, abilityZh: '妖精皮膚', abilityDesc: '全系列唯一龍+妖精屬性，巨聲群秒。' },
  { id: 'milotic', num: 350, nameZh: '美納斯', nameEn: 'Milotic', types: ['Water'], hp: 95, atk: 60, def: 79, spa: 100, spd: 125, spe: 81, abilityZh: '好勝', abilityDesc: '受到威嚇時特攻直接暴增 2 級！' },
  { id: 'castform', num: 351, nameZh: '飄浮泡泡', nameEn: 'Castform', types: ['Normal'], hp: 70, atk: 70, def: 70, spa: 70, spd: 70, spe: 70, abilityZh: '陰晴不定', abilityDesc: '隨天氣轉換形態。' },
  { id: 'banette', num: 354, nameZh: '詛咒娃娃', nameEn: 'Banette', types: ['Ghost'], hp: 64, atk: 115, def: 65, spa: 83, spd: 63, spe: 65, abilityZh: '察覺', abilityDesc: '察覺對手裝備。' },
  { id: 'mega_banette', num: 354, nameZh: '超級詛咒娃娃', nameEn: 'Mega Banette', types: ['Ghost'], isMega: true, hp: 64, atk: 165, def: 75, spa: 93, spd: 83, spe: 75, abilityZh: '惡作劇之心', abilityDesc: '先制同命與定身法，165 極限物攻！' },
  { id: 'chimecho', num: 358, nameZh: '風鈴鈴', nameEn: 'Chimecho', types: ['Psychic'], hp: 75, atk: 50, def: 80, spa: 95, spd: 90, spe: 65, abilityZh: '飄浮', abilityDesc: '免疫地面招式。' },
  { id: 'mega_chimecho', num: 358, nameZh: '超級風鈴鈴', nameEn: 'Mega Chimecho', types: ['Psychic', 'Steel'], isMega: true, hp: 75, atk: 60, def: 110, spa: 135, spd: 120, spe: 75, abilityZh: '心靈感應', abilityDesc: '超能鋼系空間輔助。' },
  { id: 'absol', num: 359, nameZh: '阿勃梭魯', nameEn: 'Absol', types: ['Dark'], hp: 65, atk: 130, def: 60, spa: 75, spd: 60, spe: 75, abilityZh: '超幸運', abilityDesc: '容易擊中要害。' },
  { id: 'mega_absol', num: 359, nameZh: '超級阿勃梭魯', nameEn: 'Mega Absol', types: ['Dark'], isMega: true, hp: 65, atk: 150, def: 60, spa: 115, spd: 60, spe: 115, abilityZh: '魔法鏡', abilityDesc: '反彈變化招式。' },
  { id: 'mega_absol_z', num: 359, nameZh: '超級阿勃梭魯Z', nameEn: 'Mega Absol z', types: ['Dark', 'Ghost'], isMega: true, hp: 65, atk: 160, def: 60, spa: 125, spd: 60, spe: 125, abilityZh: '災禍之刃', abilityDesc: '惡鬼雙系高暴擊收割。' },
  { id: 'glalie', num: 362, nameZh: '冰鬼護', nameEn: 'Glalie', types: ['Ice'], hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80, abilityZh: '心情不定', abilityDesc: '回合結束隨機提升能力。' },
  { id: 'mega_glalie', num: 362, nameZh: '超級冰鬼護', nameEn: 'Mega Glalie', types: ['Ice'], isMega: true, hp: 80, atk: 120, def: 80, spa: 120, spd: 80, spe: 100, abilityZh: '冰凍皮膚', abilityDesc: '一般招式轉冰本系增傷，大爆炸秒殺。' },
  { id: 'salamence', num: 373, nameZh: '暴飛龍', nameEn: 'Salamence', types: ['Dragon', 'Flying'], hp: 95, atk: 135, def: 80, spa: 110, spd: 80, spe: 100, abilityZh: '威嚇', abilityDesc: '經典威嚇雙刀準神。' },
  { id: 'mega_salamence', num: 373, nameZh: '超級暴飛龍', nameEn: 'Mega Salamence', types: ['Dragon', 'Flying'], isMega: true, hp: 95, atk: 145, def: 130, spa: 120, spd: 90, spe: 120, abilityZh: '飛行皮膚', abilityDesc: '飛行皮膚舍身衝撞毀天滅地！' },
  { id: 'metagross', num: 376, nameZh: '巨金怪', nameEn: 'Metagross', types: ['Steel', 'Psychic'], hp: 80, atk: 135, def: 130, spa: 95, spd: 90, spe: 70, abilityZh: '恆淨之軀', abilityDesc: '天生免疫任何威嚇與能力下降。' },
  { id: 'mega_metagross', num: 376, nameZh: '超級巨金怪', nameEn: 'Mega Metagross', types: ['Steel', 'Psychic'], isMega: true, hp: 80, atk: 145, def: 150, spa: 105, spd: 110, spe: 110, abilityZh: '硬爪', abilityDesc: '接觸類招式提升 30%，110 速度鋼拳！' },

  // Gen 4
  { id: 'torterra', num: 389, nameZh: '土台龜', nameEn: 'Torterra', types: ['Grass', 'Ground'], hp: 95, atk: 109, def: 105, spa: 75, spd: 85, spe: 56, abilityZh: '茂盛', abilityDesc: '破殼後極速地震爆發。' },
  { id: 'infernape', num: 392, nameZh: '烈焰猴', nameEn: 'Infernape', types: ['Fire', 'Fighting'], hp: 76, atk: 104, def: 71, spa: 104, spd: 71, spe: 108, abilityZh: '鐵拳', abilityDesc: '高速擊掌奇襲、閃焰衝鋒與急速折返。' },
  { id: 'empoleon', num: 395, nameZh: '帝王拿波', nameEn: 'Empoleon', types: ['Water', 'Steel'], hp: 84, atk: 86, def: 88, spa: 111, spd: 101, spe: 60, abilityZh: '好勝', abilityDesc: '抗性極多的水鋼特攻手，好勝防威嚇。' },
  { id: 'staraptor', num: 398, nameZh: '姆克鷹', nameEn: 'Staraptor', types: ['Normal', 'Flying'], hp: 85, atk: 120, def: 70, spa: 50, spd: 60, spe: 100, abilityZh: '威嚇', abilityDesc: '舍身衝撞勇鳥猛攻。' },
  { id: 'mega_staraptor', num: 398, nameZh: '超級姆克鷹', nameEn: 'Mega Staraptor', types: ['Fighting', 'Flying'], isMega: true, hp: 85, atk: 155, def: 85, spa: 50, spd: 75, spe: 125, abilityZh: '適應力', abilityDesc: '格鬥飛行雙系 2.0 倍適應力爆發。' },
  { id: 'luxray', num: 405, nameZh: '倫琴貓', nameEn: 'Luxray', types: ['Electric'], hp: 80, atk: 120, def: 79, spa: 95, spd: 79, spe: 70, abilityZh: '威嚇', abilityDesc: '電系威嚇打手。' },
  { id: 'roserade', num: 407, nameZh: '羅絲雷朵', nameEn: 'Roserade', types: ['Grass', 'Poison'], hp: 60, atk: 70, def: 65, spa: 125, spd: 105, spe: 90, abilityZh: '技術高手', abilityDesc: '毒草雙系特攻手。' },
  { id: 'rampardos', num: 409, nameZh: '戰槌龍', nameEn: 'Rampardos', types: ['Rock'], hp: 97, atk: 165, def: 60, spa: 65, spd: 50, spe: 58, abilityZh: '破格', abilityDesc: '165 全非神獸最高基礎物攻！' },
  { id: 'bastiodon', num: 411, nameZh: '護城龍', nameEn: 'Bastiodon', types: ['Rock', 'Steel'], hp: 60, atk: 52, def: 168, spa: 47, spd: 138, spe: 30, abilityZh: '結實', abilityDesc: '金屬爆炸要塞。' },
  { id: 'lopunny', num: 428, nameZh: '長耳兔', nameEn: 'Lopunny', types: ['Normal'], hp: 65, atk: 76, def: 84, spa: 54, spd: 96, spe: 105, abilityZh: '柔軟', abilityDesc: '靈活輔助。' },
  { id: 'mega_lopunny', num: 428, nameZh: '超級長耳兔', nameEn: 'Mega Lopunny', types: ['Normal', 'Fighting'], isMega: true, hp: 65, atk: 136, def: 94, spa: 54, spd: 96, spe: 135, abilityZh: '膽量', abilityDesc: '膽量擊掌奇襲與飛膝踢貫穿幽靈系！' },
  { id: 'spiritomb', num: 442, nameZh: '花岩怪', nameEn: 'Spiritomb', types: ['Ghost', 'Dark'], hp: 50, atk: 92, def: 108, spa: 92, spd: 108, spe: 35, abilityZh: '穿透', abilityDesc: '無弱點抗性坦克。' },
  { id: 'garchomp', num: 445, nameZh: '烈咬陸鯊', nameEn: 'Garchomp', types: ['Dragon', 'Ground'], hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102, abilityZh: '粗糙皮膚', abilityDesc: '102 速度經典地面霸主。' },
  { id: 'mega_garchomp', num: 445, nameZh: '超級烈咬陸鯊', nameEn: 'Mega Garchomp', types: ['Dragon', 'Ground'], isMega: true, hp: 108, atk: 170, def: 115, spa: 120, spd: 95, spe: 92, abilityZh: '沙之力', abilityDesc: '沙暴下地震岩崩威力暴增。' },
  { id: 'mega_garchomp_z', num: 445, nameZh: '超級烈咬陸鯊Z', nameEn: 'Mega Garchomp z', types: ['Dragon'], isMega: true, hp: 108, atk: 180, def: 105, spa: 90, spd: 95, spe: 122, abilityZh: '龍之領域', abilityDesc: '122 高速龍之怒吼。' },
  { id: 'lucario', num: 448, nameZh: '路卡利歐', nameEn: 'Lucario', types: ['Fighting', 'Steel'], hp: 70, atk: 110, def: 70, spa: 115, spd: 70, spe: 90, abilityZh: '不屈之心', abilityDesc: '先制神速與近身戰。' },
  { id: 'mega_lucario', num: 448, nameZh: '超級路卡利歐', nameEn: 'Mega Lucario', types: ['Fighting', 'Steel'], isMega: true, hp: 70, atk: 145, def: 88, spa: 140, spd: 70, spe: 112, abilityZh: '適應力', abilityDesc: '適應力 2.0 倍近身戰與彗星拳瞬殺！' },
  { id: 'mega_lucario_z', num: 448, nameZh: '超級路卡利歐Z', nameEn: 'Mega Lucario z', types: ['Fighting', 'Steel'], isMega: true, hp: 70, atk: 160, def: 85, spa: 145, spd: 70, spe: 120, abilityZh: '波導大師', abilityDesc: '波導彈與神速極致輸出。' },
  { id: 'hippowdon', num: 450, nameZh: '河馬獸', nameEn: 'Hippowdon', types: ['Ground'], hp: 108, atk: 112, def: 118, spa: 68, spd: 72, spe: 47, abilityZh: '揚沙', abilityDesc: '頂級物理沙暴大盾。' },
  { id: 'toxicroak', num: 454, nameZh: '毒骷蛙', nameEn: 'Toxicroak', types: ['Poison', 'Fighting'], hp: 83, atk: 106, def: 65, spa: 86, spd: 65, spe: 85, abilityZh: '乾燥皮膚', abilityDesc: '雨天回血且免疫水屬性。' },
  { id: 'abomasnow', num: 460, nameZh: '暴雪王', nameEn: 'Abomasnow', types: ['Grass', 'Ice'], hp: 90, atk: 92, def: 75, spa: 92, spd: 85, spe: 60, abilityZh: '降雪', abilityDesc: '雪天暴風雪必中。' },
  { id: 'mega_abomasnow', num: 460, nameZh: '超級暴雪王', nameEn: 'Mega Abomasnow', types: ['Grass', 'Ice'], isMega: true, hp: 90, atk: 132, def: 105, spa: 132, spd: 105, spe: 30, abilityZh: '降雪', abilityDesc: '空間雪天雙刀重砲。' },
  { id: 'weavile', num: 461, nameZh: '瑪狃拉', nameEn: 'Weavile', types: ['Dark', 'Ice'], hp: 70, atk: 120, def: 65, spa: 45, spd: 85, spe: 125, abilityZh: '壓迫感', abilityDesc: '125 極速擊掌奇襲、冰旋與拍落。' },
  { id: 'rhyperior', num: 464, nameZh: '超甲狂犀', nameEn: 'Rhyperior', types: ['Ground', 'Rock'], hp: 115, atk: 140, def: 130, spa: 55, spd: 55, spe: 40, abilityZh: '堅硬岩石', abilityDesc: '效果絕佳傷害減傷 25%，空間巨神。' },
  { id: 'leafeon', num: 470, nameZh: '葉伊布', nameEn: 'Leafeon', types: ['Grass'], hp: 65, atk: 110, def: 130, spa: 60, spd: 65, spe: 95, abilityZh: '葉綠素', abilityDesc: '晴天下速度翻倍物攻手。' },
  { id: 'glaceon', num: 471, nameZh: '冰伊布', nameEn: 'Glaceon', types: ['Ice'], hp: 65, atk: 60, def: 110, spa: 130, spd: 95, spe: 65, abilityZh: '雪隱', abilityDesc: '130 高特攻暴風雪射手。' },
  { id: 'gliscor', num: 472, nameZh: '天蠍王', nameEn: 'Gliscor', types: ['Ground', 'Flying'], hp: 75, atk: 95, def: 125, spa: 45, spd: 75, spe: 95, abilityZh: '毒療', abilityDesc: '劇毒寶珠每回合回血 1/8 不死戰神。' },
  { id: 'mamoswine', num: 473, nameZh: '象牙豬', nameEn: 'Mamoswine', types: ['Ice', 'Ground'], hp: 110, atk: 130, def: 80, spa: 70, spd: 60, spe: 80, abilityZh: '厚脂肪', abilityDesc: '冰礫先制與地震打擊面極廣。' },
  { id: 'gallade', num: 475, nameZh: '艾路雷朵', nameEn: 'Gallade', types: ['Psychic', 'Fighting'], hp: 68, atk: 125, def: 65, spa: 65, spd: 115, spe: 80, abilityZh: '鋒銳', abilityDesc: '斬切類招式威力提升 50%（聖劍神刃）。' },
  { id: 'mega_gallade', num: 475, nameZh: '超級艾路雷朵', nameEn: 'Mega Gallade', types: ['Psychic', 'Fighting'], isMega: true, hp: 68, atk: 165, def: 95, spa: 65, spd: 115, spe: 110, abilityZh: '精神力', abilityDesc: '免疫畏縮，165 巨力近身戰。' },
  { id: 'froslass', num: 478, nameZh: '雪妖女', nameEn: 'Froslass', types: ['Ice', 'Ghost'], hp: 70, atk: 80, def: 70, spa: 80, spd: 70, spe: 110, abilityZh: '詛咒之軀', abilityDesc: '高速同命與撒菱。' },
  { id: 'mega_froslass', num: 478, nameZh: '超級雪妖女', nameEn: 'Mega Froslass', types: ['Ice', 'Ghost'], isMega: true, hp: 70, atk: 95, def: 85, spa: 120, spd: 85, spe: 135, abilityZh: '魔影冰晶', abilityDesc: '高速冰鬼法術暗殺。' },
  { id: 'rotom', num: 479, nameZh: '洛托姆', nameEn: 'Rotom', types: ['Electric', 'Ghost'], hp: 50, atk: 50, def: 77, spa: 95, spd: 77, spe: 91, abilityZh: '飄浮', abilityDesc: '免疫地面。' },
  { id: 'rotom_heat', num: 479, nameZh: '加熱洛托姆', nameEn: 'Heat Rotom', types: ['Electric', 'Fire'], hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86, abilityZh: '飄浮', abilityDesc: '過熱伏特替換電火輪轉。' },
  { id: 'rotom_wash', num: 479, nameZh: '清洗洛托姆', nameEn: 'Wash Rotom', types: ['Electric', 'Water'], hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86, abilityZh: '飄浮', abilityDesc: '僅弱草的水電鬼火輪轉手。' },
  { id: 'rotom_frost', num: 479, nameZh: '結冰洛托姆', nameEn: 'Frost Rotom', types: ['Electric', 'Ice'], hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86, abilityZh: '飄浮', abilityDesc: '暴風雪電系打手。' },
  { id: 'rotom_fan', num: 479, nameZh: '旋轉洛托姆', nameEn: 'Fan Rotom', types: ['Electric', 'Flying'], hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86, abilityZh: '飄浮', abilityDesc: '空氣斬與電磁波控場。' },
  { id: 'rotom_mow', num: 479, nameZh: '切割洛托姆', nameEn: 'Mow Rotom', types: ['Electric', 'Grass'], hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86, abilityZh: '飄浮', abilityDesc: '飛葉風暴水系殺手。' },

  // Gen 5
  { id: 'serperior', num: 497, nameZh: '君主蛇', nameEn: 'Serperior', types: ['Grass'], hp: 75, atk: 75, def: 95, spa: 75, spd: 95, spe: 113, abilityZh: '唱反調', abilityDesc: '使用飛葉風暴特攻反而暴增 2 級！' },
  { id: 'emboar', num: 500, nameZh: '炎武王', nameEn: 'Emboar', types: ['Fire', 'Fighting'], hp: 110, atk: 123, def: 65, spa: 100, spd: 65, spe: 65, abilityZh: '舍身', abilityDesc: '反作用力招式威力提升 20%。' },
  { id: 'mega_emboar', num: 500, nameZh: '超級炎武王', nameEn: 'Mega Emboar', types: ['Fire', 'Fighting'], isMega: true, hp: 110, atk: 153, def: 95, spa: 120, spd: 85, spe: 65, abilityZh: '烈火戰魂', abilityDesc: '閃焰衝鋒與近身戰毀滅爆發。' },
  { id: 'samurott', num: 503, nameZh: '大劍鬼', nameEn: 'Samurott', types: ['Water'], hp: 95, atk: 100, def: 85, spa: 108, spd: 70, spe: 70, abilityZh: '激流', abilityDesc: '水流噴射與聖劍。' },
  { id: 'samurott_hisui', num: 503, nameZh: '大劍鬼 (洗翠的樣子)', nameEn: 'Samurott (Hisuian Form)', types: ['Water', 'Dark'], hp: 90, atk: 108, def: 80, spa: 100, spd: 65, spe: 85, abilityZh: '鋒銳', abilityDesc: '秘劍·千重濤攻擊同時在對手場地布下撒菱！' },
  { id: 'watchog', num: 505, nameZh: '步哨鼠', nameEn: 'Watchog', types: ['Normal'], hp: 60, atk: 85, def: 69, spa: 60, spd: 69, spe: 77, abilityZh: '分析', abilityDesc: '催眠術與看穿。' },
  { id: 'liepard', num: 510, nameZh: '酷豹', nameEn: 'Liepard', types: ['Dark'], hp: 64, atk: 88, def: 50, spa: 88, spd: 50, spe: 106, abilityZh: '惡作劇之心', abilityDesc: '先制擊掌奇襲、哈欠與電磁波。' },
  { id: 'simisage', num: 512, nameZh: '花椰猿', nameEn: 'Simisage', types: ['Grass'], hp: 75, atk: 98, def: 63, spa: 98, spd: 63, spe: 101, abilityZh: '貪吃鬼', abilityDesc: '高速飛葉風暴。' },
  { id: 'simisear', num: 514, nameZh: '爆香猿', nameEn: 'Simisear', types: ['Fire'], hp: 75, atk: 98, def: 63, spa: 98, spd: 63, spe: 101, abilityZh: '貪吃鬼', abilityDesc: '高速火本系。' },
  { id: 'simipour', num: 516, nameZh: '冷水猿', nameEn: 'Simipour', types: ['Water'], hp: 75, atk: 98, def: 63, spa: 98, spd: 63, spe: 101, abilityZh: '貪吃鬼', abilityDesc: '高速熱水與冰凍光束。' },
  { id: 'musharna', num: 518, nameZh: '夢夢蝕', nameEn: 'Musharna', types: ['Psychic'], hp: 116, atk: 55, def: 85, spa: 107, spd: 95, spe: 29, abilityZh: '心靈感應', abilityDesc: '超高血量空間手。' },
  { id: 'excadrill', num: 530, nameZh: '龍頭地鼠', nameEn: 'Excadrill', types: ['Ground', 'Steel'], hp: 110, atk: 135, def: 60, spa: 50, spd: 65, spe: 88, abilityZh: '撥沙', abilityDesc: '沙暴下速度翻倍，鋼地雙本推土機。' },
  { id: 'mega_excadrill', num: 530, nameZh: '超級龍頭地鼠', nameEn: 'Mega Excadrill', types: ['Ground', 'Steel'], isMega: true, hp: 110, atk: 165, def: 80, spa: 50, spd: 85, spe: 118, abilityZh: '金屬穿透', abilityDesc: '高速鐵頭與地震重拳。' },
  { id: 'audino', num: 531, nameZh: '差不多娃娃', nameEn: 'Audino', types: ['Normal'], hp: 103, atk: 60, def: 86, spa: 60, spd: 86, spe: 50, abilityZh: '再生力', abilityDesc: '治癒波動與幫助。' },
  { id: 'mega_audino', num: 531, nameZh: '超級差不多娃娃', nameEn: 'Mega Audino', types: ['Normal', 'Fairy'], isMega: true, hp: 103, atk: 60, def: 126, spa: 80, spd: 126, spe: 50, abilityZh: '治癒之心', abilityDesc: '極高雙防，雙打終極治癒護士。' },
  { id: 'conkeldurr', num: 534, nameZh: '修建老匠', nameEn: 'Conkeldurr', types: ['Fighting'], hp: 105, atk: 140, def: 95, spa: 55, spd: 65, spe: 45, abilityZh: '毅力', abilityDesc: '火焰寶珠灼傷觸發 1.5 倍物攻，音速拳收割。' },
  { id: 'scolipede', num: 545, nameZh: '蜈蚣王', nameEn: 'Scolipede', types: ['Bug', 'Poison'], hp: 60, atk: 100, def: 89, spa: 55, spd: 69, spe: 112, abilityZh: '加速', abilityDesc: '每回合自動提速，接力棒或強攻。' },
  { id: 'mega_scolipede', num: 545, nameZh: '超級蜈蚣王', nameEn: 'Mega Scolipede', types: ['Bug', 'Poison'], isMega: true, hp: 60, atk: 135, def: 119, spa: 55, spd: 79, spe: 137, abilityZh: '致命毒刺', abilityDesc: '擊倒對手攻擊暴增。' },
  { id: 'whimsicott', num: 547, nameZh: '風妖精', nameEn: 'Whimsicott', types: ['Grass', 'Fairy'], hp: 60, atk: 67, def: 85, spa: 77, spd: 75, spe: 116, abilityZh: '惡作劇之心', abilityDesc: '先制順風與再來一次，雙打控速核心。' },
  { id: 'krookodile', num: 553, nameZh: '流氓鱷', nameEn: 'Krookodile', types: ['Ground', 'Dark'], hp: 95, atk: 117, def: 80, spa: 65, spd: 70, spe: 92, abilityZh: '威嚇', abilityDesc: '自信過度或威嚇打手。' },
  { id: 'scrafty', num: 560, nameZh: '頭巾混混', nameEn: 'Scrafty', types: ['Dark', 'Fighting'], hp: 65, atk: 90, def: 115, spa: 45, spd: 115, spe: 58, abilityZh: '威嚇', abilityDesc: '擊掌奇襲、拍落與吸收拳。' },
  { id: 'mega_scrafty', num: 560, nameZh: '超級頭巾混混', nameEn: 'Mega Scrafty', types: ['Dark', 'Fighting'], isMega: true, hp: 65, atk: 130, def: 140, spa: 45, spd: 140, spe: 68, abilityZh: '鐵拳', abilityDesc: '雙防 140 不死格鬥家。' },
  { id: 'cofagrigus', num: 563, nameZh: '死神棺', nameEn: 'Cofagrigus', types: ['Ghost'], hp: 58, atk: 50, def: 145, spa: 95, spd: 105, spe: 30, abilityZh: '木乃伊', abilityDesc: '接觸時將對手特性轉化為木乃伊！' },
  { id: 'garbodor', num: 569, nameZh: '灰塵山', nameEn: 'Garbodor', types: ['Poison'], hp: 80, atk: 95, def: 82, spa: 60, spd: 82, spe: 75, abilityZh: '碎裂鎧甲', abilityDesc: '受到物攻提速。' },
  { id: 'zoroark', num: 571, nameZh: '索羅亞克', nameEn: 'Zoroark', types: ['Dark'], hp: 60, atk: 105, def: 60, spa: 120, spd: 60, spe: 105, abilityZh: '幻覺', abilityDesc: '偽裝成隊伍末尾寶可夢進場！' },
  { id: 'zoroark_hisui', num: 571, nameZh: '索羅亞克 (洗翠的樣子)', nameEn: 'Zoroark (Hisuian Form)', types: ['Normal', 'Ghost'], hp: 55, atk: 100, def: 60, spa: 125, spd: 60, spe: 110, abilityZh: '幻覺', abilityDesc: '一般幽靈雙系，免疫普、鬥、鬼三種屬性！' },
  { id: 'reuniclus', num: 579, nameZh: '人造細胞卵', nameEn: 'Reuniclus', types: ['Psychic'], hp: 110, atk: 65, def: 75, spa: 125, spd: 85, spe: 30, abilityZh: '魔法防守', abilityDesc: '空間冥想生命寶珠無反傷。' },
  { id: 'vanilluxe', num: 584, nameZh: '雙倍多多冰', nameEn: 'Vanilluxe', types: ['Ice'], hp: 71, atk: 95, def: 85, spa: 110, spd: 95, spe: 79, abilityZh: '降雪', abilityDesc: '極光幕與暴風雪。' },
  { id: 'emolga', num: 587, nameZh: '電飛鼠', nameEn: 'Emolga', types: ['Electric', 'Flying'], hp: 55, atk: 75, def: 60, spa: 75, spd: 60, spe: 103, abilityZh: '電氣引擎', abilityDesc: '免疫電且提速。' },
  { id: 'amoonguss', num: 591, nameZh: '敗露球菇', nameEn: 'Amoonguss', types: ['Grass', 'Poison'], hp: 114, atk: 85, def: 70, spa: 85, spd: 80, spe: 30, abilityZh: '再生力', abilityDesc: '100% 命中蘑菇孢子與憤怒粉吸仇恨。' },
  { id: 'eelektross', num: 604, nameZh: '麻麻鰻魚王', nameEn: 'Eelektross', types: ['Electric'], hp: 85, atk: 115, def: 80, spa: 105, spd: 80, spe: 50, abilityZh: '飄浮', abilityDesc: '全遊戲唯一完全沒有任何屬性弱點！' },
  { id: 'mega_eelektross', num: 604, nameZh: '超級麻麻鰻魚王', nameEn: 'Mega Eelektross', types: ['Electric'], isMega: true, hp: 85, atk: 145, def: 95, spa: 135, spd: 95, spe: 60, abilityZh: '飄浮', abilityDesc: '無弱點雙刀重裝殺手。' },
  { id: 'chandelure', num: 609, nameZh: '水晶燈火靈', nameEn: 'Chandelure', types: ['Ghost', 'Fire'], hp: 60, atk: 55, def: 90, spa: 145, spd: 90, spe: 80, abilityZh: '引火', abilityDesc: '145 超高火鬼特攻，封印戲法空間。' },
  { id: 'mega_chandelure', num: 609, nameZh: '超級水晶燈火靈', nameEn: 'Mega Chandelure', types: ['Ghost', 'Fire'], isMega: true, hp: 60, atk: 65, def: 105, spa: 175, spd: 105, spe: 90, abilityZh: '靈魂吞噬', abilityDesc: '175 鬼火毀滅特攻。' },
  { id: 'beartic', num: 614, nameZh: '凍原熊', nameEn: 'Beartic', types: ['Ice'], hp: 95, atk: 130, def: 80, spa: 70, spd: 80, spe: 50, abilityZh: '撥雪', abilityDesc: '雪天下速度翻倍。' },
  { id: 'stunfisk', num: 618, nameZh: '泥巴魚', nameEn: 'Stunfisk', types: ['Ground', 'Electric'], hp: 109, atk: 66, def: 84, spa: 81, spd: 99, spe: 32, abilityZh: '靜電', abilityDesc: '電磁波與濁流。' },
  { id: 'stunfisk_galar', num: 618, nameZh: '泥巴魚 (伽勒爾的樣子)', nameEn: 'Stunfisk (Galarian Form)', types: ['Ground', 'Steel'], hp: 109, atk: 81, def: 99, spa: 66, spd: 84, spe: 32, abilityZh: '擬態', abilityDesc: '隨場地變換屬性。' },
  { id: 'golurk', num: 623, nameZh: '泥偶巨人', nameEn: 'Golurk', types: ['Ground', 'Ghost'], hp: 89, atk: 124, def: 80, spa: 55, spd: 80, spe: 55, abilityZh: '鐵拳', abilityDesc: '暗影拳與十萬馬力。' },
  { id: 'mega_golurk', num: 623, nameZh: '超級泥偶巨人', nameEn: 'Mega Golurk', types: ['Ground', 'Ghost'], isMega: true, hp: 89, atk: 154, def: 110, spa: 55, spd: 110, spe: 65, abilityZh: '古代核心', abilityDesc: '空間極致破壞重拳。' },
  { id: 'hydreigon', num: 635, nameZh: '三首惡龍', nameEn: 'Hydreigon', types: ['Dark', 'Dragon'], hp: 92, atk: 105, def: 90, spa: 125, spd: 90, spe: 98, abilityZh: '飄浮', abilityDesc: '免疫地面，惡波流星群。' },
  { id: 'volcarona', num: 637, nameZh: '火神蛾', nameEn: 'Volcarona', types: ['Bug', 'Fire'], hp: 85, atk: 60, def: 65, spa: 135, spd: 105, spe: 100, abilityZh: '火焰之軀', abilityDesc: '蝶舞一次推全隊。' },
  { id: 'landorus_t', num: 645, nameZh: '土地雲 (靈獸形態)', nameEn: 'Landorus-Therian', types: ['Ground', 'Flying'], hp: 89, atk: 145, def: 90, spa: 105, spd: 80, spe: 91, abilityZh: '威嚇', abilityDesc: '地震、岩崩與急速折返全能輪轉。' },

  // Gen 6
  { id: 'chesnaught', num: 652, nameZh: '布里卡隆', nameEn: 'Chesnaught', types: ['Grass', 'Fighting'], hp: 88, atk: 107, def: 122, spa: 74, spd: 75, spe: 64, abilityZh: '防彈', abilityDesc: '免疫所有球類與炸彈技能。' },
  { id: 'mega_chesnaught', num: 652, nameZh: '超級布里卡隆', nameEn: 'Mega Chesnaught', types: ['Grass', 'Fighting'], isMega: true, hp: 88, atk: 147, def: 152, spa: 74, spd: 95, spe: 74, abilityZh: '尖刺重甲', abilityDesc: '極致物理防守要塞。' },
  { id: 'delphox', num: 655, nameZh: '妖火紅狐', nameEn: 'Delphox', types: ['Fire', 'Psychic'], hp: 75, atk: 69, def: 72, spa: 114, spd: 100, spe: 104, abilityZh: '魔術師', abilityDesc: '奪取對手道具。' },
  { id: 'mega_delphox', num: 655, nameZh: '超級妖火紅狐', nameEn: 'Mega Delphox', types: ['Fire', 'Psychic'], isMega: true, hp: 75, atk: 69, def: 82, spa: 154, spd: 120, spe: 130, abilityZh: '心靈火焰', abilityDesc: '高速火本系大砲。' },
  { id: 'greninja', num: 658, nameZh: '甲賀忍蛙', nameEn: 'Greninja', types: ['Water', 'Dark'], hp: 72, atk: 95, def: 67, spa: 103, spd: 71, spe: 122, abilityZh: '變幻自如', abilityDesc: '出招前屬性轉換。' },
  { id: 'mega_greninja', num: 658, nameZh: '超級甲賀忍蛙', nameEn: 'Mega Greninja', types: ['Water', 'Dark'], isMega: true, hp: 72, atk: 145, def: 67, spa: 153, spd: 71, spe: 142, abilityZh: '羈絆飛鏢', abilityDesc: '142 超速黃金水手裡劍。' },
  { id: 'diggersby', num: 660, nameZh: '掘地兔', nameEn: 'Diggersby', types: ['Normal', 'Ground'], hp: 85, atk: 56, def: 77, spa: 50, spd: 77, spe: 78, abilityZh: '大力士', abilityDesc: '大力士翻倍物攻。' },
  { id: 'talonflame', num: 663, nameZh: '烈箭鷹', nameEn: 'Talonflame', types: ['Fire', 'Flying'], hp: 78, atk: 81, def: 71, spa: 74, spd: 69, spe: 126, abilityZh: '疾風之翼', abilityDesc: '滿血先制 +1 順風與勇鳥猛攻！' },
  { id: 'vivillon', num: 666, nameZh: '彩粉蝶', nameEn: 'Vivillon', types: ['Bug', 'Flying'], hp: 80, atk: 52, def: 50, spa: 90, spd: 50, spe: 89, abilityZh: '複眼', abilityDesc: '複眼 97.5% 命中睡眠粉催眠。' },
  { id: 'pyroar', num: 668, nameZh: '火炎獅', nameEn: 'Pyroar', types: ['Fire', 'Normal'], hp: 86, atk: 68, def: 72, spa: 109, spd: 66, spe: 106, abilityZh: '緊張感', abilityDesc: '使對手無法食用樹果。' },
  { id: 'mega_pyroar', num: 668, nameZh: '超級火炎獅', nameEn: 'Mega Pyroar', types: ['Fire', 'Normal'], isMega: true, hp: 86, atk: 78, def: 92, spa: 149, spd: 76, spe: 126, abilityZh: '獅王咆哮', abilityDesc: '高威火熱風壓制。' },
  { id: 'floette', num: 670, nameZh: '花葉蒂', nameEn: 'Floette', types: ['Fairy'], hp: 54, atk: 45, def: 47, spa: 75, spd: 98, spe: 52, abilityZh: '共生', abilityDesc: '傳遞道具輔助。' },
  { id: 'floette_eternal', num: 670, nameZh: '永恆之花花葉蒂', nameEn: 'Floette (Eternal Flower)', types: ['Fairy'], hp: 74, atk: 65, def: 67, spa: 125, spd: 128, spe: 92, abilityZh: '花幕', abilityDesc: '專屬破滅之光 140 威力妖精大招！' },
  { id: 'mega_floette', num: 670, nameZh: '超級花葉蒂', nameEn: 'Mega Floette', types: ['Fairy'], isMega: true, hp: 74, atk: 75, def: 87, spa: 155, spd: 138, spe: 112, abilityZh: '永恆光輝', abilityDesc: '妖精極限特攻。' },
  { id: 'florges', num: 671, nameZh: '花潔夫人', nameEn: 'Florges', types: ['Fairy'], hp: 78, atk: 65, def: 68, spa: 112, spd: 154, spe: 75, abilityZh: '共生', abilityDesc: '154 特防妖精特盾。' },
  { id: 'gogoat', num: 673, nameZh: '坐騎山羊', nameEn: 'Gogoat', types: ['Grass'], hp: 123, atk: 100, def: 62, spa: 97, spd: 81, spe: 68, abilityZh: '草之毛皮', abilityDesc: '草場防禦提升 50%。' },
  { id: 'pangoro', num: 675, nameZh: '流氓熊貓', nameEn: 'Pangoro', types: ['Fighting', 'Dark'], hp: 95, atk: 124, def: 78, spa: 69, spd: 71, spe: 58, abilityZh: '鐵拳', abilityDesc: '近身戰、拍落與拋下狠話。' },
  { id: 'furfrou', num: 676, nameZh: '多麗米亞', nameEn: 'Furfrou', types: ['Normal'], hp: 75, atk: 80, def: 60, spa: 65, spd: 90, spe: 102, abilityZh: '毛茸茸', abilityDesc: '物理接觸傷害減半。' },
  { id: 'meowstic_m', num: 678, nameZh: '超能妙喵 (雄性的樣子)', nameEn: 'Meowstic (Male)', types: ['Psychic'], hp: 74, atk: 48, def: 76, spa: 83, spd: 81, spe: 104, abilityZh: '惡作劇之心', abilityDesc: '先制雙牆、電磁波、哈欠控場。' },
  { id: 'meowstic_f', num: 678, nameZh: '超能妙喵 (雌性的樣子)', nameEn: 'Meowstic (Female)', types: ['Psychic'], hp: 74, atk: 48, def: 76, spa: 83, spd: 81, spe: 104, abilityZh: '好勝', abilityDesc: '反威嚇特攻手。' },
  { id: 'mega_meowstic', num: 678, nameZh: '超級超能妙喵', nameEn: 'Mega Meowstic', types: ['Psychic'], isMega: true, hp: 74, atk: 58, def: 96, spa: 123, spd: 111, spe: 124, abilityZh: '心靈干涉', abilityDesc: '高速雙打控場。' },
  { id: 'aegislash', num: 681, nameZh: '堅盾劍怪', nameEn: 'Aegislash', types: ['Steel', 'Ghost'], hp: 60, atk: 50, def: 140, spa: 50, spd: 140, spe: 60, abilityZh: '戰鬥切換', abilityDesc: '防禦形態 140 雙防，攻擊形態 140 雙攻！' },
  { id: 'aromatisse', num: 683, nameZh: '芳香精', nameEn: 'Aromatisse', types: ['Fairy'], hp: 101, atk: 72, def: 72, spa: 99, spd: 89, spe: 29, abilityZh: '芳香幕', abilityDesc: '免疫挑釁，空間核心。' },
  { id: 'slurpuff', num: 685, nameZh: '胖甜妮', nameEn: 'Slurpuff', types: ['Fairy'], hp: 82, atk: 80, def: 86, spa: 85, spd: 75, spe: 72, abilityZh: '輕裝', abilityDesc: '腹鼓後消耗大樹果速度翻倍！' },
  { id: 'malamar', num: 687, nameZh: '烏賊王', nameEn: 'Malamar', types: ['Dark', 'Psychic'], hp: 86, atk: 92, def: 88, spa: 68, spd: 75, spe: 73, abilityZh: '唱反調', abilityDesc: '蠻力攻擊後攻擊防禦反而上升！' },
  { id: 'mega_malamar', num: 687, nameZh: '超級烏賊王', nameEn: 'Mega Malamar', types: ['Dark', 'Psychic'], isMega: true, hp: 86, atk: 122, def: 108, spa: 88, spd: 95, spe: 83, abilityZh: '唱反調', abilityDesc: '無限自我強化戰士。' },
  { id: 'barbaracle', num: 689, nameZh: '龜足巨鎧', nameEn: 'Barbaracle', types: ['Rock', 'Water'], hp: 72, atk: 105, def: 115, spa: 54, spd: 86, spe: 68, abilityZh: '硬爪', abilityDesc: '破殼硬爪水流裂破。' },
  { id: 'mega_barbaracle', num: 689, nameZh: '超級龜足巨鎧', nameEn: 'Mega Barbaracle', types: ['Rock', 'Fighting'], isMega: true, hp: 72, atk: 145, def: 135, spa: 54, spd: 96, spe: 88, abilityZh: '硬爪', abilityDesc: '岩石格鬥超高物理爆發。' },
  { id: 'dragalge', num: 691, nameZh: '毒藻龍', nameEn: 'Dragalge', types: ['Poison', 'Dragon'], hp: 65, atk: 75, def: 90, spa: 97, spd: 123, spe: 44, abilityZh: '適應力', abilityDesc: '適應力 2.0 倍污泥炸彈與流星群。' },
  { id: 'mega_dragalge', num: 691, nameZh: '超級毒藻龍', nameEn: 'Mega Dragalge', types: ['Poison', 'Dragon'], isMega: true, hp: 65, atk: 85, def: 110, spa: 137, spd: 143, spe: 44, abilityZh: '適應力', abilityDesc: '空間下毀滅性法系核彈。' },
  { id: 'clawitzer', num: 693, nameZh: '鋼炮臂蝦', nameEn: 'Clawitzer', types: ['Water'], hp: 71, atk: 73, def: 88, spa: 120, spd: 89, spe: 59, abilityZh: '超級發射器', abilityDesc: '水之波動、波導彈增傷 50%。' },
  { id: 'heliolisk', num: 695, nameZh: '光電傘蜥', nameEn: 'Heliolisk', types: ['Electric', 'Normal'], hp: 62, atk: 55, def: 52, spa: 109, spd: 94, spe: 109, abilityZh: '乾燥皮膚', abilityDesc: '雨天太陽之力晴雨雙修。' },
  { id: 'tyrantrum', num: 697, nameZh: '怪顎龍', nameEn: 'Tyrantrum', types: ['Rock', 'Dragon'], hp: 82, atk: 121, def: 119, spa: 69, spd: 59, spe: 71, abilityZh: '堅硬腦袋', abilityDesc: '雙刃頭錘無反傷極限轟擊。' },
  { id: 'aurorus', num: 699, nameZh: '冰雪巨龍', nameEn: 'Aurorus', types: ['Rock', 'Ice'], hp: 123, atk: 77, def: 72, spa: 99, spd: 92, spe: 58, abilityZh: '冰凍皮膚', abilityDesc: '巨聲轉為冰屬性範圍高傷。' },
  { id: 'sylveon', num: 700, nameZh: '仙子伊布', nameEn: 'Sylveon', types: ['Fairy'], hp: 95, atk: 65, def: 65, spa: 110, spd: 130, spe: 60, abilityZh: '妖精皮膚', abilityDesc: '巨聲穿透替身全體妖精轟炸。' },
  { id: 'hawlucha', num: 701, nameZh: '摔角鷹人', nameEn: 'Hawlucha', types: ['Fighting', 'Flying'], hp: 78, atk: 92, def: 75, spa: 74, spd: 63, spe: 118, abilityZh: '輕裝', abilityDesc: '消耗電氣種子速度翻倍超車全場。' },
  { id: 'mega_hawlucha', num: 701, nameZh: '超級摔角鷹人', nameEn: 'Mega Hawlucha', types: ['Fighting', 'Flying'], isMega: true, hp: 78, atk: 132, def: 95, spa: 74, spd: 73, spe: 148, abilityZh: '鐵拳', abilityDesc: '高速近身戰與飛島重壓。' },
  { id: 'dedenne', num: 702, nameZh: '咚咚鼠', nameEn: 'Dedenne', types: ['Electric', 'Fairy'], hp: 67, atk: 58, def: 57, spa: 81, spd: 67, spe: 101, abilityZh: '臉頰蹭蹭', abilityDesc: '必中麻痺控速神器。' },
  { id: 'goodra', num: 706, nameZh: '黏美龍', nameEn: 'Goodra', types: ['Dragon'], hp: 90, atk: 100, def: 70, spa: 110, spd: 150, spe: 80, abilityZh: '食草', abilityDesc: '150 特防免疫草招。' },
  { id: 'goodra_hisui', num: 706, nameZh: '黏美龍 (洗翠的樣子)', nameEn: 'Goodra (Hisuian Form)', types: ['Steel', 'Dragon'], hp: 80, atk: 100, def: 100, spa: 110, spd: 150, spe: 60, abilityZh: '食草', abilityDesc: '鋼龍頂級抗性，閉殼防守要塞。' },
  { id: 'klefki', num: 707, nameZh: '鑰圈兒', nameEn: 'Klefki', types: ['Steel', 'Fairy'], hp: 57, atk: 80, def: 91, spa: 80, spd: 87, spe: 75, abilityZh: '惡作劇之心', abilityDesc: '先制電磁波、雙牆與虛張聲勢。' },
  { id: 'trevenant', num: 709, nameZh: '朽木妖', nameEn: 'Trevenant', types: ['Ghost', 'Grass'], hp: 85, atk: 110, def: 76, spa: 65, spd: 82, spe: 56, abilityZh: '收穫', abilityDesc: '晴天下 100% 機率回收樹果。' },
  { id: 'gourgeist', num: 711, nameZh: '南瓜怪人', nameEn: 'Gourgeist', types: ['Ghost', 'Grass'], hp: 85, atk: 100, def: 122, spa: 58, spd: 75, spe: 54, abilityZh: '察覺', abilityDesc: '鬼火與吸血。' },
  { id: 'avalugg', num: 713, nameZh: '冰岩怪', nameEn: 'Avalugg', types: ['Ice'], hp: 95, atk: 117, def: 184, spa: 44, spd: 46, spe: 28, abilityZh: '冰凍之軀', abilityDesc: '184 頂級物理盾。' },
  { id: 'avalugg_hisui', num: 713, nameZh: '冰岩怪 (洗翠的樣子)', nameEn: 'Avalugg (Hisuian Form)', types: ['Ice', 'Rock'], hp: 95, atk: 127, def: 184, spa: 34, spd: 36, spe: 38, abilityZh: '結實', abilityDesc: '山崩地裂與雪景防禦。' },
  { id: 'noivern', num: 715, nameZh: '音波龍', nameEn: 'Noivern', types: ['Flying', 'Dragon'], hp: 85, atk: 70, def: 80, spa: 97, spd: 80, spe: 123, abilityZh: '穿透', abilityDesc: '123 高速穿透替身暴風。' },

  // Gen 7
  { id: 'decidueye', num: 724, nameZh: '狙射樹梟', nameEn: 'Decidueye', types: ['Grass', 'Ghost'], hp: 78, atk: 107, def: 75, spa: 100, spd: 100, spe: 70, abilityZh: '遠隔', abilityDesc: '縫影定身對手。' },
  { id: 'decidueye_hisui', num: 724, nameZh: '狙射樹梟 (洗翠的樣子)', nameEn: 'Decidueye (Hisuian Form)', types: ['Grass', 'Fighting'], hp: 88, atk: 112, def: 80, spa: 95, spd: 95, spe: 60, abilityZh: '膽量', abilityDesc: '三連箭貫穿防禦必定畏縮。' },
  { id: 'incineroar', num: 727, nameZh: '熾焰咆哮虎', nameEn: 'Incineroar', types: ['Fire', 'Dark'], hp: 95, atk: 115, def: 90, spa: 80, spd: 90, spe: 60, abilityZh: '威嚇', abilityDesc: '宇宙第一威嚇擊掌拋下狠話輪轉神。' },
  { id: 'primarina', num: 730, nameZh: '西獅海壬', nameEn: 'Primarina', types: ['Water', 'Fairy'], hp: 80, atk: 74, def: 74, spa: 126, spd: 116, spe: 60, abilityZh: '濕潤之聲', abilityDesc: '滅亡之歌與高傷月亮之力。' },
  { id: 'toucannon', num: 733, nameZh: '銃嘴大鳥', nameEn: 'Toucannon', types: ['Normal', 'Flying'], hp: 80, atk: 120, def: 75, spa: 75, spd: 75, spe: 60, abilityZh: '連續攻擊', abilityDesc: '鳥嘴加熱蓄力灼傷反傷。' },
  { id: 'crabominable', num: 740, nameZh: '好勝毛蟹', nameEn: 'Crabominable', types: ['Fighting', 'Ice'], hp: 97, atk: 132, def: 77, spa: 62, spd: 67, spe: 43, abilityZh: '鐵拳', abilityDesc: '空間近身戰與冰鎚。' },
  { id: 'mega_crabominable', num: 740, nameZh: '超級好勝毛蟹', nameEn: 'Mega Crabominable', types: ['Fighting', 'Ice'], isMega: true, hp: 97, atk: 162, def: 107, spa: 62, spd: 87, spe: 43, abilityZh: '鐵拳', abilityDesc: '極致空間冰拳巨獸。' },
  { id: 'lycanroc', num: 745, nameZh: '鬃岩狼人', nameEn: 'Lycanroc', types: ['Rock'], hp: 75, atk: 115, def: 65, spa: 55, spd: 65, spe: 112, abilityZh: '撥沙', abilityDesc: '先制落石與極速岩崩。' },
  { id: 'toxapex', num: 748, nameZh: '超壞星', nameEn: 'Toxapex', types: ['Poison', 'Water'], hp: 50, atk: 63, def: 152, spa: 53, spd: 142, spe: 35, abilityZh: '再生力', abilityDesc: '152/142 雙防極限劇毒碉堡。' },
  { id: 'mudsdale', num: 750, nameZh: '重泥挽馬', nameEn: 'Mudsdale', types: ['Ground'], hp: 100, atk: 125, def: 100, spa: 55, spd: 85, spe: 35, abilityZh: '持久力', abilityDesc: '受到攻擊時物理防禦提升 1 級！' },
  { id: 'araquanid', num: 752, nameZh: '滴蛛霸', nameEn: 'Araquanid', types: ['Water', 'Bug'], hp: 68, atk: 70, def: 92, spa: 50, spd: 132, spe: 42, abilityZh: '水泡', abilityDesc: '水屬性招式威力直接翻倍（2.0x），免疫灼傷！' },
  { id: 'salazzle', num: 758, nameZh: '焰后蜥', nameEn: 'Salazzle', types: ['Poison', 'Fire'], hp: 68, atk: 64, def: 60, spa: 111, spd: 60, spe: 117, abilityZh: '腐蝕', abilityDesc: '可以使鋼屬性與毒屬性寶可夢陷入中毒！' },
  { id: 'tsareena', num: 763, nameZh: '甜冷美后', nameEn: 'Tsareena', types: ['Grass'], hp: 72, atk: 120, def: 98, spa: 50, spd: 98, spe: 72, abilityZh: '女王的威嚴', abilityDesc: '使對手所有先制招式對我方全體無效！' },
  { id: 'oranguru', num: 765, nameZh: '智揮猩', nameEn: 'Oranguru', types: ['Normal', 'Psychic'], hp: 90, atk: 60, def: 80, spa: 90, spd: 110, spe: 60, abilityZh: '心靈感應', abilityDesc: '號令讓隊友當回合立刻再次行動一次！' },
  { id: 'passimian', num: 766, nameZh: '投擲猴', nameEn: 'Passimian', types: ['Fighting'], hp: 100, atk: 120, def: 90, spa: 40, spd: 60, spe: 80, abilityZh: '接球手', abilityDesc: '繼承瀕死隊友特性。' },
  { id: 'golisopod', num: 768, nameZh: '具甲武者', nameEn: 'Golisopod', types: ['Bug', 'Water'], hp: 75, atk: 125, def: 140, spa: 60, spd: 90, spe: 40, abilityZh: '危險迴避', abilityDesc: '先制迎頭一擊 90 威力！' },
  { id: 'mega_golisopod', num: 768, nameZh: '超級具甲武者', nameEn: 'Mega Golisopod', types: ['Bug', 'Steel'], isMega: true, hp: 75, atk: 155, def: 170, spa: 60, spd: 105, spe: 35, abilityZh: '戰鬥堅甲', abilityDesc: '蟲鋼極致反打重甲。' },
  { id: 'mimikyu', num: 778, nameZh: '謎擬Ｑ', nameEn: 'Mimikyu', types: ['Ghost', 'Fairy'], hp: 55, atk: 90, def: 80, spa: 50, spd: 105, spe: 96, abilityZh: '畫皮', abilityDesc: '免費抵擋一次致命傷害，劍舞推隊。' },
  { id: 'drampa', num: 780, nameZh: '老翁龍', nameEn: 'Drampa', types: ['Normal', 'Dragon'], hp: 78, atk: 60, def: 85, spa: 135, spd: 91, spe: 36, abilityZh: '怒火衝天', abilityDesc: 'HP 低於一半特攻上升 1 級。' },
  { id: 'mega_drampa', num: 780, nameZh: '超級老翁龍', nameEn: 'Mega Drampa', types: ['Normal', 'Dragon'], isMega: true, hp: 78, atk: 60, def: 105, spa: 165, spd: 111, spe: 36, abilityZh: '龍之怒濤', abilityDesc: '空間 165 巨龍特攻。' },
  { id: 'kommo_o', num: 784, nameZh: '杖尾鱗甲龍', nameEn: 'Kommo-o', types: ['Dragon', 'Fighting'], hp: 75, atk: 110, def: 125, spa: 100, spd: 105, spe: 85, abilityZh: '防塵', abilityDesc: '魂舞烈音爆全能力提升。' },

  // Gen 8
  { id: 'rillaboom', num: 812, nameZh: '轟擂金剛猩', nameEn: 'Rillaboom', types: ['Grass'], hp: 100, atk: 125, def: 90, spa: 60, spd: 70, spe: 85, abilityZh: '青草製造者', abilityDesc: '青草滑梯先制收割，擊掌奇襲輪轉。' },
  { id: 'cinderace', num: 815, nameZh: '閃焰王牌', nameEn: 'Cinderace', types: ['Fire'], hp: 80, atk: 116, def: 75, spa: 65, spd: 75, spe: 119, abilityZh: '自由者', abilityDesc: '招式出招轉換本系 1.5 倍加成。' },
  { id: 'inteleon', num: 818, nameZh: '千面避役', nameEn: 'Inteleon', types: ['Water'], hp: 70, atk: 65, def: 65, spa: 125, spd: 65, spe: 120, abilityZh: '狙擊手', abilityDesc: '狙擊必定暴擊高傷。' },
  { id: 'corviknight', num: 823, nameZh: '鋼鎧鴉', nameEn: 'Corviknight', types: ['Flying', 'Steel'], hp: 98, atk: 87, def: 105, spa: 53, spd: 85, spe: 67, abilityZh: '鏡甲', abilityDesc: '反彈一切對手降低自身能力的招式！' },
  { id: 'thievul', num: 828, nameZh: '狐大盜', nameEn: 'Thievul', types: ['Dark'], hp: 70, atk: 58, def: 58, spa: 87, spd: 92, spe: 100, abilityZh: '逃跑', abilityDesc: '拋下狠話妨礙手。' },
  { id: 'flapple', num: 841, nameZh: '蘋裹龍', nameEn: 'Flapple', types: ['Grass', 'Dragon'], hp: 70, atk: 110, def: 80, spa: 95, spd: 60, spe: 70, abilityZh: '活力', abilityDesc: '萬撲果重摔降防。' },
  { id: 'appletun', num: 842, nameZh: '豐蜜龍', nameEn: 'Appletun', types: ['Grass', 'Dragon'], hp: 110, atk: 85, def: 80, spa: 100, spd: 80, spe: 30, abilityZh: '厚脂肪', abilityDesc: '蘋果酸降特防。' },
  { id: 'sandaconda', num: 844, nameZh: '沙螺蟒', nameEn: 'Sandaconda', types: ['Ground'], hp: 72, atk: 107, def: 125, spa: 65, spd: 70, spe: 71, abilityZh: '吐沙', abilityDesc: '挨打引發沙暴。' },
  { id: 'toxtricity', num: 849, nameZh: '顫弦蠑螈', nameEn: 'Toxtricity', types: ['Electric', 'Poison'], hp: 75, atk: 98, def: 70, spa: 114, spd: 70, spe: 75, abilityZh: '龐克搖滾', abilityDesc: '聲音類招式威力提升 30%，爆音波破陣。' },
  { id: 'grapploct', num: 853, nameZh: '八爪武師', nameEn: 'Grapploct', types: ['Fighting'], hp: 80, atk: 118, def: 90, spa: 70, spd: 80, spe: 42, abilityZh: '柔軟', abilityDesc: '章魚絞殺封鎖換人。' },
  { id: 'polteageist', num: 855, nameZh: '怖思壺', nameEn: 'Polteageist', types: ['Ghost'], hp: 60, atk: 65, def: 65, spa: 134, spd: 114, spe: 70, abilityZh: '碎裂鎧甲', abilityDesc: '破殼後極速暗影球清屏。' },
  { id: 'hatterene', num: 858, nameZh: '布莉姆溫', nameEn: 'Hatterene', types: ['Psychic', 'Fairy'], hp: 57, atk: 90, def: 95, spa: 136, spd: 103, spe: 29, abilityZh: '魔法鏡', abilityDesc: '魔法鏡反彈挑釁，超妖空間重砲。' },
  { id: 'grimmsnarl', num: 861, nameZh: '長毛巨魔', nameEn: 'Grimmsnarl', types: ['Dark', 'Fairy'], hp: 95, atk: 120, def: 65, spa: 95, spd: 75, spe: 60, abilityZh: '惡作劇之心', abilityDesc: '先制光牆、反射壁、電磁波、靈魂衝擊。' },
  { id: 'perrserker', num: 863, nameZh: '喵頭目', nameEn: 'Perrserker', types: ['Steel'], hp: 70, atk: 110, def: 100, spa: 50, spd: 60, spe: 50, abilityZh: '鋼之意志', abilityDesc: '我方全隊鋼屬性招式威力提升 50%！' },
  { id: 'sirfetchd', num: 865, nameZh: '蔥遊兵', nameEn: 'Sirfetch’d', types: ['Fighting'], hp: 62, atk: 135, def: 95, spa: 68, spd: 82, spe: 65, abilityZh: '膽量', abilityDesc: '大蔥 100% 暴擊近身戰流星突擊。' },
  { id: 'mr_rime', num: 866, nameZh: '踏冰人偶', nameEn: 'Mr. Rime', types: ['Ice', 'Psychic'], hp: 80, atk: 85, def: 75, spa: 110, spd: 100, spe: 70, abilityZh: '除障', abilityDesc: '清除對手雙牆。' },
  { id: 'runerigus', num: 867, nameZh: '死神板', nameEn: 'Runerigus', types: ['Ground', 'Ghost'], hp: 58, atk: 95, def: 145, spa: 50, spd: 105, spe: 30, abilityZh: '遊魂', abilityDesc: '接觸時交換特性。' },
  { id: 'alcremie', num: 869, nameZh: '霜奶仙', nameEn: 'Alcremie', types: ['Fairy'], hp: 65, atk: 60, def: 75, spa: 110, spd: 121, spe: 64, abilityZh: '芳香幕', abilityDesc: '裝飾提升隊友雙攻各 2 級！' },
  { id: 'falinks', num: 870, nameZh: '列陣兵', nameEn: 'Falinks', types: ['Fighting'], hp: 65, atk: 100, def: 100, spa: 70, spd: 60, spe: 75, abilityZh: '戰鬥盔甲', abilityDesc: '背水一戰全能力提升 1 級。' },
  { id: 'mega_falinks', num: 870, nameZh: '超級列陣兵', nameEn: 'Mega Falinks', types: ['Fighting'], isMega: true, hp: 65, atk: 130, def: 130, spa: 70, spd: 90, spe: 85, abilityZh: '軍陣突破', abilityDesc: '全軍衝鋒強化。' },
  { id: 'pincurchin', num: 871, nameZh: '啪嚓海膽', nameEn: 'Pincurchin', types: ['Electric'], hp: 48, atk: 101, def: 95, spa: 91, spd: 85, spe: 15, abilityZh: '電氣製造者', abilityDesc: '布下電氣場地啟動夸克充能。' },
  { id: 'indeedee_m', num: 876, nameZh: '愛管侍 (雄性的樣子)', nameEn: 'Indeedee (Male)', types: ['Psychic', 'Normal'], hp: 60, atk: 65, def: 55, spa: 105, spd: 95, spe: 95, abilityZh: '精神製造者', abilityDesc: '廣域戰力特攻輸出。' },
  { id: 'indeedee_f', num: 876, nameZh: '愛管侍 (雌性的樣子)', nameEn: 'Indeedee (Female)', types: ['Psychic', 'Normal'], hp: 70, atk: 55, def: 65, spa: 95, spd: 105, spe: 85, abilityZh: '精神製造者', abilityDesc: '看我嘛、精神場地封鎖先制神技。' },
  { id: 'morpeko', num: 877, nameZh: '莫魯貝可', nameEn: 'Morpeko', types: ['Electric', 'Dark'], hp: 58, atk: 95, def: 58, spa: 70, spd: 58, spe: 97, abilityZh: '飽腹手', abilityDesc: '氣場輪電惡輪流轉換。' },
  { id: 'dragapult', num: 887, nameZh: '多龍巴魯托', nameEn: 'Dragapult', types: ['Dragon', 'Ghost'], hp: 88, atk: 120, def: 75, spa: 100, spd: 75, spe: 142, abilityZh: '恆淨之軀', abilityDesc: '142 超速龍之箭雙發。' },
  { id: 'zacian', num: 888, nameZh: '蒼響 (劍之王)', nameEn: 'Zacian-Crowned', types: ['Fairy', 'Steel'], hp: 92, atk: 150, def: 115, spa: 80, spd: 115, spe: 138, abilityZh: '不撓之劍', abilityDesc: '登場物攻立即提升 1 級，巨獸斬秒殺。' },
  { id: 'urshifu_rapid', num: 892, nameZh: '武道熊師 (連擊流)', nameEn: 'Urshifu-Rapid-Strike', types: ['Fighting', 'Water'], hp: 100, atk: 130, def: 100, spa: 63, spd: 60, spe: 97, abilityZh: '無形拳', abilityDesc: '穿透守住，水流連打必定暴擊。' },
  { id: 'urshifu_single', num: 892, nameZh: '武道熊師 (一擊流)', nameEn: 'Urshifu-Single-Strike', types: ['Fighting', 'Dark'], hp: 100, atk: 130, def: 100, spa: 63, spd: 60, spe: 97, abilityZh: '無形拳', abilityDesc: '穿透守住，暗冥強擊 100% 暴擊。' },
  { id: 'wyrdeer', num: 899, nameZh: '詭角鹿', nameEn: 'Wyrdeer', types: ['Normal', 'Psychic'], hp: 103, atk: 105, def: 72, spa: 105, spd: 75, spe: 65, abilityZh: '威嚇', abilityDesc: '屏障猛攻雙防提升。' },
  { id: 'kleavor', num: 900, nameZh: '劈斧螳螂', nameEn: 'Kleavor', types: ['Bug', 'Rock'], hp: 70, atk: 135, def: 95, spa: 45, spd: 70, spe: 85, abilityZh: '鋒銳', abilityDesc: '岩斧命中在對手場地自動撒下隱形岩！' },
  { id: 'basculegion_m', num: 902, nameZh: '幽尾玄魚 (雄性的樣子)', nameEn: 'Basculegion (Male)', types: ['Water', 'Ghost'], hp: 120, atk: 112, def: 65, spa: 80, spd: 75, spe: 78, abilityZh: '適應力', abilityDesc: '掃墓殘局威力高達 300+！' },
  { id: 'basculegion_f', num: 902, nameZh: '幽尾玄魚 (雌性的樣子)', nameEn: 'Basculegion (Female)', types: ['Water', 'Ghost'], hp: 120, atk: 92, def: 65, spa: 100, spd: 75, spe: 78, abilityZh: '適應力', abilityDesc: '水本系濁流與暗影球。' },
  { id: 'sneasler', num: 903, nameZh: '大狃拉', nameEn: 'Sneasler', types: ['Fighting', 'Poison'], hp: 80, atk: 130, def: 60, spa: 40, spd: 80, spe: 120, abilityZh: '輕裝', abilityDesc: '電氣種子觸發 240 極速，劇毒爪致命收割。' },
  { id: 'overqwil', num: 904, nameZh: '萬針魚', nameEn: 'Overqwil', types: ['Dark', 'Poison'], hp: 85, atk: 115, def: 95, spa: 65, spd: 65, spe: 85, abilityZh: '威嚇', abilityDesc: '惡毒優異抗性，僅弱地面。' },

  // Gen 9
  { id: 'meowscarada', num: 908, nameZh: '魔幻假面喵', nameEn: 'Meowscarada', types: ['Grass', 'Dark'], hp: 76, atk: 110, def: 70, spa: 81, spd: 70, spe: 123, abilityZh: '變幻自如', abilityDesc: '千變萬花必定暴擊必中神技！' },
  { id: 'skeledirge', num: 911, nameZh: '骨紋巨聲鱷', nameEn: 'Skeledirge', types: ['Fire', 'Ghost'], hp: 104, atk: 75, def: 100, spa: 110, spd: 75, spe: 66, abilityZh: '純樸', abilityDesc: '無視對手任何能力強化，閃焰高歌越唱特攻越高！' },
  { id: 'quaquaval', num: 914, nameZh: '狂歡浪舞鴨', nameEn: 'Quaquaval', types: ['Water', 'Fighting'], hp: 85, atk: 120, def: 80, spa: 85, spd: 75, spe: 85, abilityZh: '自信過度', abilityDesc: '流水旋舞攻擊同時加速 1 級。' },
  { id: 'pawmot', num: 923, nameZh: '巴布土撥', nameEn: 'Pawmot', types: ['Electric', 'Fighting'], hp: 70, atk: 115, def: 70, spa: 70, spd: 60, spe: 105, abilityZh: '自然回復', abilityDesc: '全遊戲唯一「復合祈願」令瀕死隊友滿血復活！' },
  { id: 'maushold', num: 925, nameZh: '一家鼠', nameEn: 'Maushold', types: ['Normal'], hp: 74, atk: 75, def: 70, spa: 65, spd: 75, spe: 111, abilityZh: '友情防守', abilityDesc: '鼠數 10 連擊秒殺，看我嘛掩護隊友。' },
  { id: 'arboliva', num: 930, nameZh: '奧利瓦', nameEn: 'Arboliva', types: ['Grass', 'Normal'], hp: 78, atk: 69, def: 90, spa: 125, spd: 109, spe: 39, abilityZh: '掉落種子', abilityDesc: '挨打鋪展青草場地。' },
  { id: 'squawkabilly', num: 931, nameZh: '怒鸚哥', nameEn: 'Squawkabilly', types: ['Normal', 'Flying'], hp: 82, atk: 96, def: 51, spa: 45, spd: 51, spe: 92, abilityZh: '威嚇', abilityDesc: '首發威嚇順風手。' },
  { id: 'garganacl', num: 934, nameZh: '鹽石巨靈', nameEn: 'Garganacl', types: ['Rock'], hp: 100, atk: 100, def: 130, spa: 45, spd: 90, spe: 35, abilityZh: '潔淨之鹽', abilityDesc: '免疫異常且幽靈傷害減半，鹽醃折磨神技。' },
  { id: 'armarouge', num: 936, nameZh: '紅蓮鎧騎', nameEn: 'Armarouge', types: ['Fire', 'Psychic'], hp: 85, atk: 60, def: 100, spa: 125, spd: 80, spe: 75, abilityZh: '引火', abilityDesc: '精神場地下廣域戰力極限爆發。' },
  { id: 'ceruledge', num: 937, nameZh: '蒼炎刃鬼', nameEn: 'Ceruledge', types: ['Fire', 'Ghost'], hp: 75, atk: 125, def: 80, spa: 60, spd: 100, spe: 85, abilityZh: '引火', abilityDesc: '悔念劍高傷並吸血 50%。' },
  { id: 'bellibolt', num: 939, nameZh: '電肚蛙', nameEn: 'Bellibolt', types: ['Electric'], hp: 109, atk: 64, def: 91, spa: 103, spd: 83, spe: 45, abilityZh: '電力轉換', abilityDesc: '受到攻擊充電，下發電技能威力翻倍！' },
  { id: 'mabosstiff', num: 943, nameZh: '獒教父', nameEn: 'Mabosstiff', types: ['Dark'], hp: 80, atk: 120, def: 90, spa: 60, spd: 70, spe: 85, abilityZh: '威嚇', abilityDesc: '威嚇咬碎先制突襲。' },
  { id: 'scovillain', num: 952, nameZh: '狠辣椒', nameEn: 'Scovillain', types: ['Grass', 'Fire'], hp: 65, atk: 108, def: 65, spa: 108, spd: 65, spe: 75, abilityZh: '葉綠素', abilityDesc: '晴天草火雙系速攻手。' },
  { id: 'mega_scovillain', num: 952, nameZh: '超級狠辣椒', nameEn: 'Mega Scovillain', types: ['Grass', 'Fire'], isMega: true, hp: 65, atk: 138, def: 85, spa: 138, spd: 85, spe: 95, abilityZh: '熾熱辛香', abilityDesc: '晴天烈火極限爆破。' },
  { id: 'espathra', num: 956, nameZh: '超能豔鴕', nameEn: 'Espathra', types: ['Psychic'], hp: 95, atk: 60, def: 60, spa: 101, spd: 60, spe: 102, abilityZh: '加速', abilityDesc: '每回合自動加速，琉光衝激降特防。' },
  { id: 'tinkaton', num: 959, nameZh: '巨鍛匠', nameEn: 'Tinkaton', types: ['Fairy', 'Steel'], hp: 85, atk: 75, def: 77, spa: 70, spd: 105, spe: 94, abilityZh: '破格', abilityDesc: '巨力錘 160 威力鋼系極限大錘！' },
  { id: 'palafin', num: 964, nameZh: '海豚俠', nameEn: 'Palafin', types: ['Water'], hp: 100, atk: 70, def: 72, spa: 53, spd: 62, spe: 100, abilityZh: '全能變身', abilityDesc: '換人退場後變身為全能英雄！' },
  { id: 'palafin_hero', num: 964, nameZh: '海豚俠（全能型態）', nameEn: 'Palafin (Hero Form)', types: ['Water'], hp: 100, atk: 160, def: 97, spa: 106, spd: 87, spe: 100, abilityZh: '全能變身', abilityDesc: '160 超神物攻，噴射拳先制秒殺！' },
  { id: 'orthworm', num: 968, nameZh: '拖拖蚓', nameEn: 'Orthworm', types: ['Steel'], hp: 70, atk: 85, def: 145, spa: 60, spd: 55, spe: 65, abilityZh: '食土', abilityDesc: '完全吸收地面招式回血，斷尾替身保排。' },
  { id: 'glimmora', num: 970, nameZh: '晶光花', nameEn: 'Glimmora', types: ['Rock', 'Poison'], hp: 83, atk: 55, def: 90, spa: 130, spd: 81, spe: 86, abilityZh: '毒滿地', abilityDesc: '受到物理攻擊時在對手場地自動撒毒菱！' },
  { id: 'mega_glimmora', num: 970, nameZh: '超級晶光花', nameEn: 'Mega Glimmora', types: ['Rock', 'Poison'], isMega: true, hp: 83, atk: 65, def: 110, spa: 165, spd: 101, spe: 106, abilityZh: '晶毒爆發', abilityDesc: '高特攻岩毒雙系轟炸。' },
  { id: 'houndstone', num: 972, nameZh: '墓揚犬', nameEn: 'Houndstone', types: ['Ghost'], hp: 72, atk: 101, def: 100, spa: 50, spd: 97, spe: 68, abilityZh: '撥沙', abilityDesc: '掃墓大招隊友倒下越多威力越恐怖！' },
  { id: 'annihilape', num: 979, nameZh: '棄世猴', nameEn: 'Annihilape', types: ['Fighting', 'Ghost'], hp: 110, atk: 115, def: 80, spa: 50, spd: 90, spe: 90, abilityZh: '不服輸', abilityDesc: '憤怒之拳每挨打一次威力永久提升 50 點（最高 350）！' },
  { id: 'farigiraf', num: 981, nameZh: '奇麒麟', nameEn: 'Farigiraf', types: ['Normal', 'Psychic'], hp: 120, atk: 90, def: 70, spa: 110, spd: 70, spe: 60, abilityZh: '尾甲', abilityDesc: '完全封鎖對手所有先制招式（神速、擊掌奇襲無效）！' },
  { id: 'kingambit', num: 983, nameZh: '仆斬將軍', nameEn: 'Kingambit', types: ['Dark', 'Steel'], hp: 100, atk: 135, def: 120, spa: 60, spd: 85, spe: 50, abilityZh: '大將', abilityDesc: '隊友倒下越多傷害越高，僕刀突襲殘局之王。' },
  { id: 'flutter_mane', num: 987, nameZh: '振翼髮', nameEn: 'Flutter Mane', types: ['Ghost', 'Fairy'], hp: 55, atk: 55, def: 55, spa: 135, spd: 135, spe: 135, abilityZh: '古代活性', abilityDesc: '驅勁能量 135 極速超車全場，魔法閃耀群秒。' },
  { id: 'iron_bundle', num: 991, nameZh: '鐵包袱', nameEn: 'Iron Bundle', types: ['Ice', 'Water'], hp: 56, atk: 80, def: 114, spa: 124, spd: 60, spe: 136, abilityZh: '夸克充能', abilityDesc: '136 極速冷凍乾燥與水砲控速。' },
  { id: 'iron_hands', num: 992, nameZh: '鐵臂膀', nameEn: 'Iron Hands', types: ['Fighting', 'Electric'], hp: 154, atk: 140, def: 108, spa: 50, spd: 68, spe: 50, abilityZh: '夸克充能', abilityDesc: '擊掌奇襲、吸取拳與瘋狂伏特重裝坦克。' },
  { id: 'baxcalibur', num: 998, nameZh: '戟脊龍', nameEn: 'Baxcalibur', types: ['Dragon', 'Ice'], hp: 115, atk: 145, def: 92, spa: 75, spd: 86, spe: 87, abilityZh: '熱交換', abilityDesc: '受火招攻擊不傷反加物攻，巨劍突擊必殺。' },
  { id: 'mega_baxcalibur', num: 998, nameZh: '超級戟脊龍', nameEn: 'Mega Baxcalibur', types: ['Dragon', 'Ice'], isMega: true, hp: 115, atk: 175, def: 112, spa: 85, spd: 106, spe: 107, abilityZh: '極寒冰甲', abilityDesc: '175 毀滅物攻，冰龍雙本極限爆發。' },
  { id: 'gholdengo', num: 1000, nameZh: '賽富豪', nameEn: 'Gholdengo', types: ['Steel', 'Ghost'], hp: 87, atk: 60, def: 95, spa: 133, spd: 91, spe: 84, abilityZh: '黃金之軀', abilityDesc: '完全免疫一切變化招式，淘金潮群體蒸發！' },
  { id: 'chien_pao', num: 1002, nameZh: '古劍豹', nameEn: 'Chien-Pao', types: ['Dark', 'Ice'], hp: 80, atk: 120, def: 80, spa: 90, spd: 65, spe: 135, abilityZh: '災禍之劍', abilityDesc: '降低全場 25% 物防，物理隊外掛發動機。' },
  { id: 'ting_lu', num: 1003, nameZh: '古鼎鹿', nameEn: 'Ting-Lu', types: ['Dark', 'Ground'], hp: 155, atk: 110, def: 125, spa: 55, spd: 80, spe: 45, abilityZh: '災禍之鼎', abilityDesc: '降低全場 25% 特攻，155 巨血大盾。' },
  { id: 'chi_yu', num: 1004, nameZh: '古玉魚', nameEn: 'Chi-Yu', types: ['Dark', 'Fire'], hp: 55, atk: 80, def: 80, spa: 135, spd: 120, spe: 100, abilityZh: '災禍之玉', abilityDesc: '降低全場 25% 特防，熱風一發融化對手。' },
  { id: 'koraidon', num: 1007, nameZh: '故勒頓', nameEn: 'Koraidon', types: ['Fighting', 'Dragon'], hp: 100, atk: 135, def: 115, spa: 85, spd: 100, spe: 135, abilityZh: '緋紅脈動', abilityDesc: '晴天物攻加成 33.3%，全開猛撞無敵破防。' },
  { id: 'miraidon', num: 1008, nameZh: '密勒頓', nameEn: 'Miraidon', types: ['Electric', 'Dragon'], hp: 100, atk: 85, def: 100, spa: 135, spd: 115, spe: 135, abilityZh: '強子引擎', abilityDesc: '電場特攻加成 33.3%，閃電驅馳秒殺一切。' },
  { id: 'sinistcha', num: 1013, nameZh: '來悲粗茶', nameEn: 'Sinistcha', types: ['Grass', 'Ghost'], hp: 71, atk: 60, def: 106, spa: 121, spd: 80, spe: 70, abilityZh: '款待', abilityDesc: '登場立即為隊友回復 1/4 最大 HP！' },
  { id: 'ogerpon_water', num: 1017, nameZh: '厄鬼椪 (水井面具)', nameEn: 'Ogerpon-Wellspring', types: ['Grass', 'Water'], hp: 80, atk: 120, def: 84, spa: 60, spd: 96, spe: 110, abilityZh: '儲水', abilityDesc: '免疫水招回血，看我嘛吸收仇恨保護全隊。' },
  { id: 'archaludon', num: 1018, nameZh: '鋁鋼橋龍', nameEn: 'Archaludon', types: ['Steel', 'Dragon'], hp: 90, atk: 105, def: 130, spa: 125, spd: 65, spe: 85, abilityZh: '持久力', abilityDesc: '雨天電擊白刃無蓄力瞬發，受傷即升防禦！' },
  { id: 'hydrapple', num: 1019, nameZh: '蜜集大蛇', nameEn: 'Hydrapple', types: ['Grass', 'Dragon'], hp: 106, atk: 80, def: 110, spa: 120, spd: 80, spe: 44, abilityZh: '甘甜之蜜', abilityDesc: '登場降低對手全體迴避率，大波蜜汁雷射！' },
  { id: 'mewtwo', num: 150, nameZh: '超夢', nameEn: 'Mewtwo', types: ['Psychic'], hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130, abilityZh: '壓迫感', abilityDesc: '154 毀滅特攻，精神擊破無視特防打穿幸福蛋！' },
];

// Helper to determine type-based competitive moves
function generateChampionMoves(types: PokemonType[], atk: number, spa: number, isMega: boolean): ChampionMove[] {
  const isPhysical = atk >= spa;
  const primaryType = types[0];
  const secondaryType = types[1];

  const moves: ChampionMove[] = [];

  // Move 1: STAB primary
  if (primaryType === 'Fire') {
    moves.push(isPhysical
      ? { nameZh: '閃焰衝鋒', nameEn: 'Flare Blitz', type: 'Fire', category: 'Physical', power: 120, accuracy: 100, description: '火屬性高威力本系爆發。', tacticalTip: '一擊擊倒鋼草冰系。' }
      : { nameZh: '熱風', nameEn: 'Heat Wave', type: 'Fire', category: 'Special', power: 95, accuracy: 90, description: '雙打群體火焰旋風。', tacticalTip: '雙打 AOE 壓低全場血線。' });
  } else if (primaryType === 'Water') {
    moves.push(isPhysical
      ? { nameZh: '水流裂破', nameEn: 'Liquidation', type: 'Water', category: 'Physical', power: 85, accuracy: 100, description: '水本系重擊，20% 降防。', tacticalTip: '點殺地面與火系。' }
      : { nameZh: '水砲', nameEn: 'Hydro Pump', type: 'Water', category: 'Special', power: 110, accuracy: 80, description: '高威力水系特攻。', tacticalTip: '重創火系與岩石前排。' });
  } else if (primaryType === 'Grass') {
    moves.push(isPhysical
      ? { nameZh: '木槌', nameEn: 'Wood Hammer', type: 'Grass', category: 'Physical', power: 120, accuracy: 100, description: '草屬性極限高傷核彈。', tacticalTip: '秒殺水地水岩前排。' }
      : { nameZh: '終極吸取', nameEn: 'Giga Drain', type: 'Grass', category: 'Special', power: 75, accuracy: 100, description: '吸收對手 HP 回復自身。', tacticalTip: '維持健康血線。' });
  } else if (primaryType === 'Electric') {
    moves.push(isPhysical
      ? { nameZh: '瘋狂伏特', nameEn: 'Wild Charge', type: 'Electric', category: 'Physical', power: 90, accuracy: 100, description: '電本系物攻衝擊。', tacticalTip: '擊落飛行與水系。' }
      : { nameZh: '十萬伏特', nameEn: 'Thunderbolt', type: 'Electric', category: 'Special', power: 90, accuracy: 100, description: '高穩定電系特攻。', tacticalTip: '高傷擊退水系對位。' });
  } else if (primaryType === 'Dragon') {
    moves.push(isPhysical
      ? { nameZh: '龍爪', nameEn: 'Dragon Claw', type: 'Dragon', category: 'Physical', power: 80, accuracy: 100, description: '本系穩定打擊。', tacticalTip: '壓制龍系同類。' }
      : { nameZh: '流星群', nameEn: 'Draco Meteor', type: 'Dragon', category: 'Special', power: 130, accuracy: 90, description: '龍本系 130 毀滅大招。', tacticalTip: '爆發秒殺無抗性對手。' });
  } else if (primaryType === 'Steel') {
    moves.push(isPhysical
      ? { nameZh: '鐵頭', nameEn: 'Iron Head', type: 'Steel', category: 'Physical', power: 80, accuracy: 100, description: '鋼本系重擊，30% 畏縮。', tacticalTip: '處決妖精與岩石系。' }
      : { nameZh: '加農光炮', nameEn: 'Flash Cannon', type: 'Steel', category: 'Special', power: 80, accuracy: 100, description: '鋼本系法術重擊。', tacticalTip: '貫穿妖精防線。' });
  } else if (primaryType === 'Ghost') {
    moves.push(isPhysical
      ? { nameZh: '暗影爪', nameEn: 'Shadow Claw', type: 'Ghost', category: 'Physical', power: 70, accuracy: 100, description: '幽靈物理斬擊。', tacticalTip: '容易擊中要害。' }
      : { nameZh: '暗影球', nameEn: 'Shadow Ball', type: 'Ghost', category: 'Special', power: 80, accuracy: 100, description: '幽靈本系單體重擊。', tacticalTip: '降特防貫穿超能幽靈。' });
  } else if (primaryType === 'Fairy') {
    moves.push(isPhysical
      ? { nameZh: '嬉鬧', nameEn: 'Play Rough', type: 'Fairy', category: 'Physical', power: 90, accuracy: 90, description: '妖精本系物攻。', tacticalTip: '雙倍擊倒惡系與龍系。' }
      : { nameZh: '魔法閃耀', nameEn: 'Dazzling Gleam', type: 'Fairy', category: 'Special', power: 80, accuracy: 100, description: '妖精雙打群體 AOE。', tacticalTip: '同時融化敵方兩名對手。' });
  } else if (primaryType === 'Fighting') {
    moves.push({ nameZh: '近身戰', nameEn: 'Close Combat', type: 'Fighting', category: 'Physical', power: 120, accuracy: 100, description: '格鬥 120 爆發大招。', tacticalTip: '處決鋼系、惡系與岩石系。' });
  } else {
    moves.push(isPhysical
      ? { nameZh: '終極衝擊 / 報恩', nameEn: 'Body Slam', type: 'Normal', category: 'Physical', power: 85, accuracy: 100, description: '一般屬性高威力重壓。', tacticalTip: '附帶麻痺控場。' }
      : { nameZh: '破壞光線 / 巨聲', nameEn: 'Hyper Voice', type: 'Normal', category: 'Special', power: 90, accuracy: 100, description: '穿透替身法術攻擊。', tacticalTip: '穩定覆蓋全場。' });
  }

  // Move 2: Secondary STAB or High Coverage
  if (secondaryType) {
    if (secondaryType === 'Flying') {
      moves.push({ nameZh: '勇鳥猛攻', nameEn: 'Brave Bird', type: 'Flying', category: 'Physical', power: 120, accuracy: 100, description: '飛行 120 物理爆發。', tacticalTip: '秒殺格鬥草系。' });
    } else if (secondaryType === 'Poison') {
      moves.push({ nameZh: '污泥炸彈', nameEn: 'Sludge Bomb', type: 'Poison', category: 'Special', power: 90, accuracy: 100, description: '毒本系特攻，30% 中毒。', tacticalTip: '點殺妖精系核心。' });
    } else if (secondaryType === 'Dark') {
      moves.push({ nameZh: '突襲', nameEn: 'Sucker Punch', type: 'Dark', category: 'Physical', power: 70, accuracy: 100, description: '先制 +1 惡屬性暗殺。', tacticalTip: '搶先手斬殺殘血。' });
    } else if (secondaryType === 'Ground') {
      moves.push({ nameZh: '地震', nameEn: 'Earthquake', type: 'Ground', category: 'Physical', power: 100, accuracy: 100, description: '地面範圍重擊。', tacticalTip: '貫穿鋼系與火系。' });
    } else if (secondaryType === 'Ice') {
      moves.push({ nameZh: '冰旋', nameEn: 'Ice Spinner', type: 'Ice', category: 'Physical', power: 80, accuracy: 100, description: '冰系清場神技。', tacticalTip: '清除場地破壞地龍快龍。' });
    } else if (secondaryType === 'Psychic') {
      moves.push({ nameZh: '精神強念', nameEn: 'Psychic', type: 'Psychic', category: 'Special', power: 90, accuracy: 100, description: '超能力本系大招。', tacticalTip: '打擊毒系格鬥系。' });
    } else {
      moves.push({ nameZh: '太晶爆發', nameEn: 'Tera Blast', type: secondaryType, category: isPhysical ? 'Physical' : 'Special', power: 80, accuracy: 100, description: '轉化太晶屬性轟擊。', tacticalTip: '補足打擊盲點。' });
    }
  } else {
    // Coverage move
    moves.push(isPhysical
      ? { nameZh: '地震', nameEn: 'Earthquake', type: 'Ground', category: 'Physical', power: 100, accuracy: 100, description: '全場高威力地面覆蓋。', tacticalTip: '打擊鋼系火系。' }
      : { nameZh: '大地之力', nameEn: 'Earth Power', type: 'Ground', category: 'Special', power: 90, accuracy: 100, description: '地面特攻破防。', tacticalTip: '處決鋼系火系。' });
  }

  // Move 3: Utility / High Tech / Priority
  if (isPhysical) {
    moves.push({ nameZh: '急速折返 / 拍落', nameEn: 'Knock Off', type: 'Dark', category: 'Physical', power: 65, accuracy: 100, description: '拍落對手攜帶的道具。', tacticalTip: '徹底瓦解敵方戰術配置。' });
  } else {
    moves.push({ nameZh: '伏特替換 / 冰凍之風', nameEn: 'Volt Switch', type: 'Electric', category: 'Special', power: 70, accuracy: 100, description: '攻擊後換人退場。', tacticalTip: '維持場地主動權與控速。' });
  }

  // Move 4: Protect (守住 - 雙打必備)
  moves.push({
    nameZh: '守住',
    nameEn: 'Protect',
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    description: '完全抵擋當回合所有攻擊。',
    tacticalTip: '雙打環境規避集火與擊掌奇襲的絕對神技。',
  });

  return moves;
}

// Convert RAW_ROSTER into full competitive Champion Pokémon models
export const POKEMON_LIST: Pokemon[] = RAW_ROSTER.map((raw) => {
  const hp = raw.hp || 80;
  const attack = raw.atk || 100;
  const defense = raw.def || 80;
  const spAttack = raw.spa || 100;
  const spDefense = raw.spd || 80;
  const speed = raw.spe || 85;
  const total = hp + attack + defense + spAttack + spDefense + speed;

  const isPhysical = attack >= spAttack;
  const isMega = raw.isMega || false;

  // Determine Tier
  let tier: ChampionsTier = raw.tier || 'A+ (主力對策)';
  if (['incineroar', 'flutter_mane', 'zacian', 'dragonite', 'chien_pao', 'gholdengo', 'urshifu_rapid', 'urshifu_single', 'amoonguss', 'koraidon', 'miraidon', 'mewtwo'].includes(raw.id)) {
    tier = 'S+ (賽事超一線)';
  } else if (isMega || ['landorus_t', 'rillaboom', 'kingambit', 'iron_hands', 'iron_bundle', 'ogerpon_water', 'chi_yu', 'annihilape', 'archaludon'].includes(raw.id)) {
    tier = 'S (強勢核心)';
  }

  // Compute 18-type relations
  const { weaknesses, resistances, immunities } = calculateTypeRelations(raw.types);

  // Default Held Item
  let heldItem = CHAMPION_HELD_ITEMS.life_orb;
  if (isMega) {
    heldItem = {
      id: `${raw.id}_stone`,
      nameZh: '超級石 (Mega Stone)',
      nameEn: 'Mega Stone',
      effect: '攜帶後可在對戰中進行超級進化，各項能力暴增 100 點種族值！',
      tacticalRole: '超級進化啟動器。',
      iconColor: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  } else if (isPhysical) {
    if (speed >= 110) heldItem = CHAMPION_HELD_ITEMS.focus_sash;
    else if (defense >= 100 || hp >= 100) heldItem = CHAMPION_HELD_ITEMS.assault_vest;
    else heldItem = CHAMPION_HELD_ITEMS.clear_amulet;
  } else {
    if (speed >= 110) heldItem = CHAMPION_HELD_ITEMS.booster_energy;
    else heldItem = CHAMPION_HELD_ITEMS.choice_specs;
  }

  // Determine Recommended Tera Type (usually cover weakness or enhance STAB)
  let teraType: PokemonType = 'Water';
  if (weaknesses.includes('Ground') || weaknesses.includes('Water')) teraType = 'Grass';
  else if (weaknesses.includes('Fairy') || weaknesses.includes('Ice')) teraType = 'Steel';
  else if (weaknesses.includes('Fire')) teraType = 'Water';
  else if (raw.types.includes('Dragon')) teraType = 'Normal';
  else if (raw.types.includes('Fire')) teraType = 'Fire';
  else teraType = 'Steel';

  const moves = generateChampionMoves(raw.types, attack, spAttack, isMega);

  const primaryAbility = {
    nameZh: raw.abilityZh || (isMega ? '超級霸氣' : '特化競技特性'),
    nameEn: raw.abilityEn || 'Competitive Trait',
    description: raw.abilityDesc || '級別賽對戰核心特性。',
  };

  const build: CompetitiveBuild = {
    buildNameZh: isMega ? '超級進化極限爆發流' : 'WCS 錦標賽標準型',
    format: 'Double',
    ability: primaryAbility,
    heldItem,
    teraType,
    nature: isPhysical ? (speed >= 100 ? '爽朗 (+Speed, -SpA)' : '固執 (+Atk, -SpA)') : (speed >= 100 ? '膽小 (+Speed, -Atk)' : '內斂 (+SpA, -Atk)'),
    evSpread: isPhysical ? '4 HP / 252 Atk / 252 Spe' : '4 HP / 252 SpA / 252 Spe',
    moves,
    comboTactics: `首發站位利用【${primaryAbility.nameZh}】建立控場優勢，結合太晶【${teraType}】抵消天敵剋制，發動高威力招式突破對手核心。`,
    recommendedPartners: ['熾焰咆哮虎 (Incineroar)', '振翼髮 (Flutter Mane)', '快龍 (Dragonite)'],
  };

  const baseStats = {
    hp,
    attack,
    defense,
    spAttack,
    spDefense,
    speed,
    total,
  };

  return {
    id: raw.id,
    pokedexNumber: raw.num,
    nameZh: raw.nameZh,
    nameEn: raw.nameEn,
    nameJa: raw.nameEn,
    types: raw.types as [PokemonType] | [PokemonType, PokemonType],
    tier,
    avatarUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${raw.num}.png`,
    officialArtUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.num}.png`,
    baseStats,
    primaryAbility,
    builds: [build],
    weaknesses,
    resistances,
    immunities,
    winRate: Math.round((50.0 + (total - 500) * 0.04 + (isMega ? 3.0 : 0)) * 10) / 10,
    usageRate: Math.round(Math.max(12.0, Math.min(49.5, (total / 14.0))) * 10) / 10,
    goodAgainst: [],
    counteredBy: [],
    counterAdvice: {},
  };
});
