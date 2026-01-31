import { useState, useRef, useCallback, useEffect } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastTouchDistance, setLastTouchDistance] = useState(0)

  const MIN_SCALE = 1
  const MAX_SCALE = 4

  const clampPosition = useCallback((pos: { x: number; y: number }, currentScale: number) => {
    if (currentScale <= 1) return { x: 0, y: 0 }

    const container = containerRef.current
    if (!container) return pos

    const maxX = (container.offsetWidth * (currentScale - 1)) / 2
    const maxY = (container.offsetHeight * (currentScale - 1)) / 2

    return {
      x: Math.max(-maxX, Math.min(maxX, pos.x)),
      y: Math.max(-maxY, Math.min(maxY, pos.y)),
    }
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta))
    setScale(newScale)
    setPosition(clampPosition(position, newScale))
  }, [scale, position, clampPosition])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [scale, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const newPos = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }
    setPosition(clampPosition(newPos, scale))
  }, [isDragging, dragStart, scale, clampPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setLastTouchDistance(distance)
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }, [scale, position])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      if (lastTouchDistance > 0) {
        const delta = (distance - lastTouchDistance) * 0.01
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta))
        setScale(newScale)
        setPosition(clampPosition(position, newScale))
      }
      setLastTouchDistance(distance)
    } else if (e.touches.length === 1 && isDragging) {
      const newPos = {
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      }
      setPosition(clampPosition(newPos, scale))
    }
  }, [lastTouchDistance, scale, isDragging, dragStart, position, clampPosition])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setLastTouchDistance(0)
  }, [])

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(2)
    }
  }, [scale])

  const handleZoomIn = () => {
    const newScale = Math.min(MAX_SCALE, scale + 0.5)
    setScale(newScale)
    setPosition(clampPosition(position, newScale))
  }

  const handleZoomOut = () => {
    const newScale = Math.max(MIN_SCALE, scale - 0.5)
    setScale(newScale)
    setPosition(clampPosition(position, newScale))
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center text-white text-xl transition-colors backdrop-blur-sm"
          title="ズームイン"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center text-white text-xl transition-colors backdrop-blur-sm"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center text-white text-sm transition-colors backdrop-blur-sm"
          title="リセット"
        >
          ⟲
        </button>
      </div>

      {/* Zoom Level Indicator */}
      {scale > 1 && (
        <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-16 left-3 z-20 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs space-y-0.5">
        <div>🖱️ ホイール: ズーム</div>
        <div>👆 ダブルクリック: 拡大/リセット</div>
        {scale > 1 && <div>✋ ドラッグ: 移動</div>}
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden shadow-2xl h-[350px] md:h-[450px] cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <motion.div
          animate={{
            scale,
            x: position.x,
            y: position.y,
          }}
          transition={{
            type: isDragging ? 'tween' : 'spring',
            duration: isDragging ? 0 : 0.3,
          }}
          className="w-full h-full"
          style={{ transformOrigin: 'center center' }}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain bg-gray-900"
            draggable={false}
          />

          {/* Target Indicator - scales inversely to stay same visual size */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 / scale }}
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
        </motion.div>

        {/* Question Overlay - fixed at bottom */}
        {children}
      </div>
    </div>
  )
}
