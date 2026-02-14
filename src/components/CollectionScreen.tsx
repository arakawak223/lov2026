import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FUJI_STAGES,
  LANDMARK_STAGES,
  DAILY_STAGES,
  ILLUSION_STAGES,
  VISUAL_STAGES,
  CATEGORY_INFO,
  useGameStore,
} from '../store/gameStore'
import type { GameCategory, StageData } from '../store/gameStore'

interface CollectionScreenProps {
  onBack: () => void
}

const TABS: { id: GameCategory; label: string; icon: string; stages: StageData[] }[] = [
  { id: 'fuji', label: CATEGORY_INFO.fuji.name, icon: CATEGORY_INFO.fuji.icon, stages: FUJI_STAGES },
  { id: 'landmark', label: CATEGORY_INFO.landmark.name, icon: CATEGORY_INFO.landmark.icon, stages: LANDMARK_STAGES },
  { id: 'daily', label: CATEGORY_INFO.daily.name, icon: CATEGORY_INFO.daily.icon, stages: DAILY_STAGES },
  { id: 'illusion', label: CATEGORY_INFO.illusion.name, icon: CATEGORY_INFO.illusion.icon, stages: ILLUSION_STAGES },
  { id: 'visual', label: CATEGORY_INFO.visual.name, icon: CATEGORY_INFO.visual.icon, stages: VISUAL_STAGES },
]

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(m % 1000 === 0 ? 0 : 1)}km`
  return `${m}m`
}

function ScoreBadge({ score }: { score: number }) {
  let bg = 'bg-gray-600'
  if (score >= 92) bg = 'bg-yellow-500'
  else if (score >= 80) bg = 'bg-blue-500'
  else if (score >= 60) bg = 'bg-green-600'
  else if (score >= 40) bg = 'bg-orange-500'

  return (
    <span className={`${bg} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
      {score}pt
    </span>
  )
}

export default function CollectionScreen({ onBack }: CollectionScreenProps) {
  const [tab, setTab] = useState<GameCategory>('fuji')
  const playedStages = useGameStore((s) => s.playedStages)

  const currentTab = TABS.find(t => t.id === tab)!
  const stages = currentTab.stages
  const playedCount = stages.filter(s => s.id in playedStages).length

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 border-b border-gray-800"
      >
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← 戻る
        </button>
        <h1 className="text-xl font-bold text-white flex-1 text-center pr-10">
          図鑑
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-0 py-3 text-center transition-colors relative ${
              tab === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-base">{t.icon}</span>
            <span className="ml-0.5 text-xs font-medium">{t.label}</span>
            {tab === t.id && (
              <motion.div
                layoutId="collection-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-400">達成率</span>
          <span className="text-gray-300 font-medium">{playedCount}/{stages.length}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stages.length > 0 ? (playedCount / stages.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stage List */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-0 divide-y divide-gray-800/50">
          {stages.map((stage, index) => {
            const bestScore = playedStages[stage.id]
            const played = bestScore !== undefined

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3 px-4 py-3"
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                  {played ? (
                    stage.image === '' ? (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-700">
                        {stage.category === 'visual' ? '🔮' : '🌀'}
                      </div>
                    ) : (
                      <img
                        src={stage.image}
                        alt={stage.collectionName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">
                      ?
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${played ? 'text-white' : 'text-gray-500'}`}>
                    {played ? stage.collectionName : '？？？'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {played
                      ? `正解: ${formatDistance(stage.correctDistance)}`
                      : '未プレイ'
                    }
                  </p>
                </div>

                {/* Score */}
                <div className="flex-shrink-0">
                  {played ? (
                    <ScoreBadge score={bestScore} />
                  ) : (
                    <span className="text-gray-600 text-xs">---</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
