import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GuessSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit: string
  icon: string
}

export default function GuessSlider({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  icon,
}: GuessSliderProps) {
  const logMin = Math.log(min)
  const logMax = Math.log(max)

  const sliderToValue = (sliderValue: number) => {
    const logValue = logMin + (sliderValue / 100) * (logMax - logMin)
    return Math.exp(logValue)
  }

  const valueToSlider = (realValue: number) => {
    const logValue = Math.log(realValue)
    return ((logValue - logMin) / (logMax - logMin)) * 100
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = parseFloat(e.target.value)
    onChange(sliderToValue(sliderValue))
  }

  const adjustValue = (delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta))
    onChange(newValue)
  }

  const formatValue = (val: number) => {
    if (val >= 1000) return val.toFixed(0)
    if (val >= 100) return val.toFixed(0)
    if (val >= 10) return val.toFixed(1)
    return val.toFixed(2)
  }

  // Dial (jog wheel) state
  const dialRef = useRef<HTMLDivElement>(null)
  const [dialAngle, setDialAngle] = useState(0)
  const isDragging = useRef(false)
  const lastAngleRef = useRef(0)
  const accumulatedRef = useRef(0)

  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    const dial = dialRef.current
    if (!dial) return 0
    const rect = dial.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI)
  }, [])

  const applyDialDelta = useCallback((angleDelta: number) => {
    // Each full rotation = scale based on current value magnitude
    const step = Math.max(0.1, Math.pow(10, Math.floor(Math.log10(Math.max(1, value)))) / 10)
    const delta = (angleDelta / 10) * step
    const newValue = Math.max(min, Math.min(max, value + delta))
    onChange(newValue)
  }, [value, min, max, onChange])

  const handleDialStart = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true
    lastAngleRef.current = getAngleFromEvent(clientX, clientY)
    accumulatedRef.current = 0
  }, [getAngleFromEvent])

  const handleDialMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current) return
    const currentAngle = getAngleFromEvent(clientX, clientY)
    let delta = currentAngle - lastAngleRef.current
    // Handle wrap-around
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    setDialAngle(prev => prev + delta)
    applyDialDelta(delta)
    lastAngleRef.current = currentAngle
  }, [getAngleFromEvent, applyDialDelta])

  const handleDialEnd = useCallback(() => {
    isDragging.current = false
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDialMove(e.clientX, e.clientY)
    const onMouseUp = () => handleDialEnd()
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current) e.preventDefault()
      const t = e.touches[0]
      handleDialMove(t.clientX, t.clientY)
    }
    const onTouchEnd = () => handleDialEnd()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [handleDialMove, handleDialEnd])

  // Determine which adjustment buttons to show based on current value
  const getRelevantSteps = () => {
    const steps: { delta: number; label: string }[] = []
    const absVal = Math.max(1, value)

    if (absVal >= 10000) {
      steps.push({ delta: -100000, label: '100km' }, { delta: -10000, label: '10km' })
    }
    if (absVal >= 100) {
      steps.push({ delta: -1000, label: '1km' }, { delta: -100, label: '100m' })
    }
    steps.push({ delta: -10, label: '10m' }, { delta: -1, label: '1m' })

    return steps
  }

  const decreaseSteps = getRelevantSteps()
  const increaseSteps = [...decreaseSteps].reverse().map(s => ({
    delta: -s.delta,
    label: s.label,
  }))

  // Tick marks for dial
  const tickCount = 36
  const ticks = Array.from({ length: tickCount }, (_, i) => i)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-2xl p-5 backdrop-blur-sm border border-gray-700/50"
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
          <span className="text-lg">{icon}</span>
          {label}
        </span>
      </div>

      {/* Central value display + Dial */}
      <div className="flex items-center justify-center gap-6 mb-5">
        {/* Decrease buttons */}
        <div className="flex flex-col gap-1.5 items-end">
          {decreaseSteps.map((btn, i) => {
            const intensity = (decreaseSteps.length - i) / decreaseSteps.length
            return (
              <motion.button
                key={btn.delta}
                whileTap={{ scale: 0.9 }}
                onClick={() => adjustValue(btn.delta)}
                className="group flex items-center gap-1.5 transition-all duration-150"
              >
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors w-10 text-right">
                  {btn.label}
                </span>
                <span
                  className="flex items-center justify-center rounded-lg text-white font-bold transition-all duration-150 hover:brightness-125 active:brightness-150"
                  style={{
                    width: `${28 + intensity * 16}px`,
                    height: `${28 + intensity * 8}px`,
                    fontSize: `${12 + intensity * 4}px`,
                    background: `linear-gradient(135deg, rgba(239,68,68,${0.3 + intensity * 0.5}), rgba(220,38,38,${0.2 + intensity * 0.4}))`,
                    border: `1px solid rgba(239,68,68,${0.2 + intensity * 0.3})`,
                  }}
                >
                  −
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Jog Dial */}
        <div className="flex flex-col items-center">
          <div
            ref={dialRef}
            className="relative w-28 h-28 cursor-grab active:cursor-grabbing select-none touch-none"
            onMouseDown={(e) => handleDialStart(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              const t = e.touches[0]
              handleDialStart(t.clientX, t.clientY)
            }}
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-600/60 bg-gradient-to-b from-gray-700/80 to-gray-800/90 shadow-lg shadow-black/40" />

            {/* Tick marks */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 112">
              {ticks.map((i) => {
                const angle = (i * 360) / tickCount + dialAngle
                const rad = (angle * Math.PI) / 180
                const isMajor = i % 9 === 0
                const r1 = isMajor ? 48 : 50
                const r2 = 54
                const x1 = 56 + r1 * Math.cos(rad)
                const y1 = 56 + r1 * Math.sin(rad)
                const x2 = 56 + r2 * Math.cos(rad)
                const y2 = 56 + r2 * Math.sin(rad)
                return (
                  <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isMajor ? 'rgba(96,165,250,0.8)' : 'rgba(156,163,175,0.3)'}
                    strokeWidth={isMajor ? 2.5 : 1}
                    strokeLinecap="round"
                  />
                )
              })}
            </svg>

            {/* Inner circle with value */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-600/40 flex flex-col items-center justify-center shadow-inner">
              <motion.span
                key={value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-blue-400 leading-none"
              >
                {formatValue(value)}
              </motion.span>
              <span className="text-[11px] text-gray-500 mt-0.5">{unit}</span>
            </div>

            {/* Indicator notch */}
            <div
              className="absolute w-2 h-2 rounded-full bg-blue-400 shadow-md shadow-blue-400/50"
              style={{
                top: '6px',
                left: '50%',
                transform: `translateX(-50%) rotate(${dialAngle}deg)`,
                transformOrigin: '50% 50px',
              }}
            />
          </div>
          <span className="text-[10px] text-gray-500 mt-2 tracking-wider">回して調整</span>
        </div>

        {/* Increase buttons */}
        <div className="flex flex-col gap-1.5 items-start">
          {increaseSteps.map((btn, i) => {
            const intensity = (i + 1) / increaseSteps.length
            return (
              <motion.button
                key={btn.delta}
                whileTap={{ scale: 0.9 }}
                onClick={() => adjustValue(btn.delta)}
                className="group flex items-center gap-1.5 transition-all duration-150"
              >
                <span
                  className="flex items-center justify-center rounded-lg text-white font-bold transition-all duration-150 hover:brightness-125 active:brightness-150"
                  style={{
                    width: `${28 + intensity * 16}px`,
                    height: `${28 + intensity * 8}px`,
                    fontSize: `${12 + intensity * 4}px`,
                    background: `linear-gradient(135deg, rgba(59,130,246,${0.3 + intensity * 0.5}), rgba(37,99,235,${0.2 + intensity * 0.4}))`,
                    border: `1px solid rgba(59,130,246,${0.2 + intensity * 0.3})`,
                  }}
                >
                  +
                </span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors w-10 text-left">
                  {btn.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Slider */}
      <div className="relative mb-2">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={valueToSlider(value)}
          onChange={handleSliderChange}
          className="w-full h-1.5 appearance-none bg-gray-700 rounded-full outline-none
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-blue-500/30
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500
            [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-[10px] text-gray-600">
        <span>{min}{unit}</span>
        <span>{max >= 1000 ? `${(max/1000).toFixed(0)}km` : `${max}${unit}`}</span>
      </div>
    </motion.div>
  )
}
