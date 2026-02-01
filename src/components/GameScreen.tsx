import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import GuessSlider from './GuessSlider'
import RevealScene from './RevealScene'
import ResultDisplay from './ResultDisplay'
import ZoomableImage from './ZoomableImage'
import PrecisionScene, { PRECISION_SCENARIOS } from './PrecisionScene'

export default function GameScreen() {
  const {
    currentStage,
    guessedDistance,
    setGuessedDistance,
    submitAnswer,
    phase,
    setPhase,
    result,
    nextStage,
    skipStage,
    totalScore,
  } = useGameStore()

  const [showHint, setShowHint] = useState(false)

  if (!currentStage) return null

  // Check if this is a precision training stage
  const precisionScenario = currentStage.category === 'precision'
    ? PRECISION_SCENARIOS.find(s => s.id === currentStage.scenarioId)
    : null

  const handleSubmit = () => {
    submitAnswer()
  }

  const handleRevealComplete = () => {
    setPhase('result')
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-4 max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => useGameStore.getState().resetGame()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 戻る
          </button>
          <span className="text-gray-500">DEMO</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Total:</span>
          <span className="text-xl font-bold text-blue-400">{totalScore}</span>
          <span className="text-gray-500">pts</span>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Image/3D Scene Display */}
              <div className="mb-6">
                {precisionScenario ? (
                  <div className="relative">
                    <PrecisionScene scenario={precisionScenario} showTarget={true} />
                    {/* Question Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-2xl">
                      <p className="text-xl md:text-2xl font-bold text-white">
                        🎯 {currentStage.question}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ZoomableImage
                    src={currentStage.image}
                    alt="Question"
                    targetPosition={currentStage.targetPosition}
                  >
                    {/* Question Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                      <p className="text-xl md:text-2xl font-bold text-white">
                        🎯 {currentStage.question}
                      </p>
                    </div>
                  </ZoomableImage>
                )}
              </div>

              {/* Hint */}
              {currentStage.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: showHint ? 1 : 0.7,
                    height: 'auto',
                  }}
                  className="mb-4"
                >
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-2"
                  >
                    💡 ヒント {showHint ? '▲' : '▼'}
                  </button>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-gray-400 text-sm bg-gray-800/50 p-3 rounded-lg"
                    >
                      {currentStage.hint}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* 距離スライダー */}
              <div className="mb-6">
                <GuessSlider
                  label="距離"
                  value={guessedDistance}
                  onChange={setGuessedDistance}
                  min={0.5}
                  max={50000}
                  unit="m"
                  icon="📏"
                />
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-xl font-bold text-xl shadow-lg shadow-green-500/25 transition-all"
                >
                  回答する！
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={skipStage}
                  className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-all"
                >
                  スキップ →
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === 'reveal' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                  答え合わせ...
                </h2>
                <p className="text-gray-400">
                  カメラが回り込んで距離を明らかにします
                </p>
              </div>

              <RevealScene
                imageUrl={currentStage.image}
                correctDistance={currentStage.correctDistance}
                guessedDistance={guessedDistance}
                onComplete={handleRevealComplete}
              />

              <div className="mt-4 text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex justify-center gap-8 text-lg"
                >
                  <div>
                    <span className="text-gray-400">正解: </span>
                    <span className="text-green-400 font-bold">
                      {currentStage.correctDistance}m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">あなた: </span>
                    <span className="text-blue-400 font-bold">
                      {guessedDistance.toFixed(1)}m
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {phase === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ResultDisplay
                result={result}
                onNext={nextStage}
                collectionName={currentStage.collectionName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
