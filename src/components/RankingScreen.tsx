import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PREFECTURES, getPrefecturesWithStages } from '../data/prefectures'
import {
  fetchWorldRankings,
  fetchJapanRankings,
  fetchPrefectureRankings,
} from '../lib/rankingService'
import type { RankingEntry } from '../lib/rankingService'
import { isConfigured } from '../lib/firebase'

type Tab = 'world' | 'japan' | 'prefecture'

interface RankingScreenProps {
  onBack: () => void
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'world', label: '世界', icon: '\uD83C\uDF0D' },
  { id: 'japan', label: '日本', icon: '\uD83D\uDDFE' },
  { id: 'prefecture', label: '県', icon: '\uD83C\uDFEF' },
]

function getMedal(rank: number): string {
  if (rank === 1) return '\uD83E\uDD47'
  if (rank === 2) return '\uD83E\uDD48'
  if (rank === 3) return '\uD83E\uDD49'
  return ''
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4 animate-pulse">
      <div className="w-8 h-6 bg-gray-700 rounded" />
      <div className="flex-1 h-5 bg-gray-700 rounded" />
      <div className="w-16 h-5 bg-gray-700 rounded" />
    </div>
  )
}

export default function RankingScreen({ onBack }: RankingScreenProps) {
  const [tab, setTab] = useState<Tab>('world')
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('')
  const prefecturesWithStages = getPrefecturesWithStages()
  const prefectureNames = new Set(prefecturesWithStages.map(p => p.name))

  useEffect(() => {
    if (!isConfigured) return

    const load = async () => {
      setLoading(true)
      setRankings([])
      try {
        let data: RankingEntry[] = []
        if (tab === 'world') {
          data = await fetchWorldRankings()
        } else if (tab === 'japan') {
          data = await fetchJapanRankings()
        } else if (tab === 'prefecture' && selectedPrefecture) {
          data = await fetchPrefectureRankings(selectedPrefecture)
        }
        setRankings(data)
      } catch {
        // handled by service
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tab, selectedPrefecture])

  // Group prefectures by region for the selector
  const regions = [...new Set(PREFECTURES.map(p => p.region))]

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
          ランキング
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id)
              if (t.id !== 'prefecture') setSelectedPrefecture('')
            }}
            className={`flex-1 py-3 text-center transition-colors relative ${
              tab === t.id
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            <span className="ml-1 text-sm font-medium">{t.label}</span>
            {tab === t.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Prefecture Selector */}
      <AnimatePresence>
        {tab === 'prefecture' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-gray-800"
          >
            <div className="p-3 max-h-60 overflow-y-auto">
              {regions.map((region) => (
                <div key={region} className="mb-2">
                  <div className="text-xs text-gray-500 mb-1 px-1">{region}</div>
                  <div className="flex flex-wrap gap-1">
                    {PREFECTURES.filter(p => p.region === region).map((pref) => {
                      const hasStages = prefectureNames.has(pref.name)
                      return (
                        <button
                          key={pref.code}
                          onClick={() => hasStages && setSelectedPrefecture(pref.name)}
                          disabled={!hasStages}
                          className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                            selectedPrefecture === pref.name
                              ? 'bg-blue-600 text-white'
                              : hasStages
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {pref.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto">
        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-4xl mb-4">🔧</p>
            <p className="text-sm">Firebase未設定</p>
            <p className="text-xs text-gray-600 mt-1">環境変数を設定してください</p>
          </div>
        ) : tab === 'prefecture' && !selectedPrefecture ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-4xl mb-4">👆</p>
            <p className="text-sm">都道府県を選択してください</p>
          </div>
        ) : tab === 'prefecture' && selectedPrefecture && !prefectureNames.has(selectedPrefecture) ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-4xl mb-4">🚧</p>
            <p className="text-sm">{selectedPrefecture}のステージは準備中です</p>
          </div>
        ) : loading ? (
          <div className="divide-y divide-gray-800">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-sm">まだランキングデータがありません</p>
            <p className="text-xs text-gray-600 mt-1">ゲームをプレイしてスコアを登録しよう！</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {rankings.map((entry, index) => {
              const rank = index + 1
              const medal = getMedal(rank)
              return (
                <motion.div
                  key={entry.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-3 py-3 px-4 ${
                    rank <= 3 ? 'bg-gray-800/30' : ''
                  }`}
                >
                  <span className="w-8 text-center text-sm font-bold text-gray-400">
                    {medal || `#${rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {entry.playerName}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {entry.stageName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-bold text-sm">
                      {entry.score}
                      <span className="text-xs text-gray-500 ml-0.5">pt</span>
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
