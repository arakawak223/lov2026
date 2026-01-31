import { create } from 'zustand'

export type GamePhase = 'title' | 'question' | 'input' | 'reveal' | 'result'

export interface StageData {
  id: string
  image: string
  question: string
  targetPosition: { x: number; y: number }
  correctDistance: number
  correctHeight?: number
  hint?: string
  collectionName: string
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
  currentStage: StageData | null
  guessedDistance: number
  guessedHeight: number
  result: GameResult | null
  totalScore: number

  setPhase: (phase: GamePhase) => void
  setStage: (stage: StageData) => void
  setGuessedDistance: (distance: number) => void
  setGuessedHeight: (height: number) => void
  submitAnswer: () => void
  nextStage: () => void
  resetGame: () => void
}

const DEMO_STAGES: StageData[] = [
  {
    id: 'demo-1',
    // 東京タワー全景 - 縦長で全体が見える
    image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200',
    question: '東京タワーまでの距離は？',
    targetPosition: { x: 0.5, y: 0.35 },
    correctDistance: 400,
    correctHeight: 333,
    hint: '東京タワーの高さは333m。手前の建物と比較してみよう',
    collectionName: '東京タワー',
  },
  {
    id: 'demo-2',
    // 富士山の遠景
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200',
    question: '富士山の山頂までの距離は？',
    targetPosition: { x: 0.5, y: 0.25 },
    correctDistance: 15000,
    correctHeight: 3776,
    hint: '富士山の高さは3776m。空気が澄んでいると近く見える',
    collectionName: '富士山',
  },
  {
    id: 'demo-3',
    // 道路と車
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200',
    question: 'この車までの距離は？',
    targetPosition: { x: 0.5, y: 0.55 },
    correctDistance: 12,
    correctHeight: 1.4,
    hint: '一般的な乗用車の全長は約4.5m、高さは約1.4m',
    collectionName: 'スポーツカー',
  },
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

  const score = Math.max(0, Math.round(100 - avgError * 1.5))

  let title: string
  let titleEmoji: string

  if (avgError <= 1) {
    title = '神の目'
    titleEmoji = '🏆'
  } else if (avgError <= 5) {
    title = '達人の目'
    titleEmoji = '👁️'
  } else if (avgError <= 10) {
    title = '鷹の目'
    titleEmoji = '🎯'
  } else if (avgError <= 20) {
    title = '良い目'
    titleEmoji = '👀'
  } else if (avgError <= 35) {
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
  currentStage: null,
  guessedDistance: 50,
  guessedHeight: 10,
  result: null,
  totalScore: 0,

  setPhase: (phase) => set({ phase }),

  setStage: (stage) => set({
    currentStage: stage,
    guessedDistance: 50,
    guessedHeight: 10,
    result: null,
  }),

  setGuessedDistance: (distance) => set({ guessedDistance: distance }),

  setGuessedHeight: (height) => set({ guessedHeight: height }),

  submitAnswer: () => {
    const { currentStage, guessedDistance, guessedHeight } = get()
    if (!currentStage) return

    const result = calculateResult(
      guessedDistance,
      currentStage.correctDistance,
      currentStage.correctHeight ? guessedHeight : undefined,
      currentStage.correctHeight
    )

    set((state) => ({
      result,
      phase: 'reveal',
      totalScore: state.totalScore + result.score,
    }))
  },

  nextStage: () => {
    currentStageIndex = (currentStageIndex + 1) % DEMO_STAGES.length
    set({
      currentStage: DEMO_STAGES[currentStageIndex],
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
      currentStage: null,
      guessedDistance: 50,
      guessedHeight: 10,
      result: null,
      totalScore: 0,
    })
  },
}))

export { DEMO_STAGES }
