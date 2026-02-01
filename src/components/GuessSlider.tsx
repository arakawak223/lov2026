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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-300 flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <motion.span
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-blue-400 min-w-[100px] text-right"
          >
            {formatValue(value)}
          </motion.span>
          <span className="text-gray-400">{unit}</span>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={valueToSlider(value)}
        onChange={handleSliderChange}
        className="w-full h-2 mb-3"
      />

      <div className="flex justify-center gap-1.5 flex-wrap">
        {[
          { delta: -100000, label: '-100km' },
          { delta: -10000, label: '-10km' },
          { delta: -1000, label: '-1000' },
          { delta: -100, label: '-100' },
          { delta: -10, label: '-10' },
          { delta: -1, label: '-1' },
          { delta: 1, label: '+1' },
          { delta: 10, label: '+10' },
          { delta: 100, label: '+100' },
          { delta: 1000, label: '+1000' },
          { delta: 10000, label: '+10km' },
          { delta: 100000, label: '+100km' },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => adjustValue(btn.delta)}
            className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </motion.div>
  )
}
