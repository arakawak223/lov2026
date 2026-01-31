import { motion } from 'framer-motion'
import type { GameResult } from '../store/gameStore'

interface ResultDisplayProps {
  result: GameResult
  onNext: () => void
  collectionName: string
}

export default function ResultDisplay({
  result,
  onNext,
  collectionName,
}: ResultDisplayProps) {
  const isPerfect = result.distanceError <= 1

  const getTitleColor = () => {
    if (result.distanceError <= 1) return 'text-yellow-400'
    if (result.distanceError <= 5) return 'text-gray-300'
    if (result.distanceError <= 10) return 'text-green-400'
    if (result.distanceError <= 20) return 'text-blue-400'
    if (result.distanceError <= 35) return 'text-gray-400'
    return 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/80 rounded-2xl p-6 backdrop-blur-sm max-w-md mx-auto"
    >
      {isPerfect && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-4 py-1 rounded-full text-sm"
        >
          PERFECT!
        </motion.div>
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="text-center mb-6"
      >
        <span className="text-6xl">{result.titleEmoji}</span>
        <h2 className={`text-3xl font-bold mt-2 ${getTitleColor()}`}>
          {result.title}
        </h2>
      </motion.div>

      <div className="space-y-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center"
        >
          <span className="text-gray-400">スコア</span>
          <span className="text-4xl font-bold text-blue-400">
            {result.score}
            <span className="text-lg text-gray-500">/100</span>
          </span>
        </motion.div>

        <div className="border-t border-gray-700 pt-4 space-y-3">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between"
          >
            <span className="text-gray-400">正解（距離）</span>
            <span className="text-green-400 font-semibold">
              {result.correctDistance.toFixed(1)} m
            </span>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex justify-between"
          >
            <span className="text-gray-400">あなたの回答</span>
            <span className="text-blue-400 font-semibold">
              {result.guessedDistance.toFixed(1)} m
            </span>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-between"
          >
            <span className="text-gray-400">誤差</span>
            <span
              className={`font-semibold ${
                result.distanceError <= 5
                  ? 'text-green-400'
                  : result.distanceError <= 20
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {result.distanceError.toFixed(1)}%
            </span>
          </motion.div>
        </div>

        {result.correctHeight && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex justify-between"
            >
              <span className="text-gray-400">正解（高さ）</span>
              <span className="text-green-400 font-semibold">
                {result.correctHeight.toFixed(1)} m
              </span>
            </motion.div>

            {result.guessedHeight && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-between"
              >
                <span className="text-gray-400">あなたの回答</span>
                <span className="text-blue-400 font-semibold">
                  {result.guessedHeight.toFixed(1)} m
                </span>
              </motion.div>
            )}

            {result.heightError !== undefined && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex justify-between"
              >
                <span className="text-gray-400">誤差（高さ）</span>
                <span
                  className={`font-semibold ${
                    result.heightError <= 5
                      ? 'text-green-400'
                      : result.heightError <= 20
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {result.heightError.toFixed(1)}%
                </span>
              </motion.div>
            )}
          </div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-700/50 rounded-lg p-3 mt-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300 text-sm">
              「{collectionName}」を図鑑に登録しました！
            </span>
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-lg transition-all"
      >
        次の問題へ →
      </motion.button>
    </motion.div>
  )
}
