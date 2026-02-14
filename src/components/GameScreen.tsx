import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import GuessSlider from './GuessSlider'
import RevealScene from './RevealScene'
import ResultDisplay from './ResultDisplay'
import ZoomableImage from './ZoomableImage'
import PrecisionScene, { PRECISION_SCENARIOS } from './PrecisionScene'
import IllusionCompare from './IllusionCompare'
import OpticalIllusionQuiz from './OpticalIllusionQuiz'
import { VISUAL_ILLUSION_NAMES } from '../store/gameStore'
import type { VisualIllusionType } from '../store/gameStore'

export default function GameScreen() {
  const {
    currentStage,
    currentStageNumber,
    stageCount,
    guessedDistance,
    setGuessedDistance,
    illusionChoice,
    setIllusionChoice,
    submitAnswer,
    phase,
    setPhase,
    result,
    nextStage,
    previousStage,
    skipStage,
    totalScore,
  } = useGameStore()

  const [showHint, setShowHint] = useState(false)

  if (!currentStage) return null

  // Check if this is a precision training stage
  const precisionScenario = currentStage.scenarioId
    ? PRECISION_SCENARIOS.find(s => s.id === currentStage.scenarioId)
    : null

  // Check if this is an illusion comparison stage
  const isIllusionStage = currentStage.category === 'illusion'
    && currentStage.illusionType
    && currentStage.illusionPairType
    && currentStage.illusionPairDistance != null

  // Check if this is a visual illusion quiz stage
  const isVisualQuizStage = currentStage.category === 'visual' && currentStage.visualIllusionType != null

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => useGameStore.getState().resetGame()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 戻る
          </button>
          {currentStageNumber > 1 && phase === 'input' && (
            <button
              onClick={previousStage}
              className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg text-gray-400 hover:text-white transition-all"
            >
              ← 1問戻る
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            <span className="text-white font-bold">{currentStageNumber}</span>
            <span className="text-gray-500"> / {stageCount}</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-blue-400">{totalScore}</span>
            <span className="text-gray-500 text-sm">pts</span>
          </div>
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
              {isVisualQuizStage ? (
                /* ===== Visual Illusion Quiz Mode ===== */
                <>
                  {/* Question */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-purple-400 font-medium mb-1">
                      🔮 {VISUAL_ILLUSION_NAMES[currentStage.visualIllusionType as VisualIllusionType]}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {currentStage.question}
                    </p>
                  </div>

                  {/* SVG Illusion */}
                  <div className="mb-4">
                    <OpticalIllusionQuiz
                      illusionType={currentStage.visualIllusionType!}
                      params={currentStage.visualParams!}
                      mode="play"
                      correctChoice={currentStage.correctChoice}
                      selectedChoice={illusionChoice}
                    />
                  </div>

                  {/* A / 同じ / B Buttons */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIllusionChoice('A')}
                      className={`py-4 rounded-xl font-bold text-lg transition-all ${
                        illusionChoice === 'A'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
                      }`}
                    >
                      A
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIllusionChoice('same')}
                      className={`py-4 rounded-xl font-bold text-lg transition-all ${
                        illusionChoice === 'same'
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
                      }`}
                    >
                      同じ
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIllusionChoice('B')}
                      className={`py-4 rounded-xl font-bold text-lg transition-all ${
                        illusionChoice === 'B'
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
                      }`}
                    >
                      B
                    </motion.button>
                  </div>

                  {/* Submit / Skip */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={!illusionChoice}
                      className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${
                        illusionChoice
                          ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 shadow-green-500/25'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
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
                </>
              ) : isIllusionStage ? (
                /* ===== Illusion Comparison Mode ===== */
                <>
                  {/* Question */}
                  <div className="text-center mb-4">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      🎯 {currentStage.question}
                    </p>
                  </div>

                  {/* Two scenes side by side */}
                  <div className="mb-4">
                    <IllusionCompare
                      typeA={currentStage.illusionType!}
                      distanceA={currentStage.correctDistance}
                      seedA={currentStage.id.length * 997 + currentStage.correctDistance}
                      typeB={currentStage.illusionPairType!}
                      distanceB={currentStage.illusionPairDistance!}
                      seedB={currentStage.id.length * 1301 + currentStage.illusionPairDistance!}
                      mode="play"
                      selectedChoice={illusionChoice}
                      correctChoice={currentStage.correctChoice}
                    />
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

                  {/* A/B Choice Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIllusionChoice('A')}
                      className={`py-4 rounded-xl font-bold text-xl transition-all ${
                        illusionChoice === 'A'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
                      }`}
                    >
                      A が近い
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIllusionChoice('B')}
                      className={`py-4 rounded-xl font-bold text-xl transition-all ${
                        illusionChoice === 'B'
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
                      }`}
                    >
                      B が近い
                    </motion.button>
                  </div>

                  {/* Submit / Skip */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={!illusionChoice}
                      className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${
                        illusionChoice
                          ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 shadow-green-500/25'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
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
                </>
              ) : (
                /* ===== Normal Distance Guess Mode ===== */
                <>
                  {/* Image/3D Scene Display */}
                  <div className="mb-6">
                    {precisionScenario ? (
                      <div className="relative">
                        <PrecisionScene scenario={precisionScenario} showTarget={true} />
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

                  {/* Distance Slider */}
                  <div className="mb-6">
                    <GuessSlider
                      label="距離"
                      value={guessedDistance}
                      onChange={setGuessedDistance}
                      min={0.5}
                      max={300000}
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
                </>
              )}
            </motion.div>
          )}

          {phase === 'reveal' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isVisualQuizStage ? (
                /* ===== Visual Quiz Reveal ===== */
                <>
                  <div className="text-center mb-4">
                    <h2 className={`text-3xl font-bold mb-2 ${result.score === 100 ? 'text-green-400' : 'text-red-400'}`}>
                      {result.title}
                    </h2>
                  </div>

                  <div className="mb-4">
                    <OpticalIllusionQuiz
                      illusionType={currentStage.visualIllusionType!}
                      params={currentStage.visualParams!}
                      mode="reveal"
                      correctChoice={currentStage.correctChoice}
                      selectedChoice={illusionChoice}
                      explanation={currentStage.visualExplanation}
                    />
                  </div>

                  <div className="text-center">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRevealComplete}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-lg transition-all"
                    >
                      結果を見る →
                    </motion.button>
                  </div>
                </>
              ) : isIllusionStage ? (
                /* ===== Illusion Reveal: show distances + correct highlight ===== */
                <>
                  <div className="text-center mb-4">
                    <h2 className={`text-3xl font-bold mb-2 ${result.score === 100 ? 'text-green-400' : 'text-red-400'}`}>
                      {result.title}
                    </h2>
                    <p className="text-gray-400">
                      {result.score === 100
                        ? `正解！ ${currentStage.correctChoice} の方が近い（${Math.min(currentStage.correctDistance, currentStage.illusionPairDistance!)}m）`
                        : `正解は ${currentStage.correctChoice}（${Math.min(currentStage.correctDistance, currentStage.illusionPairDistance!)}m）でした`
                      }
                    </p>
                  </div>

                  <div className="mb-4">
                    <IllusionCompare
                      typeA={currentStage.illusionType!}
                      distanceA={currentStage.correctDistance}
                      seedA={currentStage.id.length * 997 + currentStage.correctDistance}
                      typeB={currentStage.illusionPairType!}
                      distanceB={currentStage.illusionPairDistance!}
                      seedB={currentStage.id.length * 1301 + currentStage.illusionPairDistance!}
                      mode="reveal"
                      selectedChoice={illusionChoice}
                      correctChoice={currentStage.correctChoice}
                    />
                  </div>

                  <div className="text-center">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRevealComplete}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-lg transition-all"
                    >
                      結果を見る →
                    </motion.button>
                  </div>
                </>
              ) : (
                /* ===== Normal Reveal ===== */
                <>
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

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRevealComplete}
                      className="mt-4 px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
                    >
                      結果を見る →
                    </motion.button>
                  </div>
                </>
              )}
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
