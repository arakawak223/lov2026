import { useGameStore, DEMO_STAGES } from './store/gameStore'
import TitleScreen from './components/TitleScreen'
import GameScreen from './components/GameScreen'

function App() {
  const { phase, setPhase, setStage } = useGameStore()

  const handleStart = () => {
    setStage(DEMO_STAGES[0])
    setPhase('input')
  }

  return (
    <div className="min-h-screen">
      {phase === 'title' ? (
        <TitleScreen onStart={handleStart} />
      ) : (
        <GameScreen />
      )}
    </div>
  )
}

export default App
