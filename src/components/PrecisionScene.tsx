import { useRef, useEffect, useState } from 'react'

interface PrecisionSceneProps {
  scenario: PrecisionScenario
  showTarget?: boolean
}

export interface PrecisionScenario {
  id: string
  name: string
  description: string
  targetDistance: number
  cameraHeight: number
  objects: SceneObject[]
  groundType: 'grass' | 'asphalt' | 'concrete'
}

interface SceneObject {
  type: 'person' | 'car' | 'tree' | 'building' | 'lamppost' | 'bench' | 'target'
  distance: number
  xOffset: number
  label?: string
}

const OBJECT_SIZES: Record<string, { width: number; height: number }> = {
  person: { width: 0.5, height: 1.7 },
  car: { width: 4.5, height: 1.5 },
  tree: { width: 4, height: 6 },
  building: { width: 15, height: 12 },
  lamppost: { width: 0.5, height: 4 },
  bench: { width: 1.5, height: 0.8 },
  target: { width: 2, height: 2 },
}

// Using emoji for realistic recognizable icons
const OBJECT_EMOJI: Record<string, string> = {
  person: '🧍',
  car: '🚗',
  tree: '🌳',
  building: '🏢',
  lamppost: '🏮',
  bench: '🪑',
  target: '🎯',
}

const GROUND_COLORS: Record<string, { base: string; dark: string }> = {
  grass: { base: '#4ade80', dark: '#22c55e' },
  asphalt: { base: '#6b7280', dark: '#4b5563' },
  concrete: { base: '#d1d5db', dark: '#9ca3af' },
}

function calculateApparentSize(
  realSize: { width: number; height: number },
  distance: number,
  canvasHeight: number
): { width: number; height: number } {
  const fovRad = (60 * Math.PI) / 180
  const viewDistance = canvasHeight / (2 * Math.tan(fovRad / 2))
  const scale = viewDistance / (distance + 1)
  return {
    width: realSize.width * scale,
    height: realSize.height * scale,
  }
}

function calculateYPosition(distance: number, canvasHeight: number): number {
  const maxDistance = 150
  const normalizedDistance = Math.min(distance / maxDistance, 1)
  const horizonY = canvasHeight * 0.35
  const groundY = canvasHeight * 0.92
  const t = 1 - Math.pow(normalizedDistance, 0.5)
  return horizonY + (groundY - horizonY) * t
}

export default function PrecisionScene({ scenario, showTarget = true }: PrecisionSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = dimensions
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.4)
    skyGradient.addColorStop(0, '#0ea5e9')
    skyGradient.addColorStop(1, '#7dd3fc')
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, width, height * 0.4)

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    drawCloud(ctx, width * 0.15, height * 0.12, 40)
    drawCloud(ctx, width * 0.5, height * 0.08, 50)
    drawCloud(ctx, width * 0.8, height * 0.15, 35)

    // Ground
    const groundColors = GROUND_COLORS[scenario.groundType]
    const groundGradient = ctx.createLinearGradient(0, height * 0.35, 0, height)
    groundGradient.addColorStop(0, groundColors.dark)
    groundGradient.addColorStop(1, groundColors.base)
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, height * 0.35, width, height * 0.65)

    // Perspective grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    for (let d = 10; d <= 100; d += 10) {
      const y = calculateYPosition(d, height)
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Distance markers on the right
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.font = 'bold 11px Arial'
    for (let d = 10; d <= 100; d += 10) {
      const y = calculateYPosition(d, height)
      ctx.fillText(`${d}m`, width - 28, y + 4)
    }

    // Sort objects by distance (far to near)
    const sortedObjects = [...scenario.objects].sort((a, b) => b.distance - a.distance)

    // Draw objects
    sortedObjects.forEach((obj) => {
      if (obj.type === 'target' && !showTarget) return

      const size = OBJECT_SIZES[obj.type]
      const apparent = calculateApparentSize(size, obj.distance, height)
      const y = calculateYPosition(obj.distance, height)
      const x = width / 2 + obj.xOffset * (height / (obj.distance + 5)) * 3

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.beginPath()
      ctx.ellipse(x, y + 2, apparent.width * 0.4, apparent.height * 0.08, 0, 0, Math.PI * 2)
      ctx.fill()

      // Draw emoji
      const emoji = OBJECT_EMOJI[obj.type]
      const fontSize = Math.max(12, Math.min(80, apparent.height * 1.2))
      ctx.font = `${fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(emoji, x, y)
    })

    // Reference info box
    const boxWidth = 220
    const boxHeight = 70
    const boxX = 10
    const boxY = height - boxHeight - 10

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    ctx.beginPath()
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 13px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('📏 参照サイズ', boxX + 12, boxY + 10)

    ctx.font = '12px Arial'
    ctx.fillStyle = '#e5e7eb'
    ctx.fillText('🧍 人: 1.7m', boxX + 12, boxY + 30)
    ctx.fillText('🚗 車: 4.5m (全長)', boxX + 12, boxY + 48)
    ctx.fillText('🏮 街灯: 4m', boxX + 120, boxY + 30)
    ctx.fillText('🌳 木: 6m', boxX + 120, boxY + 48)

    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

  }, [scenario, showTarget, dimensions])

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-sky-200 relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  )
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
  ctx.arc(x + size * 0.35, y - size * 0.1, size * 0.4, 0, Math.PI * 2)
  ctx.arc(x + size * 0.7, y, size * 0.45, 0, Math.PI * 2)
  ctx.arc(x + size * 0.35, y + size * 0.15, size * 0.35, 0, Math.PI * 2)
  ctx.fill()
}

export const PRECISION_SCENARIOS: PrecisionScenario[] = [
  {
    id: 'street-building-30m',
    name: '街路から建物まで',
    description: '道路脇に立って、奥の建物までの距離を推定',
    targetDistance: 30,
    cameraHeight: 1.7,
    groundType: 'asphalt',
    objects: [
      { type: 'person', distance: 5, xOffset: -3 },
      { type: 'car', distance: 8, xOffset: 2 },
      { type: 'lamppost', distance: 10, xOffset: -5 },
      { type: 'person', distance: 15, xOffset: 1 },
      { type: 'lamppost', distance: 20, xOffset: -5 },
      { type: 'car', distance: 22, xOffset: -2 },
      { type: 'building', distance: 30, xOffset: 0 },
      { type: 'target', distance: 30, xOffset: 0 },
    ],
  },
  {
    id: 'park-tree-50m',
    name: '公園の木まで',
    description: 'ベンチのある公園で、奥の大きな木までの距離を推定',
    targetDistance: 50,
    cameraHeight: 1.7,
    groundType: 'grass',
    objects: [
      { type: 'bench', distance: 3, xOffset: -2 },
      { type: 'person', distance: 8, xOffset: 1 },
      { type: 'person', distance: 12, xOffset: -1 },
      { type: 'lamppost', distance: 15, xOffset: -4 },
      { type: 'tree', distance: 25, xOffset: 4 },
      { type: 'person', distance: 30, xOffset: -2 },
      { type: 'tree', distance: 50, xOffset: 0 },
      { type: 'target', distance: 50, xOffset: 0 },
    ],
  },
  {
    id: 'tower-100m',
    name: '遠くの建物まで',
    description: '道路沿いの建物までの距離を推定',
    targetDistance: 100,
    cameraHeight: 1.7,
    groundType: 'concrete',
    objects: [
      { type: 'car', distance: 10, xOffset: -2 },
      { type: 'person', distance: 15, xOffset: 3 },
      { type: 'lamppost', distance: 20, xOffset: -5 },
      { type: 'car', distance: 25, xOffset: 2 },
      { type: 'lamppost', distance: 40, xOffset: -5 },
      { type: 'tree', distance: 50, xOffset: 5 },
      { type: 'lamppost', distance: 60, xOffset: -5 },
      { type: 'car', distance: 70, xOffset: -1 },
      { type: 'building', distance: 100, xOffset: 0 },
      { type: 'target', distance: 100, xOffset: 0 },
    ],
  },
  {
    id: 'cars-row-20m',
    name: '駐車場の奥まで',
    description: '並んだ車を参考に、奥の建物までの距離を推定',
    targetDistance: 20,
    cameraHeight: 1.7,
    groundType: 'asphalt',
    objects: [
      { type: 'car', distance: 5, xOffset: -3 },
      { type: 'car', distance: 5, xOffset: 3 },
      { type: 'person', distance: 7, xOffset: 0 },
      { type: 'car', distance: 10, xOffset: -3 },
      { type: 'car', distance: 10, xOffset: 3 },
      { type: 'car', distance: 15, xOffset: -3 },
      { type: 'car', distance: 15, xOffset: 3 },
      { type: 'building', distance: 20, xOffset: 0 },
      { type: 'target', distance: 20, xOffset: 0 },
    ],
  },
  {
    id: 'people-line-15m',
    name: '行列の先頭まで',
    description: '並んでいる人々の先頭までの距離を推定',
    targetDistance: 15,
    cameraHeight: 1.7,
    groundType: 'concrete',
    objects: [
      { type: 'person', distance: 3, xOffset: 0 },
      { type: 'person', distance: 5, xOffset: 0.3 },
      { type: 'person', distance: 7, xOffset: -0.2 },
      { type: 'person', distance: 9, xOffset: 0.1 },
      { type: 'person', distance: 11, xOffset: -0.1 },
      { type: 'person', distance: 13, xOffset: 0.2 },
      { type: 'lamppost', distance: 8, xOffset: -4 },
      { type: 'building', distance: 15, xOffset: 0 },
      { type: 'target', distance: 15, xOffset: 0 },
    ],
  },
]
