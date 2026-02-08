import { motion } from 'framer-motion'

interface ZoomableImageProps {
  src: string
  alt: string
  targetPosition: { x: number; y: number }
  children?: React.ReactNode
}

export default function ZoomableImage({
  src,
  alt,
  targetPosition,
  children,
}: ZoomableImageProps) {
  return (
    <div className="relative">
      {/* Image Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[350px] md:h-[450px]">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain bg-gray-900"
          draggable={false}
        />

        {/* Target Indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="absolute"
          style={{
            left: `${targetPosition.x * 100}%`,
            top: `${targetPosition.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute inset-0 w-12 h-12 bg-red-500/30 rounded-full -translate-x-1/2 -translate-y-1/2"
            />
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg">
              🎯
            </div>
          </div>
        </motion.div>

        {/* Question Overlay - fixed at bottom */}
        {children}
      </div>
    </div>
  )
}
