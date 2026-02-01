import { create } from 'zustand'

export type GamePhase = 'title' | 'category' | 'question' | 'input' | 'reveal' | 'result'
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert'
export type GameCategory = 'landmark' | 'sports' | 'precision'

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
  guessedDistance: number
  guessedHeight: number
  result: GameResult | null
  totalScore: number
  knownLandmarks: Set<string>

  setPhase: (phase: GamePhase) => void
  setCategory: (category: GameCategory) => void
  setStage: (stage: StageData) => void
  setGuessedDistance: (distance: number) => void
  setGuessedHeight: (height: number) => void
  submitAnswer: () => void
  nextStage: () => void
  skipStage: () => void
  resetGame: () => void
  isHeightKnown: () => boolean
}

// ============================================
// 検証済みステージデータ
// 注意: 画像URLは実際の内容を確認済みのもののみ使用
// ============================================

// ============================================
// カテゴリー1: ランドマーク距離当て
// ============================================
// ============================================
// Wikimedia Commons 画像を使用（撮影地点が特定可能）
// ライセンス: Creative Commons
// ============================================
const LANDMARK_STAGES: StageData[] = [
  {
    id: 'eiffel-trocadero',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/1200px-Tour_Eiffel_Wikimedia_Commons.jpg',
    question: 'エッフェル塔までの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 580,
    hint: 'エッフェル塔の高さは330m。トロカデロ広場からの撮影',
    collectionName: 'エッフェル塔（トロカデロ）',
    difficulty: 'hard',
    landmark: 'エッフェル塔',
    category: 'landmark',
  },
  {
    id: 'fuji-kawaguchi',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Lake_Kawaguchiko_Sakura_Mount_Fuji_3.JPG/1280px-Lake_Kawaguchiko_Sakura_Mount_Fuji_3.JPG',
    question: '富士山までの距離は？',
    targetPosition: { x: 0.5, y: 0.25 },
    correctDistance: 15000,
    hint: '富士山の高さは3,776m。河口湖北岸から撮影',
    collectionName: '富士山（河口湖）',
    difficulty: 'expert',
    landmark: '富士山',
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
    question: 'ゴールデンゲートブリッジの塔までの距離は？',
    targetPosition: { x: 0.5, y: 0.3 },
    correctDistance: 500,
    hint: '塔の高さは227m。ビューポイントから撮影',
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
]

// ============================================
// カテゴリー2: スポーツ・実践シナリオ（廃止）
// ============================================
const SPORTS_STAGES: StageData[] = []

// ============================================
// カテゴリー3: 精密訓練（保留中 - 非表示）
// ============================================
const PRECISION_STAGES: StageData[] = []

// 全ステージを結合
const DEMO_STAGES: StageData[] = [
  ...LANDMARK_STAGES,
  ...SPORTS_STAGES,
  ...PRECISION_STAGES,
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
    title = '節穴'
    titleEmoji = '🙈'
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
  guessedDistance: 50,
  guessedHeight: 10,
  result: null,
  totalScore: 0,
  knownLandmarks: new Set<string>(),

  setPhase: (phase) => set({ phase }),

  setCategory: (category) => {
    const stages = DEMO_STAGES.filter(s => s.category === category)
    currentStageIndex = 0
    set({
      currentCategory: category,
      currentStage: stages[0] || null,
      phase: 'input',
      guessedDistance: 50,
      guessedHeight: 10,
      result: null,
      totalScore: 0,
    })
  },

  setStage: (stage) => set({
    currentStage: stage,
    guessedDistance: 50,
    guessedHeight: 10,
    result: null,
  }),

  setGuessedDistance: (distance) => set({ guessedDistance: distance }),

  setGuessedHeight: (height) => set({ guessedHeight: height }),

  isHeightKnown: () => {
    const { currentStage, knownLandmarks } = get()
    if (!currentStage?.landmark) return false
    return knownLandmarks.has(currentStage.landmark)
  },

  submitAnswer: () => {
    const { currentStage, guessedDistance, guessedHeight, knownLandmarks, isHeightKnown } = get()
    if (!currentStage) return

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

    set((state) => ({
      result,
      phase: 'reveal',
      totalScore: state.totalScore + result.score,
      knownLandmarks: newKnownLandmarks,
    }))
  },

  nextStage: () => {
    const { currentCategory } = get()
    const stages = currentCategory
      ? DEMO_STAGES.filter(s => s.category === currentCategory)
      : DEMO_STAGES
    currentStageIndex = (currentStageIndex + 1) % stages.length
    set({
      currentStage: stages[currentStageIndex],
      phase: 'input',
      guessedDistance: 50,
      guessedHeight: 10,
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
      phase: 'input',
      guessedDistance: 50,
      guessedHeight: 10,
      result: null,
    })
  },

  resetGame: () => {
    currentStageIndex = 0
    set({
      phase: 'title',
      currentCategory: null,
      currentStage: null,
      guessedDistance: 50,
      guessedHeight: 10,
      result: null,
      totalScore: 0,
      knownLandmarks: new Set<string>(),
    })
  },
}))

export { DEMO_STAGES, LANDMARK_STAGES, SPORTS_STAGES, PRECISION_STAGES }

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
  landmark: {
    id: 'landmark',
    name: 'ランドマーク',
    description: '世界の有名な建造物までの距離を当てよう',
    icon: '🏛️',
    stageCount: LANDMARK_STAGES.length,
  },
  sports: {
    id: 'sports',
    name: 'スポーツ・実践',
    description: '（廃止）',
    icon: '⚽',
    stageCount: 0,
  },
  precision: {
    id: 'precision',
    name: '精密訓練',
    description: '（開発中）',
    icon: '🎯',
    stageCount: 0,
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
} as const
