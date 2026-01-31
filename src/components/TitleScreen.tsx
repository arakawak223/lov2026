import { motion } from 'framer-motion'

interface TitleScreenProps {
  onStart: () => void
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
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
        className="space-y-4 w-full max-w-xs"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all animate-pulse-glow"
        >
          ゲームスタート
        </motion.button>

        <div className="grid grid-cols-2 gap-3">
          <button className="py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-sm">
            📚 図鑑
          </button>
          <button className="py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors text-sm">
            🏆 ランキング
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <div className="flex justify-center gap-6 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-500">●</span>
            <span>5 レベル</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">●</span>
            <span>50+ ステージ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-500">●</span>
            <span>錯覚の罠</span>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 text-gray-600 text-xs"
      >
        Prototype v0.1 - 3D演出技術検証
      </motion.p>
    </div>
  )
}
