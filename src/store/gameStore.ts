import { create } from 'zustand'
import { submitScore } from '../lib/rankingService'
import { STAGE_COUNTRY_MAP, STAGE_PREFECTURE_MAP } from '../data/prefectures'

export type GamePhase = 'title' | 'category' | 'question' | 'input' | 'reveal' | 'result' | 'ranking' | 'collection'
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert'
export type GameCategory = 'fuji' | 'landmark' | 'daily' | 'illusion' | 'visual'
export type IllusionType = 'perspective' | 'atmospheric' | 'texture' | 'occlusion' | 'size' | 'shadow' | 'vertical'
export type VisualIllusionType = 'mullerLyer' | 'ebbinghaus' | 'ponzo' | 'jastrow' | 'verticalHorizontal' | 'delboeuf' | 'sander' | 'baldwin'

export interface StageData {
  id: string
  image: string
  question: string
  targetPosition: { x: number; y: number }
  correctDistance: number
  correctHeight?: number
  hint?: string
  collectionName: string
  difficulty: Difficulty
  landmark?: string
  category: GameCategory
  scenarioId?: string // For precision training 3D scenarios
  illusionType?: IllusionType
  showRuler?: boolean // Show distance ruler (poles + labels) for practice stages
  country?: string
  prefecture?: string | null
  illusionPairDistance?: number   // Scene B distance for comparison mode
  illusionPairType?: IllusionType // Scene B illusion type
  correctChoice?: 'A' | 'B' | 'same' // Which scene has the closer red building / correct answer
  visualIllusionType?: VisualIllusionType
  visualExplanation?: string
  visualParams?: { sizeA: number; sizeB: number; illusionStrength: number; seed: number; illusionFavors: 'A' | 'B' }
}

export interface GameResult {
  guessedDistance: number
  guessedHeight?: number
  correctDistance: number
  correctHeight?: number
  distanceError: number
  heightError?: number
  score: number
  title: string
  titleEmoji: string
}

interface GameState {
  phase: GamePhase
  currentCategory: GameCategory | null
  currentStage: StageData | null
  currentStageNumber: number
  stageCount: number
  guessedDistance: number
  guessedHeight: number
  illusionChoice: 'A' | 'B' | 'same' | null
  result: GameResult | null
  totalScore: number
  knownLandmarks: Set<string>
  playerName: string
  playedStages: Record<string, number>

  setPhase: (phase: GamePhase) => void
  setCategory: (category: GameCategory) => void
  setStage: (stage: StageData) => void
  setGuessedDistance: (distance: number) => void
  setGuessedHeight: (height: number) => void
  setIllusionChoice: (choice: 'A' | 'B' | 'same') => void
  setPlayerName: (name: string) => void
  submitAnswer: () => void
  nextStage: () => void
  previousStage: () => void
  skipStage: () => void
  resetGame: () => void
  isHeightKnown: () => boolean
}

// ============================================
// カテゴリー1: 富士山（長距離）
// Wikimedia Commons 画像を使用（撮影地点が特定可能）
// ============================================
const FUJI_STAGES: StageData[] = [
  {
    id: 'fuji-oshino',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Kagamiike_Pond%2C_Oshino_Hakkai.JPG/1280px-Kagamiike_Pond%2C_Oshino_Hakkai.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.2 },
    correctDistance: 14600,
    hint: '富士山の高さは3,776m。忍野八海・水車小屋から撮影',
    collectionName: '富士山（忍野八海）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-tanuki',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/070127_tanuki-fuji.jpg/1280px-070127_tanuki-fuji.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.6, y: 0.35 },
    correctDistance: 15200,
    hint: '富士山の高さは3,776m。田貫湖から撮影。ダブルダイヤモンド富士の聖地',
    collectionName: '富士山（田貫湖）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-chureito',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Chureito_Pagoda_and_Mount_Fuji.jpg/1280px-Chureito_Pagoda_and_Mount_Fuji.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.28, y: 0.38 },
    correctDistance: 17000,
    hint: '富士山の高さは3,776m。新倉山浅間公園・忠霊塔（五重塔）から撮影',
    collectionName: '富士山（新倉山浅間公園）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-yamanaka',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Mount_Fuji_and_Lake_Yamanaka.JPG/1280px-Mount_Fuji_and_Lake_Yamanaka.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.25, y: 0.40 },
    correctDistance: 17500,
    hint: '富士山の高さは3,776m。山中湖パノラマ台から撮影',
    collectionName: '富士山（山中湖パノラマ台）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-motosu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lake_Motosu_break_of_day_purple_color.JPG/1280px-Lake_Motosu_break_of_day_purple_color.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.33 },
    correctDistance: 18100,
    hint: '富士山の高さは3,776m。本栖湖から撮影。千円札の構図',
    collectionName: '富士山（本栖湖）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-kawaguchi',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Lake_Kawaguchiko_Sakura_Mount_Fuji_3.JPG/1280px-Lake_Kawaguchiko_Sakura_Mount_Fuji_3.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 18200,
    hint: '富士山の高さは3,776m。河口湖・大石公園から撮影',
    collectionName: '富士山（河口湖）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-shoji',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Mount_Fuji_from_Lake_Sh%C5%8Dji.JPG/1280px-Mount_Fuji_from_Lake_Sh%C5%8Dji.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.55, y: 0.15 },
    correctDistance: 18200,
    hint: '富士山の高さは3,776m。精進湖から撮影。子抱き富士',
    collectionName: '富士山（精進湖）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-gotemba',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Michinoeki_Subashiri_and_Mount_Fuji.JPG/1280px-Michinoeki_Subashiri_and_Mount_Fuji.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 21800,
    hint: '富士山の高さは3,776m。御殿場市内から撮影',
    collectionName: '富士山（御殿場）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-otome',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/LakeAshi_and_MtFuji_Hakone.JPG/1280px-LakeAshi_and_MtFuji_Hakone.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.35, y: 0.2 },
    correctDistance: 25500,
    hint: '富士山の高さは3,776m。箱根・乙女峠から撮影。富士見三峠の一つ',
    collectionName: '富士山（乙女峠）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-satta',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Mount_Fuji_and_Ashitaka_Mountains_from_Satta_Pass.JPG/1280px-Mount_Fuji_and_Ashitaka_Mountains_from_Satta_Pass.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.22, y: 0.12 },
    correctDistance: 37600,
    hint: '富士山の高さは3,776m。薩埵峠から撮影。浮世絵の構図',
    collectionName: '富士山（薩埵峠）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-miho',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Mt._Fuji_beyond_Miho_no_Matsubara_on_Shimizu_bay_ship.jpg/1280px-Mt._Fuji_beyond_Miho_no_Matsubara_on_Shimizu_bay_ship.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 44700,
    hint: '富士山の高さは3,776m。三保の松原から撮影。世界文化遺産',
    collectionName: '富士山（三保の松原）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-nihondaira',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Mount_Fuji_from_Nihondaira.JPG/1280px-Mount_Fuji_from_Nihondaira.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.45, y: 0.25 },
    correctDistance: 45000,
    hint: '富士山の高さは3,776m。日本平夢テラスから撮影',
    collectionName: '富士山（日本平）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-yokohama',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Mt._Fuji_from_Yokohama._-_Flickr_-_skyseeker.jpg/1280px-Mt._Fuji_from_Yokohama._-_Flickr_-_skyseeker.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.35, y: 0.28 },
    correctDistance: 84000,
    hint: '富士山の高さは3,776m。横浜・大さん橋から撮影',
    collectionName: '富士山（横浜）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-roppongi',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Fuji_tokyo.jpg/1280px-Fuji_tokyo.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.47, y: 0.08 },
    correctDistance: 96600,
    hint: '富士山の高さは3,776m。六本木ヒルズ展望台から撮影',
    collectionName: '富士山（六本木）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-takabotchi',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/View_from_Takabocchi_early_in_the_morning.jpg/1280px-View_from_Takabocchi_early_in_the_morning.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.52, y: 0.32 },
    correctDistance: 102500,
    hint: '富士山の高さは3,776m。長野県・高ボッチ高原から撮影。雲海の名所',
    collectionName: '富士山（高ボッチ高原）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-egawa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Mt._Fuji_and_Keiyo_petrochemical_complex.JPG/1280px-Mt._Fuji_and_Keiyo_petrochemical_complex.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.28, y: 0.32 },
    correctDistance: 108400,
    hint: '富士山の高さは3,776m。千葉県・江川海岸から撮影。東京湾越しの富士',
    collectionName: '富士山（江川海岸）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-ichikawa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/A_View_of_Mount_Fuji_from_Ichikawa.jpg/1280px-A_View_of_Mount_Fuji_from_Ichikawa.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.35, y: 0.45 },
    correctDistance: 114200,
    hint: '富士山の高さは3,776m。市川市アイリンクタウン展望施設から撮影',
    collectionName: '富士山（市川）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  // ========== 追加33問 (18〜50) ==========
  {
    id: 'fuji-susono',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Mount_Fuji_from_near_Susono_Sports_Park_-_Feb_28%2C_2015.jpg/1280px-Mount_Fuji_from_near_Susono_Sports_Park_-_Feb_28%2C_2015.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 8500,
    hint: '富士山の高さは3,776m。裾野市から撮影。富士山の裾野が広がる',
    collectionName: '富士山（裾野）',
    difficulty: 'normal',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-asagiri',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Mount_Fuji_from_Asagiri_Plateau.jpg/1280px-Mount_Fuji_from_Asagiri_Plateau.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 12000,
    hint: '富士山の高さは3,776m。朝霧高原から撮影。パラグライダーの名所',
    collectionName: '富士山（朝霧高原）',
    difficulty: 'normal',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-saiko',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Mt._Fuji_with_Saiko_pictured_from_Lake_Saiko_Nenma-hama.jpg/1280px-Mt._Fuji_with_Saiko_pictured_from_Lake_Saiko_Nenma-hama.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 16500,
    hint: '富士山の高さは3,776m。西湖・紅葉台から撮影',
    collectionName: '富士山（西湖）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-arakurayama',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Chuurei-tou_Fujiyoshida_17025277650_c59733d6ba_o.jpg/1280px-Chuurei-tou_Fujiyoshida_17025277650_c59733d6ba_o.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 16800,
    hint: '富士山の高さは3,776m。新倉山浅間公園の桜と五重塔',
    collectionName: '富士山（新倉山・桜）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-iyogatake',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Mount_Fuji_from_panoramadai.jpg/1280px-Mount_Fuji_from_panoramadai.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 20000,
    hint: '富士山の高さは3,776m。石割山から撮影。山中湖を見下ろす',
    collectionName: '富士山（石割山）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-numazu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Numazu_and_Mount_Fuji.jpg/1280px-Numazu_and_Mount_Fuji.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.25 },
    correctDistance: 32000,
    hint: '富士山の高さは3,776m。沼津市街から撮影。駿河湾越しの富士',
    collectionName: '富士山（沼津）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-hakone-ashinoko',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/LakeAshi_and_MtFuji_Hakone.JPG/1280px-LakeAshi_and_MtFuji_Hakone.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.25 },
    correctDistance: 28000,
    hint: '富士山の高さは3,776m。元箱根から芦ノ湖越しに撮影',
    collectionName: '富士山（芦ノ湖）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-shimizu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Mount_Fuji_and_Shimizu_port_20151116-2.jpg/1280px-Mount_Fuji_and_Shimizu_port_20151116-2.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 40000,
    hint: '富士山の高さは3,776m。清水港から撮影',
    collectionName: '富士山（清水港）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-daruma',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Mount_Fuji_from_Darumayama_Highland.jpg/1280px-Mount_Fuji_from_Darumayama_Highland.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 50000,
    hint: '富士山の高さは3,776m。だるま山高原レストハウスから撮影',
    collectionName: '富士山（だるま山高原）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-kamakura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mount_Fuji_from_Kamakura_-_Flickr_-_pom%27._%281%29.jpg/1280px-Mount_Fuji_from_Kamakura_-_Flickr_-_pom%27._%281%29.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.2 },
    correctDistance: 75000,
    hint: '富士山の高さは3,776m。鎌倉から撮影。相模湾越しの富士',
    collectionName: '富士山（鎌倉）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-tanzawa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mount_Fuji_%40_Trail_from_Mount_To_to_Mount_Tanzawa_%2811302218696%29.jpg/1280px-Mount_Fuji_%40_Trail_from_Mount_To_to_Mount_Tanzawa_%2811302218696%29.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 45000,
    hint: '富士山の高さは3,776m。丹沢山系から撮影',
    collectionName: '富士山（丹沢）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-kofu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Mount_Fujisan_from_Kofu_Castle.JPG/1280px-Mount_Fujisan_from_Kofu_Castle.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 55000,
    hint: '富士山の高さは3,776m。甲府盆地から撮影',
    collectionName: '富士山（甲府）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-fujiyoshida',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/View_towards_Mount_Fuji_from_Arakurayama_Sengen_Park_in_Fujiyoshida%2C_Yamanashi%2C_Japan%2C_2024_May_-_2.jpg/1280px-View_towards_Mount_Fuji_from_Arakurayama_Sengen_Park_in_Fujiyoshida%2C_Yamanashi%2C_Japan%2C_2024_May_-_2.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.25 },
    correctDistance: 13000,
    hint: '富士山の高さは3,776m。富士吉田市街地から撮影',
    collectionName: '富士山（富士吉田市街）',
    difficulty: 'normal',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-fuji-city',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Mt_Fuji_Tokaido_Shinkansen_%26_Photographer.jpg/1280px-Mt_Fuji_Tokaido_Shinkansen_%26_Photographer.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 18000,
    hint: '富士山の高さは3,776m。富士市（東海道）から撮影',
    collectionName: '富士山（富士市・東海道）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-izu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Mount_%C5%8Cmuro_%28Izu_Peninsula%29_%26_Mt.Fuji.jpg/1280px-Mount_%C5%8Cmuro_%28Izu_Peninsula%29_%26_Mt.Fuji.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.2 },
    correctDistance: 65000,
    hint: '富士山の高さは3,776m。伊豆半島から駿河湾越しに撮影',
    collectionName: '富士山（伊豆半島）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-choshi',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Mount_Fuji_viewed_from_Matsudo%2C_Chiba%2C_Japan%3B_October_2012.jpg/1280px-Mount_Fuji_viewed_from_Matsudo%2C_Chiba%2C_Japan%3B_October_2012.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 175000,
    hint: '富士山の高さは3,776m。銚子から撮影。太平洋越しの富士',
    collectionName: '富士山（銚子）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-tsukuba',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/FujiFromTsukubaSan.jpg/1280px-FujiFromTsukubaSan.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 195000,
    hint: '富士山の高さは3,776m。筑波山から撮影。関東平野越しの富士',
    collectionName: '富士山（筑波山）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-shizuoka-city',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shizuoka_City_and_Mount_Fuji_before_sunrise.jpg/1280px-Shizuoka_City_and_Mount_Fuji_before_sunrise.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.2 },
    correctDistance: 50000,
    hint: '富士山の高さは3,776m。静岡市街地から撮影',
    collectionName: '富士山（静岡市）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-yabitsu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mount_Fuji_%40_Trail_from_Okura_Bus_Station_to_Mount_To_%2811302179334%29.jpg/1280px-Mount_Fuji_%40_Trail_from_Okura_Bus_Station_to_Mount_To_%2811302179334%29.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 52000,
    hint: '富士山の高さは3,776m。ヤビツ峠から撮影。丹沢越しの富士',
    collectionName: '富士山（ヤビツ峠）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-nagatoro',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Fuji_-_Kitaurawa.JPG/1280px-Fuji_-_Kitaurawa.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.25 },
    correctDistance: 100000,
    hint: '富士山の高さは3,776m。長瀞から撮影。秩父山地越しの富士',
    collectionName: '富士山（長瀞）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-gotenba-line',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Gotemba_Line_JRC_EC313-2000_Mt.Fuji_20110425.jpg/1280px-Gotemba_Line_JRC_EC313-2000_Mt.Fuji_20110425.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.25 },
    correctDistance: 22000,
    hint: '富士山の高さは3,776m。JR御殿場線沿線から撮影',
    collectionName: '富士山（御殿場線）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-shinkansen',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Mount_Fuji_seen_from_tokaido_shinkansen_along_Fuji_river.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.2 },
    correctDistance: 38000,
    hint: '富士山の高さは3,776m。東海道新幹線と富士山',
    collectionName: '富士山（新幹線）',
    difficulty: 'expert',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-tea-field',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Mount_Fuji_and_Tea_plantation.jpg/1280px-Mount_Fuji_and_Tea_plantation.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.2 },
    correctDistance: 35000,
    hint: '富士山の高さは3,776m。茶畑と富士山。静岡県の原風景',
    collectionName: '富士山（茶畑）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
  {
    id: 'fuji-gotemba-outlet',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Fujibus_634.jpg',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.2 },
    correctDistance: 20000,
    hint: '富士山の高さは3,776m。御殿場プレミアムアウトレットから撮影',
    collectionName: '富士山（御殿場アウトレット）',
    difficulty: 'hard',
    landmark: '富士山',
    category: 'fuji',
  },
]

// ============================================
// カテゴリー2: 世界遺産・名所（比較的短距離）
// ============================================
const LANDMARK_STAGES: StageData[] = [
  {
    id: 'eiffel-trocadero',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/1200px-Tour_Eiffel_Wikimedia_Commons.jpg',
    question: 'エッフェル塔までの距離は？',
    targetPosition: { x: 0.55, y: 0.30 },
    correctDistance: 580,
    hint: 'エッフェル塔の高さは330m。トロカデロ広場からの撮影',
    collectionName: 'エッフェル塔（トロカデロ）',
    difficulty: 'hard',
    landmark: 'エッフェル塔',
    category: 'landmark',
  },
  {
    id: 'bigben-westminster',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Clock_Tower_-_Palace_of_Westminster%2C_London_-_May_2007.jpg/800px-Clock_Tower_-_Palace_of_Westminster%2C_London_-_May_2007.jpg',
    question: 'ビッグベンまでの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 180,
    hint: 'ビッグベン（エリザベスタワー）の高さは96m。ウェストミンスター橋付近から撮影',
    collectionName: 'ビッグベン（ウェストミンスター）',
    difficulty: 'normal',
    landmark: 'ビッグベン',
    category: 'landmark',
  },
  {
    id: 'colosseum-front',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1200px-Colosseo_2020.jpg',
    question: 'コロッセオまでの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 80,
    hint: 'コロッセオの高さは48m、直径188m。Via dei Fori Imperialiから撮影',
    collectionName: 'コロッセオ（正面）',
    difficulty: 'normal',
    landmark: 'コロッセオ',
    category: 'landmark',
  },
  {
    id: 'tokyo-tower-shiba',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Tokyo_Tower_20060211.JPG/1280px-Tokyo_Tower_20060211.JPG',
    question: '東京タワーまでの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 300,
    hint: '東京タワーの高さは333m。芝公園から撮影',
    collectionName: '東京タワー（芝公園）',
    difficulty: 'hard',
    landmark: '東京タワー',
    category: 'landmark',
  },
  // ========== 東京スカイツリー ==========
  {
    id: 'skytree-azumabashi',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Skytree_%26_Asahi_Breweries_Building%2C_from_Azumabashi%2C_Asakusa_2012_%E2%85%A2.JPG/1280px-Skytree_%26_Asahi_Breweries_Building%2C_from_Azumabashi%2C_Asakusa_2012_%E2%85%A2.JPG',
    question: '東京スカイツリーまでの距離は？',
    targetPosition: { x: 0.28, y: 0.25 },
    correctDistance: 850,
    hint: '東京スカイツリーの高さは634m。吾妻橋から撮影。アサヒビール本社ビルと一緒に',
    collectionName: '東京スカイツリー（吾妻橋）',
    difficulty: 'normal',
    landmark: '東京スカイツリー',
    category: 'landmark',
  },
  {
    id: 'skytree-genmori',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Tokyo_Sky_Tree_%26_Ryomo_%28train%29.JPG/1280px-Tokyo_Sky_Tree_%26_Ryomo_%28train%29.JPG',
    question: '東京スカイツリーまでの距離は？',
    targetPosition: { x: 0.55, y: 0.2 },
    correctDistance: 400,
    hint: '東京スカイツリーの高さは634m。源森橋から撮影。東武特急りょうもう号と一緒に',
    collectionName: '東京スカイツリー（源森橋）',
    difficulty: 'normal',
    landmark: '東京スカイツリー',
    category: 'landmark',
  },
  {
    id: 'skytree-sumida',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Tokyo_Sky_Tree_2012.JPG/1280px-Tokyo_Sky_Tree_2012.JPG',
    question: '東京スカイツリーまでの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 1500,
    hint: '東京スカイツリーの高さは634m。隅田川沿いから撮影',
    collectionName: '東京スカイツリー（隅田川）',
    difficulty: 'hard',
    landmark: '東京スカイツリー',
    category: 'landmark',
  },
  {
    id: 'taj-mahal-front',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1200px-Taj_Mahal_%28Edited%29.jpeg',
    question: 'タージマハルまでの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 300,
    hint: 'タージマハルの高さは73m。正門から庭園を通って撮影',
    collectionName: 'タージマハル（正面）',
    difficulty: 'normal',
    landmark: 'タージマハル',
    category: 'landmark',
  },
  {
    id: 'pyramid-giza',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/1200px-Kheops-Pyramid.jpg',
    question: 'クフ王のピラミッドまでの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 250,
    hint: 'クフ王のピラミッドの高さは139m（元は147m）',
    collectionName: 'ピラミッド（ギザ）',
    difficulty: 'hard',
    landmark: 'ピラミッド',
    category: 'landmark',
  },
  {
    id: 'statue-christ-rio',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Cristo_Redentor_-_Rio_de_Janeiro%2C_Brasil.jpg/1280px-Cristo_Redentor_-_Rio_de_Janeiro%2C_Brasil.jpg',
    question: 'コルコバードのキリスト像までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 50,
    hint: 'キリスト像の高さは30m（台座含め38m）。展望台の広場から撮影',
    collectionName: 'キリスト像（リオ）',
    difficulty: 'normal',
    landmark: 'コルコバードのキリスト像',
    category: 'landmark',
  },
  // ========== 追加ランドマーク ==========
  {
    id: 'sydney-opera',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/1280px-Sydney_Opera_House_-_Dec_2008.jpg',
    question: 'シドニー・オペラハウスまでの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 200,
    hint: 'オペラハウスの高さは65m。ハーバーブリッジ側から撮影',
    collectionName: 'シドニー・オペラハウス',
    difficulty: 'normal',
    landmark: 'シドニー・オペラハウス',
    category: 'landmark',
  },
  {
    id: 'parthenon',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Parthenon_from_west.jpg/1280px-Parthenon_from_west.jpg',
    question: 'パルテノン神殿までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 80,
    hint: 'パルテノン神殿の高さは13.7m。アクロポリスの丘にて',
    collectionName: 'パルテノン神殿（アテネ）',
    difficulty: 'normal',
    landmark: 'パルテノン神殿',
    category: 'landmark',
  },
  {
    id: 'sagrada-familia',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Sagrada_Familia_8-12-21_%281%29.jpg/1280px-Sagrada_Familia_8-12-21_%281%29.jpg',
    question: 'サグラダ・ファミリアまでの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 150,
    hint: 'サグラダ・ファミリアの高さは172m（完成時）。正面広場から撮影',
    collectionName: 'サグラダ・ファミリア（バルセロナ）',
    difficulty: 'hard',
    landmark: 'サグラダ・ファミリア',
    category: 'landmark',
  },
  {
    id: 'pisa-tower',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Leaning_Tower_of_Pisa_%28April_2012%29.jpg/1280px-Leaning_Tower_of_Pisa_%28April_2012%29.jpg',
    question: 'ピサの斜塔までの距離は？',
    targetPosition: { x: 0.55, y: 0.35 },
    correctDistance: 100,
    hint: 'ピサの斜塔の高さは56m。奇跡の広場から撮影',
    collectionName: 'ピサの斜塔（イタリア）',
    difficulty: 'normal',
    landmark: 'ピサの斜塔',
    category: 'landmark',
  },
  {
    id: 'angkor-wat',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Angkor_Wat.jpg/1280px-Angkor_Wat.jpg',
    question: 'アンコールワットまでの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 350,
    hint: 'アンコールワットの中央塔の高さは65m。西参道から撮影',
    collectionName: 'アンコールワット（カンボジア）',
    difficulty: 'hard',
    landmark: 'アンコールワット',
    category: 'landmark',
  },
  {
    id: 'forbidden-city',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Forbidden_City_August_2012_01.JPG/1280px-Forbidden_City_August_2012_01.JPG',
    question: '紫禁城・太和殿までの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 120,
    hint: '太和殿の高さは35m。天安門広場から撮影',
    collectionName: '紫禁城（北京）',
    difficulty: 'normal',
    landmark: '紫禁城',
    category: 'landmark',
  },
  {
    id: 'neuschwanstein',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Castle_Neuschwanstein.jpg/1280px-Castle_Neuschwanstein.jpg',
    question: 'ノイシュヴァンシュタイン城までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 400,
    hint: '城の高さは65m。マリエン橋付近から撮影',
    collectionName: 'ノイシュヴァンシュタイン城（ドイツ）',
    difficulty: 'hard',
    landmark: 'ノイシュヴァンシュタイン城',
    category: 'landmark',
  },
  {
    id: 'golden-gate',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateBridge-001.jpg/1280px-GoldenGateBridge-001.jpg',
    question: '橋の両端にある塔のうち、奥の塔までの距離は？',
    targetPosition: { x: 0.72, y: 0.42 },
    correctDistance: 1580,
    hint: '塔の高さは227m。手前の塔までは約300m',
    collectionName: 'ゴールデンゲートブリッジ（サンフランシスコ）',
    difficulty: 'hard',
    landmark: 'ゴールデンゲートブリッジ',
    category: 'landmark',
  },
  {
    id: 'stonehenge',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Stonehenge_back_wide.jpg/1280px-Stonehenge_back_wide.jpg',
    question: 'ストーンヘンジまでの距離は？',
    targetPosition: { x: 0.5, y: 0.5 },
    correctDistance: 50,
    hint: '最大の石の高さは約7m。遊歩道から撮影',
    collectionName: 'ストーンヘンジ（イギリス）',
    difficulty: 'easy',
    landmark: 'ストーンヘンジ',
    category: 'landmark',
  },
  {
    id: 'himeji-castle',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Himeji_Castle_The_Keep_Towers.jpg/1280px-Himeji_Castle_The_Keep_Towers.jpg',
    question: '姫路城の天守閣までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 200,
    hint: '姫路城の天守閣の高さは46.4m。三の丸広場から撮影',
    collectionName: '姫路城（日本）',
    difficulty: 'normal',
    landmark: '姫路城',
    category: 'landmark',
  },
  // ========== 追加30問 (21〜50) ==========
  {
    id: 'machu-picchu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/1280px-Machu_Picchu%2C_Peru.jpg',
    question: 'マチュピチュの遺跡群までの距離は？',
    targetPosition: { x: 0.5, y: 0.5 },
    correctDistance: 400,
    hint: 'マチュピチュは標高2,430mに位置。見張り小屋付近から撮影',
    collectionName: 'マチュピチュ（ペルー）',
    difficulty: 'hard',
    landmark: 'マチュピチュ',
    category: 'landmark',
  },
  {
    id: 'mont-saint-michel',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Mont_St_Michel_at_sunrise.jpg/1280px-Mont_St_Michel_at_sunrise.jpg',
    question: 'モンサンミッシェルまでの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 600,
    hint: '修道院の尖塔の高さは約80m。対岸の遊歩道から撮影',
    collectionName: 'モンサンミッシェル（フランス）',
    difficulty: 'hard',
    landmark: 'モンサンミッシェル',
    category: 'landmark',
  },
  {
    id: 'statue-of-liberty',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/1280px-Statue_of_Liberty_7.jpg',
    question: '自由の女神像までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 150,
    hint: '自由の女神の高さは93m（台座含む）。リバティ島内から撮影',
    collectionName: '自由の女神（ニューヨーク）',
    difficulty: 'normal',
    landmark: '自由の女神',
    category: 'landmark',
  },
  {
    id: 'great-wall-badaling',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/1280px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
    question: '奥の見張り台（望楼）までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 500,
    hint: '万里の長城の望楼の高さは約12m。金山嶺長城にて',
    collectionName: '万里の長城（中国）',
    difficulty: 'hard',
    landmark: '万里の長城',
    category: 'landmark',
  },
  {
    id: 'petra-treasury',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Al_Khazneh_Petra_edit_2.jpg/1280px-Al_Khazneh_Petra_edit_2.jpg',
    question: 'エル・ハズネ（宝物殿）までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 60,
    hint: 'エル・ハズネの高さは40m。シークの出口から撮影',
    collectionName: 'ペトラ遺跡（ヨルダン）',
    difficulty: 'normal',
    landmark: 'ペトラ遺跡',
    category: 'landmark',
  },
  {
    id: 'chichen-itza',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/1280px-Chichen_Itza_3.jpg',
    question: 'ククルカンの神殿までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 150,
    hint: 'ククルカンの神殿の高さは30m。東側の広場から撮影',
    collectionName: 'チチェン・イッツァ（メキシコ）',
    difficulty: 'normal',
    landmark: 'チチェン・イッツァ',
    category: 'landmark',
  },
  {
    id: 'itsukushima-torii',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Itsukushima_Gate.jpg/1280px-Itsukushima_Gate.jpg',
    question: '厳島神社の大鳥居までの距離は？',
    targetPosition: { x: 0.5, y: 0.5 },
    correctDistance: 200,
    hint: '大鳥居の高さは16.6m。対岸の海岸から撮影',
    collectionName: '厳島神社（広島）',
    difficulty: 'normal',
    landmark: '厳島神社',
    category: 'landmark',
  },
  {
    id: 'kinkakuji',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Kinkaku-ji_in_November_2016_-02.jpg/1280px-Kinkaku-ji_in_November_2016_-02.jpg',
    question: '金閣寺までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 70,
    hint: '金閣寺（舎利殿）の高さは12.5m。鏡湖池のほとりから撮影',
    collectionName: '金閣寺（京都）',
    difficulty: 'easy',
    landmark: '金閣寺',
    category: 'landmark',
  },
  {
    id: 'kiyomizu-dera',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Four_ladies_wearing_a_yukata_in_front_of_the_North_Gate_of_Kiyomizu-dera_temple_Kyoto_Japan.jpg/1280px-Four_ladies_wearing_a_yukata_in_front_of_the_North_Gate_of_Kiyomizu-dera_temple_Kyoto_Japan.jpg',
    question: '清水の舞台までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 120,
    hint: '清水の舞台の高さは13m。奥の院から撮影',
    collectionName: '清水寺（京都）',
    difficulty: 'normal',
    landmark: '清水寺',
    category: 'landmark',
  },
  {
    id: 'moai-ahu-tongariki',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Moai_Rano_raraku.jpg/1280px-Moai_Rano_raraku.jpg',
    question: 'モアイ像までの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 50,
    hint: 'モアイ像の高さは約4〜10m。ラノ・ララク山麓にて',
    collectionName: 'モアイ像（イースター島）',
    difficulty: 'easy',
    landmark: 'モアイ像',
    category: 'landmark',
  },
  {
    id: 'burj-khalifa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Burj_dubai_3.11.08.jpg',
    question: 'ブルジュ・ハリファまでの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 800,
    hint: 'ブルジュ・ハリファの高さは828m。世界一高いビル',
    collectionName: 'ブルジュ・ハリファ（ドバイ）',
    difficulty: 'hard',
    landmark: 'ブルジュ・ハリファ',
    category: 'landmark',
  },
  {
    id: 'cologne-cathedral',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Kranh%C3%A4user_Cologne%2C_April_2018_-01.jpg/1280px-Kranh%C3%A4user_Cologne%2C_April_2018_-01.jpg',
    question: 'ケルン大聖堂までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 250,
    hint: 'ケルン大聖堂の高さは157m。ホーエンツォレルン橋から撮影',
    collectionName: 'ケルン大聖堂（ドイツ）',
    difficulty: 'hard',
    landmark: 'ケルン大聖堂',
    category: 'landmark',
  },
  {
    id: 'notre-dame',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Cath%C3%A9drale_Notre_Dame%2C_Paris_30_September_2015.jpg/1280px-Cath%C3%A9drale_Notre_Dame%2C_Paris_30_September_2015.jpg',
    question: 'ノートルダム大聖堂までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 100,
    hint: 'ノートルダム大聖堂の高さは69m（塔部分96m）。パルヴィ広場から撮影',
    collectionName: 'ノートルダム大聖堂（パリ）',
    difficulty: 'normal',
    landmark: 'ノートルダム大聖堂',
    category: 'landmark',
  },
  {
    id: 'santorini-blue-dome',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Santorini%2C_Oia_16.jpg/1280px-Santorini%2C_Oia_16.jpg',
    question: '青いドームの教会までの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 80,
    hint: 'サントリーニ島イアの教会。ドームの直径は約5m',
    collectionName: '青の教会（サントリーニ）',
    difficulty: 'easy',
    landmark: 'サントリーニ島',
    category: 'landmark',
  },
  {
    id: 'wat-arun',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Templo_Wat_Arun%2C_Bangkok%2C_Tailandia%2C_2013-08-22%2C_DD_30.jpg/1280px-Templo_Wat_Arun%2C_Bangkok%2C_Tailandia%2C_2013-08-22%2C_DD_30.jpg',
    question: 'ワットアルンの大仏塔までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 300,
    hint: 'ワットアルンの大仏塔の高さは75m。チャオプラヤー川の対岸から撮影',
    collectionName: 'ワットアルン（バンコク）',
    difficulty: 'hard',
    landmark: 'ワットアルン',
    category: 'landmark',
  },
  {
    id: 'borobudur',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Borobudur-Nothwest-view.jpg/1280px-Borobudur-Nothwest-view.jpg',
    question: 'ボロブドゥール寺院までの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 100,
    hint: 'ボロブドゥール寺院の高さは35m。北西側から撮影',
    collectionName: 'ボロブドゥール（インドネシア）',
    difficulty: 'normal',
    landmark: 'ボロブドゥール',
    category: 'landmark',
  },
  {
    id: 'prague-castle',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Castillo_de_Praga%2C_Praga%2C_Rep%C3%BAblica_Checa%2C_2022-07-01%2C_DD_23-25_HDR.jpg/1280px-Castillo_de_Praga%2C_Praga%2C_Rep%C3%BAblica_Checa%2C_2022-07-01%2C_DD_23-25_HDR.jpg',
    question: 'プラハ城の大聖堂までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 700,
    hint: '聖ヴィート大聖堂の高さは96m。カレル橋付近から撮影',
    collectionName: 'プラハ城（チェコ）',
    difficulty: 'hard',
    landmark: 'プラハ城',
    category: 'landmark',
  },
  {
    id: 'brandenburg-gate',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Brandenburger_Tor_abends.jpg/1280px-Brandenburger_Tor_abends.jpg',
    question: 'ブランデンブルク門までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 100,
    hint: 'ブランデンブルク門の高さは26m。パリ広場から撮影',
    collectionName: 'ブランデンブルク門（ベルリン）',
    difficulty: 'easy',
    landmark: 'ブランデンブルク門',
    category: 'landmark',
  },
  {
    id: 'alhambra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg/1280px-Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg',
    question: 'アルハンブラ宮殿のカルロス5世宮殿までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 50,
    hint: 'カルロス5世宮殿の直径は約30m。宮殿前の広場から撮影',
    collectionName: 'アルハンブラ宮殿（スペイン）',
    difficulty: 'easy',
    landmark: 'アルハンブラ宮殿',
    category: 'landmark',
  },
  {
    id: 'hagia-sophia',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/1280px-Hagia_Sophia_Mars_2013.jpg',
    question: 'アヤソフィアまでの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 120,
    hint: 'アヤソフィアのドームの高さは55m。スルタンアフメット広場から撮影',
    collectionName: 'アヤソフィア（イスタンブール）',
    difficulty: 'normal',
    landmark: 'アヤソフィア',
    category: 'landmark',
  },
  {
    id: 'st-basils',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/St_Basils_Cathedral-500px.jpg',
    question: '聖ワシリイ大聖堂までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 80,
    hint: '聖ワシリイ大聖堂の高さは65m。赤の広場から撮影',
    collectionName: '聖ワシリイ大聖堂（モスクワ）',
    difficulty: 'normal',
    landmark: '聖ワシリイ大聖堂',
    category: 'landmark',
  },
  {
    id: 'taipei-101',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Taipei_Taiwan_Taipei-101-Tower-01.jpg/1280px-Taipei_Taiwan_Taipei-101-Tower-01.jpg',
    question: '台北101までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 500,
    hint: '台北101の高さは508m。信義区の通りから撮影',
    collectionName: '台北101（台湾）',
    difficulty: 'hard',
    landmark: '台北101',
    category: 'landmark',
  },
  {
    id: 'christ-church-nz',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Milford_Sound_in_Fiordland_National_Park_05.jpg/1280px-Milford_Sound_in_Fiordland_National_Park_05.jpg',
    question: 'マイターピークの頂上までの距離は？',
    targetPosition: { x: 0.5, y: 0.2 },
    correctDistance: 2000,
    hint: 'マイターピークの高さは1,692m。ミルフォードサウンドから撮影',
    collectionName: 'ミルフォードサウンド（ニュージーランド）',
    difficulty: 'expert',
    landmark: 'マイターピーク',
    category: 'landmark',
  },
  {
    id: 'matsumoto-castle',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Matsumoto_Castle05s5s4592.jpg/1280px-Matsumoto_Castle05s5s4592.jpg',
    question: '松本城天守閣までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 80,
    hint: '松本城天守の高さは29.4m。内堀のほとりから撮影',
    collectionName: '松本城（日本）',
    difficulty: 'easy',
    landmark: '松本城',
    category: 'landmark',
  },
  {
    id: 'empire-state',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/1280px-Empire_State_Building_%28aerial_view%29.jpg',
    question: 'エンパイアステートビルまでの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 500,
    hint: 'エンパイアステートビルの高さは443m（アンテナ含む）',
    collectionName: 'エンパイアステートビル（ニューヨーク）',
    difficulty: 'hard',
    landmark: 'エンパイアステートビル',
    category: 'landmark',
  },
  {
    id: 'uluru',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Uluru_Panorama.jpg/1280px-Uluru_Panorama.jpg',
    question: 'ウルル（エアーズロック）までの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 1500,
    hint: 'ウルルの高さは348m、周囲約9.4km。展望スポットから撮影',
    collectionName: 'ウルル（オーストラリア）',
    difficulty: 'expert',
    landmark: 'ウルル',
    category: 'landmark',
  },
  {
    id: 'big-buddha-kamakura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Kamakura_Budda_Daibutsu_front_1885.jpg/1280px-Kamakura_Budda_Daibutsu_front_1885.jpg',
    question: '鎌倉大仏までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 30,
    hint: '鎌倉大仏の高さは11.3m（台座含め13.4m）。正面の参拝エリアから撮影',
    collectionName: '鎌倉大仏（日本）',
    difficulty: 'easy',
    landmark: '鎌倉大仏',
    category: 'landmark',
  },
  {
    id: 'petronas-towers',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Petronas_Panorama_II.jpg/1280px-Petronas_Panorama_II.jpg',
    question: 'ペトロナスツインタワーまでの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 400,
    hint: 'ペトロナスツインタワーの高さは452m。KLCC公園から撮影',
    collectionName: 'ペトロナスツインタワー（マレーシア）',
    difficulty: 'hard',
    landmark: 'ペトロナスツインタワー',
    category: 'landmark',
  },
  {
    id: 'christ-redeemer-far',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/1280px-Christ_the_Redeemer_-_Cristo_Redentor.jpg',
    question: 'コルコバードのキリスト像までの距離は？',
    targetPosition: { x: 0.5, y: 0.25 },
    correctDistance: 2500,
    hint: 'キリスト像の高さは30m（台座含め38m）。ボタフォゴ海岸付近から撮影',
    collectionName: 'キリスト像（遠景）',
    difficulty: 'expert',
    landmark: 'コルコバードのキリスト像',
    category: 'landmark',
  },
  {
    id: 'piazza-san-marco',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Panorama_Piazza_San_Marco_and_Venice_on_Easter_2013.jpg/1280px-Panorama_Piazza_San_Marco_and_Venice_on_Easter_2013.jpg',
    question: '奥のサンマルコ大聖堂までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 170,
    hint: 'サンマルコ広場。大聖堂の高さは約43m',
    collectionName: 'サンマルコ広場（ヴェネツィア）',
    difficulty: 'hard',
    landmark: 'サンマルコ大聖堂',
    category: 'landmark',
  },
]

// ============================================
// カテゴリー3: 日常の距離感
// ============================================
const DAILY_STAGES: StageData[] = [
  {
    id: 'daily-hotel-lounge',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/King_and_Prince_Hotel_lounge_area.JPG/1280px-King_and_Prince_Hotel_lounge_area.JPG',
    question: '画面中央やや左に立っている人までの距離は？',
    targetPosition: { x: 0.45, y: 0.35 },
    correctDistance: 10,
    hint: 'ホテルのラウンジエリア。人の身長は約170cm',
    collectionName: 'ホテルラウンジ',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-hotel-okura',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Lobby_in_HOTEL_OKURA%2C_Tokyo.JPG/1280px-Lobby_in_HOTEL_OKURA%2C_Tokyo.JPG',
    question: '奥の壁までの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 15,
    hint: 'ホテルオークラ東京のロビー。天井高は約6m',
    collectionName: 'ホテルオークラ東京',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-cafe-vienna',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Cafe_Central_in_Vienna_interior_near_portraits.JPG/1280px-Cafe_Central_in_Vienna_interior_near_portraits.JPG',
    question: '奥の壁に掲げている左の人物画までの距離は？',
    targetPosition: { x: 0.5, y: 0.5 },
    correctDistance: 8,
    hint: 'ウィーンのカフェ・ツェントラル。壁画の高さは約3m',
    collectionName: 'カフェ・ツェントラル（ウィーン）',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-cafe-beyerd',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Cafe_Restaurant_de_Beyerd_DSCF3018.JPG/1280px-Cafe_Restaurant_de_Beyerd_DSCF3018.JPG',
    question: '奥の建物までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 25,
    hint: 'カフェレストランの外観。建物の高さは約12m',
    collectionName: 'カフェレストラン',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-hotel-corridor',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Royal_York_Hallway.JPG/1280px-Royal_York_Hallway.JPG',
    question: '廊下の奥までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 18,
    hint: 'ロイヤルヨークホテルの廊下。ドアの高さは約2.1m',
    collectionName: 'ホテル廊下',
    difficulty: 'normal',
    category: 'daily',
  },
  {
    id: 'daily-backyard-pool',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Backyard_swimming_pool_in_Queensland.JPG/1280px-Backyard_swimming_pool_in_Queensland.JPG',
    question: 'プールの奥のチェアまでの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 10,
    hint: '裏庭のプール（オーストラリア）。チェアの幅は約60cm',
    collectionName: '裏庭のプール',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-hotel-suite',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Hotel-suite-living-room.jpg/1280px-Hotel-suite-living-room.jpg',
    question: '画面中央やや下のガラステーブルまでの距離は？',
    targetPosition: { x: 0.5, y: 0.55 },
    correctDistance: 5,
    hint: 'ホテルスイートのリビングルーム。ガラステーブルの高さは約45cm',
    collectionName: 'ホテルスイート',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-front-patio',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Front_patio_to_house.JPG/1280px-Front_patio_to_house.JPG',
    question: '画面中央のポールまでの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 5,
    hint: '家のパティオ。ポールの高さは約2.5m',
    collectionName: '家のパティオ',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-lbj-pool',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Swimming_pool_at_LBJ_Ranch_IMG_1512.JPG/1280px-Swimming_pool_at_LBJ_Ranch_IMG_1512.JPG',
    question: '画面中央やや左下のプールサイド手摺りまでの距離は？',
    targetPosition: { x: 0.4, y: 0.55 },
    correctDistance: 8,
    hint: 'LBJ牧場のプール。手摺りの高さは約1m',
    collectionName: 'LBJ牧場のプール',
    difficulty: 'normal',
    category: 'daily',
  },
  // ========== 車間距離 ==========
  {
    id: 'highway-chuo-isonohara',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/ChuoExpressway_ISonohara_IC_EXIT.jpg/1280px-ChuoExpressway_ISonohara_IC_EXIT.jpg',
    question: '前方の車までの距離は？',
    targetPosition: { x: 0.58, y: 0.72 },
    correctDistance: 55,
    hint: '中央自動車道・園原IC出口付近',
    collectionName: '中央自動車道（園原IC）',
    difficulty: 'normal',
    category: 'daily',
  },
  {
    id: 'highway-405-getty',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/405_southbound_near_Getty_Museum.jpg/1280px-405_southbound_near_Getty_Museum.jpg',
    question: '前方の車までの距離は？',
    targetPosition: { x: 0.58, y: 0.66 },
    correctDistance: 65,
    hint: 'ゲティ美術館付近の405フリーウェイ南行き',
    collectionName: 'I-405フリーウェイ（ゲティ美術館付近）',
    difficulty: 'normal',
    category: 'daily',
  },
  // ========== 追加39問 (12〜50) ==========
  // --- 家の中 (リビング・キッチン・書斎・寝室) ×5問 ---
  // --- 高速道路・車間距離 ×8問 ---
  {
    id: 'highway-interstate-10',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Junction_with_Interstate_10_and_Texas_State_Highway_130.jpg/1280px-Junction_with_Interstate_10_and_Texas_State_Highway_130.jpg',
    question: '前方の車までの距離は？',
    targetPosition: { x: 0.5, y: 0.5 },
    correctDistance: 200,
    hint: 'テキサス州のインターステート10号線',
    collectionName: 'I-10（テキサス）',
    difficulty: 'hard',
    category: 'daily',
  },
  // --- 公園・広場 ×6問 ---
  {
    id: 'daily-playground',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Closed_playground_equipment_Harrsion_Meadows_Park.jpg/1280px-Closed_playground_equipment_Harrsion_Meadows_Park.jpg',
    question: '奥の遊具までの距離は？',
    targetPosition: { x: 0.5, y: 0.45 },
    correctDistance: 30,
    hint: '公園の遊具。すべり台の高さは約3m',
    collectionName: '公園の遊具（シアトル）',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-ueno-park',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Bentendo_Gull.JPG',
    question: '弁天堂までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 150,
    hint: '上野不忍池の弁天堂。堂の高さは約15m',
    collectionName: '上野不忍池',
    difficulty: 'hard',
    category: 'daily',
  },
  // --- 商店街・街並み ×5問 ---
  // --- 学校・図書館 ×3問 ---
  {
    id: 'daily-library',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Grand_Reading_Room.jpg/1280px-Grand_Reading_Room.jpg',
    question: '奥の壁までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 40,
    hint: '州立図書館の閲覧室。天井の高さは約15m',
    collectionName: '州立図書館',
    difficulty: 'normal',
    category: 'daily',
  },
  // --- スポーツ・遊び場 ×4問 ---
  // --- 駅・電車 ×4問 ---
  // --- その他日常風景 ×4問 ---
  {
    id: 'daily-supermarket',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Grocery_Store_Aisle%2C_vermont.jpg/1280px-Grocery_Store_Aisle%2C_vermont.jpg',
    question: '奥のレジカウンターまでの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 25,
    hint: 'スーパーマーケットの通路。棚の高さは約2m',
    collectionName: 'スーパーマーケット',
    difficulty: 'easy',
    category: 'daily',
  },
  {
    id: 'daily-swimming-pool-olympic',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Starting_blocks_in_an_olympic_swimming_pool_with_lanes.jpg/1280px-Starting_blocks_in_an_olympic_swimming_pool_with_lanes.jpg',
    question: 'プールの向こう端までの距離は？',
    targetPosition: { x: 0.5, y: 0.4 },
    correctDistance: 50,
    hint: '競泳プール。オリンピックプールの長さは50m',
    collectionName: '競泳プール',
    difficulty: 'normal',
    category: 'daily',
  },
]

// ============================================
// カテゴリー4: 錯覚チャレンジ（3D生成シーン）
// ============================================
// Helper to generate 50 illusion stages (comparison: "which is closer?")
const ILLUSION_TYPE_NAMES: Record<IllusionType, string> = {
  perspective: '遠近法の罠',
  atmospheric: '大気透視の罠',
  texture: 'きめ勾配の罠',
  occlusion: '重なりの罠',
  size: 'サイズ対比の罠',
  shadow: '陰影の罠',
  vertical: '垂直位置の罠',
}

const ILLUSION_TYPES: IllusionType[] = ['perspective', 'atmospheric', 'texture', 'occlusion', 'size', 'shadow', 'vertical']

// Seeded random for deterministic pair generation
function illusionSeededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Generate 50 comparison stages.
// SAME illusion type for both scenes → player compares within identical visual context.
// Building apparent size is normalized → can't just "look at size"; must use environmental cues.
// Distance gaps are tight → genuinely hard to tell which is closer.
const ILLUSION_STAGES: StageData[] = Array.from({ length: 50 }, (_, i) => {
  const stageNum = i + 1
  const rand = illusionSeededRandom(stageNum * 7919 + 42)

  // Both scenes share the same illusion type (round-robin across 7 types)
  const illusionType = ILLUSION_TYPES[i % ILLUSION_TYPES.length]

  // Base distance for scene A: 100-300m
  const baseDistA = 100 + Math.floor(rand() * 200)

  // Distance gap % — much tighter than before
  let gapPercent: number
  let difficulty: Difficulty
  if (stageNum <= 10) {
    // Intro: 15-30% gap — noticeable but building sizes are equalized
    gapPercent = 0.15 + rand() * 0.15
    difficulty = stageNum <= 5 ? 'easy' : 'normal'
  } else if (stageNum <= 30) {
    // Middle: 8-18% gap
    gapPercent = 0.08 + rand() * 0.10
    difficulty = stageNum <= 20 ? 'normal' : 'hard'
  } else {
    // Hard: 3-10% gap — extremely difficult
    gapPercent = 0.03 + rand() * 0.07
    difficulty = stageNum <= 40 ? 'hard' : 'expert'
  }

  // Scene B distance: offset from A (randomly closer or farther)
  const offset = Math.round(baseDistA * gapPercent)
  const distB = rand() > 0.5 ? baseDistA + offset : Math.max(60, baseDistA - offset)

  const correctChoice: 'A' | 'B' = baseDistA <= distB ? 'A' : 'B'

  const closerDist = Math.min(baseDistA, distB)
  const fartherDist = Math.max(baseDistA, distB)
  const actualGap = Math.round(((fartherDist - closerDist) / closerDist) * 100)

  return {
    id: `illusion-${stageNum}`,
    image: '',
    question: '赤いビルが近いのはどっち？',
    targetPosition: { x: 0.5, y: 0.5 },
    correctDistance: baseDistA,
    hint: `${ILLUSION_TYPE_NAMES[illusionType]}（距離差 約${actualGap}%）`,
    collectionName: `錯覚比較 #${stageNum}`,
    difficulty,
    category: 'illusion' as GameCategory,
    illusionType,
    showRuler: true,
    illusionPairDistance: distB,
    illusionPairType: illusionType, // Same type for both scenes
    correctChoice,
  }
})

// ============================================
// カテゴリー5: 錯覚クイズ（2D SVG錯視）
// 設計原則: 錯覚が正解に「逆らう」ように配置する。
//   例: Aが実際に長い → 錯覚でBが長く見える → プレイヤーは騙される
// ============================================
const VISUAL_ILLUSION_TYPES: VisualIllusionType[] = [
  'mullerLyer', 'ebbinghaus', 'ponzo', 'jastrow',
  'verticalHorizontal', 'delboeuf', 'sander', 'baldwin',
]

const VISUAL_ILLUSION_NAMES: Record<VisualIllusionType, string> = {
  mullerLyer: 'ミュラー・リヤー錯視',
  ebbinghaus: 'エビングハウス錯視',
  ponzo: 'ポンゾ錯視',
  jastrow: 'ヤストロー錯視',
  verticalHorizontal: '垂直水平錯視',
  delboeuf: 'デルブーフ錯視',
  sander: 'サンダー錯視',
  baldwin: 'ボールドウィン錯視',
}

const VISUAL_ILLUSION_QUESTIONS: Record<VisualIllusionType, string> = {
  mullerLyer: 'どちらの線が長い？',
  ebbinghaus: 'どちらの中心の円が大きい？',
  ponzo: 'どちらの横線が長い？',
  jastrow: 'どちらの図形が大きい？',
  verticalHorizontal: 'どちらの線が長い？',
  delboeuf: 'どちらの内側の円が大きい？',
  sander: 'どちらの対角線が長い？',
  baldwin: 'どちらの線が長い？',
}

const VISUAL_ILLUSION_EXPLANATIONS: Record<VisualIllusionType, string> = {
  mullerLyer: '矢羽の向きが線の長さの知覚を変えます。内向き矢羽（>—<）は線を短く、外向き矢羽（<—>）は線を長く見せます。',
  ebbinghaus: '周囲の円の大きさが中心の円の知覚を変えます。大きな円に囲まれると小さく、小さな円に囲まれると大きく見えます。',
  ponzo: '収束する線（遠近法）が奥の線をより大きく感じさせ、同じ長さでも長く見せます。',
  jastrow: '2つの同じ扇形を並べると、短い弧と長い弧が隣接する側で大きさが違って見えます。',
  verticalHorizontal: '垂直線は水平線より長く見える傾向があります。脳が重力方向の距離を過大評価するためです。',
  delboeuf: '外側の輪の大きさが内側の円の知覚を変えます。タイトな輪は内円を大きく、広い輪は小さく見せます。',
  sander: '平行四辺形の大きさが対角線の知覚を歪めます。大きな平行四辺形内の対角線は実際より短く見えます。',
  baldwin: '両端の正方形の大きさが線の長さの知覚を変えます。大きな正方形に挟まれた線は短く見えます。',
}

function visualSeededRandom(seed: number) {
  // xorshift32 — much better distribution than LCG for sequential seeds
  let s = seed | 0
  if (s === 0) s = 1
  return () => {
    s ^= s << 13
    s ^= s >> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

const VISUAL_STAGES: StageData[] = Array.from({ length: 50 }, (_, i) => {
  const stageNum = i + 1
  const rand = visualSeededRandom(stageNum * 48271 + stageNum * stageNum * 31 + 9973)

  const illusionType = VISUAL_ILLUSION_TYPES[i % VISUAL_ILLUSION_TYPES.length]

  // --- 難易度設計 ---
  // サイズ差が小さい ＋ 錯覚が強い ＝ 難しい
  let difficulty: Difficulty
  let diffPercent: number  // 実際のサイズ差（%）
  let sameChance: number   // 「同じ」が正解になる確率
  let illusionStrength: number // 錯覚の強さ (0-1)

  if (stageNum <= 10) {
    // Easy: 大きめの差、中程度の錯覚 → 騙されても気づける
    diffPercent = 0.15 + rand() * 0.10 // 15-25%
    difficulty = stageNum <= 5 ? 'easy' : 'normal'
    sameChance = 0.05
    illusionStrength = 0.4 + rand() * 0.25
  } else if (stageNum <= 25) {
    // Normal: 差が縮まり、錯覚が強くなる
    diffPercent = 0.06 + rand() * 0.08 // 6-14%
    difficulty = stageNum <= 18 ? 'normal' : 'hard'
    sameChance = 0.15
    illusionStrength = 0.55 + rand() * 0.3
  } else if (stageNum <= 40) {
    // Hard: 小さな差＋強い錯覚 → かなり騙される
    diffPercent = 0.03 + rand() * 0.05 // 3-8%
    difficulty = 'hard'
    sameChance = 0.25
    illusionStrength = 0.7 + rand() * 0.25
  } else {
    // Expert: 極小差＋最大錯覚 → 見破れたら超人
    diffPercent = 0.01 + rand() * 0.04 // 1-5%
    difficulty = 'expert'
    sameChance = 0.4
    illusionStrength = 0.85 + rand() * 0.15
  }

  const isSame = rand() < sameChance
  let sizeA: number
  let sizeB: number
  let correctChoice: 'A' | 'B' | 'same'
  let illusionFavors: 'A' | 'B'

  if (isSame) {
    // 同じサイズだが、錯覚で片方が大きく見える
    const baseSize = 90 + Math.floor(rand() * 30) // 90-120
    sizeA = baseSize
    sizeB = baseSize
    correctChoice = 'same'
    illusionFavors = rand() > 0.5 ? 'A' : 'B' // 錯覚でどちらが大きく見えるか
  } else {
    const baseSize = 90 + Math.floor(rand() * 30)
    const offset = Math.max(2, Math.round(baseSize * diffPercent))
    if (rand() > 0.5) {
      sizeA = baseSize + offset
      sizeB = baseSize
      correctChoice = 'A'
      illusionFavors = 'B' // Aが正解 → 錯覚はBを大きく見せる（騙す）
    } else {
      sizeA = baseSize
      sizeB = baseSize + offset
      correctChoice = 'B'
      illusionFavors = 'A' // Bが正解 → 錯覚はAを大きく見せる（騙す）
    }
  }

  const seed = stageNum * 3571 + 89

  return {
    id: `visual-${stageNum}`,
    image: '',
    question: VISUAL_ILLUSION_QUESTIONS[illusionType],
    targetPosition: { x: 0.5, y: 0.5 },
    correctDistance: sizeA,
    hint: `${VISUAL_ILLUSION_NAMES[illusionType]}`,
    collectionName: `${VISUAL_ILLUSION_NAMES[illusionType]} #${Math.ceil(stageNum / VISUAL_ILLUSION_TYPES.length)}`,
    difficulty,
    category: 'visual' as GameCategory,
    correctChoice,
    visualIllusionType: illusionType,
    visualExplanation: VISUAL_ILLUSION_EXPLANATIONS[illusionType],
    visualParams: { sizeA, sizeB, illusionStrength, seed, illusionFavors },
  }
})

// 全ステージを結合
const DEMO_STAGES: StageData[] = [
  ...FUJI_STAGES,
  ...LANDMARK_STAGES,
  ...DAILY_STAGES,
  ...ILLUSION_STAGES,
  ...VISUAL_STAGES,
]

function calculateResult(
  guessedDistance: number,
  correctDistance: number,
  guessedHeight?: number,
  correctHeight?: number
): GameResult {
  const distanceError = Math.abs(guessedDistance - correctDistance) / correctDistance * 100
  const heightError = correctHeight && guessedHeight
    ? Math.abs(guessedHeight - correctHeight) / correctHeight * 100
    : undefined

  const avgError = heightError !== undefined
    ? (distanceError + heightError) / 2
    : distanceError

  // スコア計算（緩めの設定）
  const score = Math.max(0, Math.round(100 - avgError * 0.8))

  let title: string
  let titleEmoji: string

  // 評価基準（緩めの設定）
  if (avgError <= 10) {
    title = '神の目'
    titleEmoji = '🏆'
  } else if (avgError <= 25) {
    title = '達人の目'
    titleEmoji = '👁️'
  } else if (avgError <= 40) {
    title = '鷹の目'
    titleEmoji = '🎯'
  } else if (avgError <= 60) {
    title = '良い目'
    titleEmoji = '👀'
  } else if (avgError <= 80) {
    title = '普通の目'
    titleEmoji = '👁️‍🗨️'
  } else {
    title = '修行中'
    titleEmoji = '🔰'
  }

  return {
    guessedDistance,
    guessedHeight,
    correctDistance,
    correctHeight,
    distanceError,
    heightError,
    score,
    title,
    titleEmoji,
  }
}

let currentStageIndex = 0

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'title',
  currentCategory: null,
  currentStage: null,
  currentStageNumber: 0,
  stageCount: 0,
  guessedDistance: 50,
  guessedHeight: 10,
  illusionChoice: null,
  result: null,
  totalScore: 0,
  knownLandmarks: new Set<string>(),
  playerName: localStorage.getItem('playerName') || '',
  playedStages: JSON.parse(localStorage.getItem('playedStages') || '{}') as Record<string, number>,

  setPhase: (phase) => set({ phase }),

  setPlayerName: (name) => {
    localStorage.setItem('playerName', name)
    set({ playerName: name })
  },

  setCategory: (category) => {
    const stages = DEMO_STAGES.filter(s => s.category === category)
    currentStageIndex = 0
    set({
      currentCategory: category,
      currentStage: stages[0] || null,
      currentStageNumber: 1,
      stageCount: stages.length,
      phase: 'input',
      guessedDistance: 50,
      guessedHeight: 10,
      illusionChoice: null,
      result: null,
      totalScore: 0,
    })
  },

  setStage: (stage) => set({
    currentStage: stage,
    guessedDistance: 50,
    guessedHeight: 10,
    illusionChoice: null,
    result: null,
  }),

  setGuessedDistance: (distance) => set({ guessedDistance: distance }),

  setGuessedHeight: (height) => set({ guessedHeight: height }),

  setIllusionChoice: (choice) => set({ illusionChoice: choice }),

  isHeightKnown: () => {
    const { currentStage, knownLandmarks } = get()
    if (!currentStage?.landmark) return false
    return knownLandmarks.has(currentStage.landmark)
  },

  submitAnswer: () => {
    const { currentStage, guessedDistance, guessedHeight, illusionChoice, knownLandmarks, isHeightKnown, playerName } = get()
    if (!currentStage) return

    // Visual illusion quiz: correct/incorrect binary scoring
    if (currentStage.category === 'visual' && currentStage.correctChoice && illusionChoice) {
      const isCorrect = illusionChoice === currentStage.correctChoice
      const result: GameResult = {
        guessedDistance: 0,
        correctDistance: 0,
        distanceError: isCorrect ? 0 : 100,
        score: isCorrect ? 100 : 0,
        title: isCorrect ? '正解！' : '不正解...',
        titleEmoji: isCorrect ? '🎉' : '😵',
      }

      const { playedStages } = get()
      const prev = playedStages[currentStage.id] ?? -1
      if (result.score > prev) {
        const updated = { ...playedStages, [currentStage.id]: result.score }
        localStorage.setItem('playedStages', JSON.stringify(updated))
        set((state) => ({
          result,
          phase: 'reveal',
          totalScore: state.totalScore + result.score,
          playedStages: updated,
        }))
      } else {
        set((state) => ({
          result,
          phase: 'reveal',
          totalScore: state.totalScore + result.score,
        }))
      }
      return
    }

    // Illusion comparison mode: correct/incorrect binary scoring
    if (currentStage.category === 'illusion' && currentStage.correctChoice && illusionChoice) {
      const isCorrect = illusionChoice === currentStage.correctChoice
      const result: GameResult = {
        guessedDistance: illusionChoice === 'A' ? currentStage.correctDistance : (currentStage.illusionPairDistance ?? 0),
        correctDistance: currentStage.correctChoice === 'A' ? currentStage.correctDistance : (currentStage.illusionPairDistance ?? 0),
        distanceError: isCorrect ? 0 : 100,
        score: isCorrect ? 100 : 0,
        title: isCorrect ? '正解！' : '不正解...',
        titleEmoji: isCorrect ? '🎉' : '😵',
      }

      const { playedStages } = get()
      const prev = playedStages[currentStage.id] ?? -1
      if (result.score > prev) {
        const updated = { ...playedStages, [currentStage.id]: result.score }
        localStorage.setItem('playedStages', JSON.stringify(updated))
        set((state) => ({
          result,
          phase: 'reveal',
          totalScore: state.totalScore + result.score,
          playedStages: updated,
        }))
      } else {
        set((state) => ({
          result,
          phase: 'reveal',
          totalScore: state.totalScore + result.score,
        }))
      }
      return
    }

    const heightKnown = isHeightKnown()
    const effectiveGuessedHeight = heightKnown ? currentStage.correctHeight : guessedHeight

    const result = calculateResult(
      guessedDistance,
      currentStage.correctDistance,
      currentStage.correctHeight ? effectiveGuessedHeight : undefined,
      currentStage.correctHeight
    )

    const newKnownLandmarks = new Set(knownLandmarks)
    if (currentStage.landmark && currentStage.correctHeight) {
      newKnownLandmarks.add(currentStage.landmark)
    }

    // Fire-and-forget: submit score to Firestore (fuji & landmark)
    if (playerName && (currentStage.category === 'fuji' || currentStage.category === 'landmark')) {
      const country = STAGE_COUNTRY_MAP[currentStage.id] || currentStage.country || ''
      const prefecture = STAGE_PREFECTURE_MAP[currentStage.id] || currentStage.prefecture || null
      submitScore({
        playerName,
        stageId: currentStage.id,
        stageName: currentStage.collectionName,
        score: result.score,
        distanceError: result.distanceError,
        country,
        prefecture,
      })
    }

    // Record best score per stage
    const { playedStages } = get()
    const prev = playedStages[currentStage.id] ?? -1
    if (result.score > prev) {
      const updated = { ...playedStages, [currentStage.id]: result.score }
      localStorage.setItem('playedStages', JSON.stringify(updated))
      set((state) => ({
        result,
        phase: 'reveal',
        totalScore: state.totalScore + result.score,
        knownLandmarks: newKnownLandmarks,
        playedStages: updated,
      }))
    } else {
      set((state) => ({
        result,
        phase: 'reveal',
        totalScore: state.totalScore + result.score,
        knownLandmarks: newKnownLandmarks,
      }))
    }
  },

  nextStage: () => {
    const { currentCategory } = get()
    const stages = currentCategory
      ? DEMO_STAGES.filter(s => s.category === currentCategory)
      : DEMO_STAGES
    currentStageIndex = (currentStageIndex + 1) % stages.length
    set({
      currentStage: stages[currentStageIndex],
      currentStageNumber: currentStageIndex + 1,
      phase: 'input',
      guessedDistance: 50,
      guessedHeight: 10,
      illusionChoice: null,
      result: null,
    })
  },

  previousStage: () => {
    if (currentStageIndex <= 0) return
    const { currentCategory } = get()
    const stages = currentCategory
      ? DEMO_STAGES.filter(s => s.category === currentCategory)
      : DEMO_STAGES
    currentStageIndex = currentStageIndex - 1
    set({
      currentStage: stages[currentStageIndex],
      currentStageNumber: currentStageIndex + 1,
      phase: 'input',
      guessedDistance: 50,
      guessedHeight: 10,
      illusionChoice: null,
      result: null,
    })
  },

  skipStage: () => {
    const { currentCategory } = get()
    const stages = currentCategory
      ? DEMO_STAGES.filter(s => s.category === currentCategory)
      : DEMO_STAGES
    currentStageIndex = (currentStageIndex + 1) % stages.length
    set({
      currentStage: stages[currentStageIndex],
      currentStageNumber: currentStageIndex + 1,
      phase: 'input',
      guessedDistance: 50,
      guessedHeight: 10,
      illusionChoice: null,
      result: null,
    })
  },

  resetGame: () => {
    currentStageIndex = 0
    set({
      phase: 'title',
      currentCategory: null,
      currentStage: null,
      currentStageNumber: 0,
      stageCount: 0,
      guessedDistance: 50,
      guessedHeight: 10,
      illusionChoice: null,
      result: null,
      totalScore: 0,
      knownLandmarks: new Set<string>(),
    })
  },
}))

export { DEMO_STAGES, FUJI_STAGES, LANDMARK_STAGES, DAILY_STAGES, ILLUSION_STAGES, VISUAL_STAGES, VISUAL_ILLUSION_NAMES }

export const getStagesByCategory = (category: GameCategory): StageData[] => {
  return DEMO_STAGES.filter(stage => stage.category === category)
}

export const getStagesByDifficulty = (difficulty: Difficulty): StageData[] => {
  return DEMO_STAGES.filter(stage => stage.difficulty === difficulty)
}

export const getStagesByLandmark = (landmark: string): StageData[] => {
  return DEMO_STAGES.filter(stage => stage.landmark === landmark)
}

export const getAvailableLandmarks = (): string[] => {
  const landmarks = DEMO_STAGES
    .filter(stage => stage.landmark)
    .map(stage => stage.landmark!)
  return [...new Set(landmarks)]
}

export const CATEGORY_INFO = {
  fuji: {
    id: 'fuji',
    name: '富士山',
    description: '各地から富士山までの距離を当てよう（8km〜195km・全50問）',
    icon: '🗻',
    stageCount: FUJI_STAGES.length,
  },
  landmark: {
    id: 'landmark',
    name: '世界遺産・名所',
    description: '世界の有名な建造物までの距離を当てよう（30m〜2.5km・全50問）',
    icon: '🏛️',
    stageCount: LANDMARK_STAGES.length,
  },
  daily: {
    id: 'daily',
    name: '日常',
    description: '身近な空間で距離感を鍛えよう（3〜200m・全50問）',
    icon: '🛋️',
    stageCount: DAILY_STAGES.length,
  },
  illusion: {
    id: 'illusion',
    name: '錯覚チャレンジ',
    description: '2つのシーンを見比べて近い方を当てよう（全50問）',
    icon: '🌀',
    stageCount: ILLUSION_STAGES.length,
  },
  visual: {
    id: 'visual',
    name: '錯覚クイズ',
    description: '有名な錯視を見破れるか？（全50問）',
    icon: '🔮',
    stageCount: VISUAL_STAGES.length,
  },
} as const

export const DIFFICULTY_INFO = {
  easy: { label: '簡単', description: '近距離・わかりやすい対象', color: 'green' },
  normal: { label: '普通', description: '中距離・一般的な建物', color: 'blue' },
  hard: { label: '難しい', description: '遠距離・大きな建造物', color: 'orange' },
  expert: { label: 'エキスパート', description: '超遠距離・山や大規模建造物', color: 'red' },
} as const

export const LANDMARK_INFO = {
  'エッフェル塔': { country: 'フランス', height: 330 },
  '富士山': { country: '日本', height: 3776 },
  'ビッグベン': { country: 'イギリス', height: 96 },
  'コロッセオ': { country: 'イタリア', height: 48 },
  '東京タワー': { country: '日本', height: 333 },
  '東京スカイツリー': { country: '日本', height: 634 },
  'タージマハル': { country: 'インド', height: 73 },
  'ピラミッド': { country: 'エジプト', height: 139 },
  'コルコバードのキリスト像': { country: 'ブラジル', height: 38 },
  'シドニー・オペラハウス': { country: 'オーストラリア', height: 65 },
  'パルテノン神殿': { country: 'ギリシャ', height: 14 },
  'サグラダ・ファミリア': { country: 'スペイン', height: 172 },
  'ピサの斜塔': { country: 'イタリア', height: 56 },
  'アンコールワット': { country: 'カンボジア', height: 65 },
  '紫禁城': { country: '中国', height: 35 },
  'ノイシュヴァンシュタイン城': { country: 'ドイツ', height: 65 },
  'ゴールデンゲートブリッジ': { country: 'アメリカ', height: 227 },
  'ストーンヘンジ': { country: 'イギリス', height: 7 },
  '姫路城': { country: '日本', height: 46 },
  'マチュピチュ': { country: 'ペルー', height: 0 },
  'モンサンミッシェル': { country: 'フランス', height: 80 },
  '自由の女神': { country: 'アメリカ', height: 93 },
  '万里の長城': { country: '中国', height: 12 },
  'ペトラ遺跡': { country: 'ヨルダン', height: 40 },
  'チチェン・イッツァ': { country: 'メキシコ', height: 30 },
  '厳島神社': { country: '日本', height: 17 },
  '金閣寺': { country: '日本', height: 13 },
  '清水寺': { country: '日本', height: 13 },
  'モアイ像': { country: 'チリ', height: 10 },
  'ブルジュ・ハリファ': { country: 'UAE', height: 828 },
  'ケルン大聖堂': { country: 'ドイツ', height: 157 },
  'ノートルダム大聖堂': { country: 'フランス', height: 96 },
  'サントリーニ島': { country: 'ギリシャ', height: 5 },
  'ワットアルン': { country: 'タイ', height: 75 },
  'ボロブドゥール': { country: 'インドネシア', height: 35 },
  'プラハ城': { country: 'チェコ', height: 96 },
  'ブランデンブルク門': { country: 'ドイツ', height: 26 },
  'アルハンブラ宮殿': { country: 'スペイン', height: 30 },
  'アヤソフィア': { country: 'トルコ', height: 55 },
  '聖ワシリイ大聖堂': { country: 'ロシア', height: 65 },
  '台北101': { country: '台湾', height: 508 },
  'マイターピーク': { country: 'ニュージーランド', height: 1692 },
  '大阪城': { country: '日本', height: 55 },
  '松本城': { country: '日本', height: 29 },
  'エンパイアステートビル': { country: 'アメリカ', height: 443 },
  'ウルル': { country: 'オーストラリア', height: 348 },
  '鎌倉大仏': { country: '日本', height: 13 },
  'ペトロナスツインタワー': { country: 'マレーシア', height: 452 },
} as const
