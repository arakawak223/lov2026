
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PlayerNameModalProps {
  isOpen: boolean
  onSubmit: (name: string) => void
  onClose: () => void
}

export default function PlayerNameModal({ isOpen, onSubmit, onClose }: PlayerNameModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      setError('ニックネームを入力してください')
      return
    }
    if (trimmed.length > 12) {
      setError('12文字以内で入力してください')
      return
    }
    setError('')
    onSubmit(trimmed)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-2 text-center">
              ニックネーム設定
            </h2>
            <p className="text-gray-400 text-sm text-center mb-4">
              ランキングに表示される名前を入力してください
            </p>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="12文字以内"
              maxLength={12}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors mb-1"
              autoFocus
            />

            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-500">{name.length}/12</span>
              {error && <span className="text-xs text-red-400">{error}</span>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 transition-colors"
              >
                スキップ
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all"
              >
                決定
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
