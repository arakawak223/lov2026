import { motion } from 'framer-motion'
import type { GameCategory } from '../store/gameStore'
import { CATEGORY_INFO } from '../store/gameStore'

interface TitleScreenProps {
  onSelectCourse: (category: GameCategory) => void
  onOpenRanking: () => void
  onOpenCollection: () => void
}

const COURSES: GameCategory[] = ['fuji', 'landmark', 'daily', 'illusion']

export default function TitleScreen({ onSelectCourse, onOpenRanking, onOpenCollection }: TitleScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-8xl mb-4"
        >
          👁️
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          視覚の限界
        </h1>

        <p className="text-xl text-gray-400 mb-2">
          Eye Measure
        </p>

        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          あなたの感覚と頭脳で
          <br />
          距離・サイズを当ててみよう
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="space-y-3 w-full max-w-sm"
      >
        <p className="text-center text-gray-400 text-sm mb-1">コースを選択</p>

        {COURSES.map((cat, i) => {
          const info = CATEGORY_INFO[cat]
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCourse(cat)}
              className="w-full flex items-center gap-4 py-4 px-5 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 rounded-xl transition-all text-left"
            >
              <span className="text-3xl">{info.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-lg">{info.name}</div>
                <div className="text-gray-400 text-xs">{info.description}</div>
              </div>
              <span className="text-gray-500 text-xs whitespace-nowrap">{info.stageCount}問</span>
            </motion.button>
          )
        })}

        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            onClick={onOpenCollection}
            className="py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-sm"
          >
            📚 図鑑
          </button>
          <button
            onClick={onOpenRanking}
            className="py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-sm"
          >
            🏆 ランキング
          </button>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 text-gray-600 text-xs"
      >
        Prototype v0.1
      </motion.p>
    </div>
  )
}
