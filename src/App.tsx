import { useState } from 'react'
import { useGameStore } from './store/gameStore'
import type { GameCategory } from './store/gameStore'
import TitleScreen from './components/TitleScreen'
import GameScreen from './components/GameScreen'
import RankingScreen from './components/RankingScreen'
import CollectionScreen from './components/CollectionScreen'
import PlayerNameModal from './components/PlayerNameModal'

function App() {
  const { phase, setPhase, setCategory, playerName, setPlayerName } = useGameStore()
  const [showNameModal, setShowNameModal] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<GameCategory | null>(null)

  const handleSelectCourse = (category: GameCategory) => {
    if (!playerName) {
      setPendingCategory(category)
      setShowNameModal(true)
      return
    }
    setCategory(category)
  }

  const handleNameSubmit = (name: string) => {
    setPlayerName(name)
    setShowNameModal(false)
    if (pendingCategory) {
      setCategory(pendingCategory)
      setPendingCategory(null)
    }
  }

  const handleNameClose = () => {
    setShowNameModal(false)
    if (pendingCategory) {
      setCategory(pendingCategory)
      setPendingCategory(null)
    }
  }

  const handleOpenRanking = () => {
    setPhase('ranking')
  }

  const handleOpenCollection = () => {
    setPhase('collection')
  }

  const handleBackToTitle = () => {
    setPhase('title')
  }

  return (
    <div className="min-h-screen">
      {phase === 'title' ? (
        <TitleScreen
          onSelectCourse={handleSelectCourse}
          onOpenRanking={handleOpenRanking}
          onOpenCollection={handleOpenCollection}
        />
      ) : phase === 'ranking' ? (
        <RankingScreen onBack={handleBackToTitle} />
      ) : phase === 'collection' ? (
        <CollectionScreen onBack={handleBackToTitle} />
      ) : (
        <GameScreen />
      )}
      <PlayerNameModal
        isOpen={showNameModal}
        onSubmit={handleNameSubmit}
        onClose={handleNameClose}
      />
    </div>
  )
}

export default App
