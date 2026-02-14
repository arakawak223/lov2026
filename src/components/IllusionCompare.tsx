import { useMemo } from 'react'
import { motion } from 'framer-motion'
import IllusionScene from './IllusionScene'
import type { IllusionType } from '../store/gameStore'

interface IllusionCompareProps {
  // Scene A
  typeA: IllusionType
  distanceA: number
  seedA: number
  // Scene B
  typeB: IllusionType
  distanceB: number
  seedB: number
  // State
  mode: 'play' | 'reveal'
  selectedChoice: 'A' | 'B' | null
  correctChoice?: 'A' | 'B'
}

export default function IllusionCompare({
  typeA,
  distanceA,
  seedA,
  typeB,
  distanceB,
  seedB,
  mode,
  selectedChoice,
  correctChoice,
}: IllusionCompareProps) {
  const isReveal = mode === 'reveal'

  // Reference distance = geometric mean of both.
  // Building sizes are normalized so both appear roughly the same angular size on screen.
  const normalizeRef = useMemo(
    () => Math.sqrt(distanceA * distanceB),
    [distanceA, distanceB],
  )

  const getBorderClass = (scene: 'A' | 'B') => {
    if (!isReveal || !correctChoice) return 'border-2 border-gray-700'
    if (scene === correctChoice) return 'border-4 border-green-500 shadow-lg shadow-green-500/30'
    return 'border-4 border-red-500/60'
  }

  const getSelectedBorderClass = (scene: 'A' | 'B') => {
    if (isReveal) return ''
    if (selectedChoice === scene) return 'ring-4 ring-blue-500 ring-offset-2 ring-offset-gray-900'
    return ''
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Scene A */}
      <div className={`relative rounded-2xl overflow-hidden ${getBorderClass('A')} ${getSelectedBorderClass('A')}`}>
        <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white font-bold text-lg w-9 h-9 flex items-center justify-center rounded-full shadow-lg">
          A
        </div>
        <IllusionScene
          illusionType={typeA}
          mode="play"
          targetDistance={distanceA}
          showRuler={false}
          seed={seedA}
          compact
          normalizeToDistance={normalizeRef}
        />
        {isReveal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-center"
          >
            <span className="text-white font-bold text-lg">{distanceA}m</span>
            {correctChoice === 'A' && (
              <span className="ml-2 text-green-400 font-bold">← 近い！</span>
            )}
          </motion.div>
        )}
      </div>

      {/* Scene B */}
      <div className={`relative rounded-2xl overflow-hidden ${getBorderClass('B')} ${getSelectedBorderClass('B')}`}>
        <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white font-bold text-lg w-9 h-9 flex items-center justify-center rounded-full shadow-lg">
          B
        </div>
        <IllusionScene
          illusionType={typeB}
          mode="play"
          targetDistance={distanceB}
          showRuler={false}
          seed={seedB}
          compact
          normalizeToDistance={normalizeRef}
        />
        {isReveal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-center"
          >
            <span className="text-white font-bold text-lg">{distanceB}m</span>
            {correctChoice === 'B' && (
              <span className="ml-2 text-green-400 font-bold">← 近い！</span>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
