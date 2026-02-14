import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { IllusionType } from '../store/gameStore'

interface IllusionConfig {
  illusionType: IllusionType
  label: string
  fov: number
  fogNear: number
  fogFar: number
  fogColor: string
  targetDistance: number
  targetHeight: number
  targetWidth: number
  surroundingScale: number
  surroundingCount: number
  ambientIntensity: number
  directionalIntensity: number
  lightDirection: [number, number, number]
  slopeAngle: number
  gridSpacing: number
  cameraY: number
}

export const ILLUSION_CONFIGS: Record<IllusionType, IllusionConfig> = {
  perspective: {
    illusionType: 'perspective',
    label: '遠近法の罠',
    fov: 120,
    fogNear: 500,
    fogFar: 1000,
    fogColor: '#1a1a2e',
    targetDistance: 200,
    targetHeight: 30,
    targetWidth: 15,
    surroundingScale: 1,
    surroundingCount: 20,
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    lightDirection: [50, 80, 30],
    slopeAngle: 0,
    gridSpacing: 10,
    cameraY: 1.7,
  },
  atmospheric: {
    illusionType: 'atmospheric',
    label: '大気透視の罠',
    fov: 60,
    fogNear: 50,
    fogFar: 200,
    fogColor: '#8899aa',
    targetDistance: 150,
    targetHeight: 25,
    targetWidth: 12,
    surroundingScale: 1,
    surroundingCount: 15,
    ambientIntensity: 0.6,
    directionalIntensity: 0.5,
    lightDirection: [30, 60, 20],
    slopeAngle: 0,
    gridSpacing: 10,
    cameraY: 1.7,
  },
  texture: {
    illusionType: 'texture',
    label: 'きめ勾配の罠',
    fov: 60,
    fogNear: 400,
    fogFar: 800,
    fogColor: '#1a1a2e',
    targetDistance: 120,
    targetHeight: 20,
    targetWidth: 10,
    surroundingScale: 1,
    surroundingCount: 12,
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    lightDirection: [50, 80, 30],
    slopeAngle: 0,
    gridSpacing: 40,
    cameraY: 1.7,
  },
  occlusion: {
    illusionType: 'occlusion',
    label: '重なりの罠',
    fov: 60,
    fogNear: 500,
    fogFar: 1000,
    fogColor: '#1a1a2e',
    targetDistance: 300,
    targetHeight: 35,
    targetWidth: 15,
    surroundingScale: 1,
    surroundingCount: 25,
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    lightDirection: [50, 80, 30],
    slopeAngle: 0,
    gridSpacing: 10,
    cameraY: 1.7,
  },
  size: {
    illusionType: 'size',
    label: 'サイズ対比の罠',
    fov: 60,
    fogNear: 400,
    fogFar: 800,
    fogColor: '#1a1a2e',
    targetDistance: 80,
    targetHeight: 10,
    targetWidth: 6,
    surroundingScale: 3,
    surroundingCount: 12,
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    lightDirection: [50, 80, 30],
    slopeAngle: 0,
    gridSpacing: 10,
    cameraY: 1.7,
  },
  shadow: {
    illusionType: 'shadow',
    label: '陰影の罠',
    fov: 60,
    fogNear: 400,
    fogFar: 800,
    fogColor: '#1a1a2e',
    targetDistance: 180,
    targetHeight: 28,
    targetWidth: 14,
    surroundingScale: 1,
    surroundingCount: 18,
    ambientIntensity: 0.15,
    directionalIntensity: 1.5,
    lightDirection: [-80, 20, -50],
    slopeAngle: 0,
    gridSpacing: 10,
    cameraY: 1.7,
  },
  vertical: {
    illusionType: 'vertical',
    label: '垂直位置の罠',
    fov: 60,
    fogNear: 400,
    fogFar: 800,
    fogColor: '#1a1a2e',
    targetDistance: 250,
    targetHeight: 30,
    targetWidth: 15,
    surroundingScale: 1,
    surroundingCount: 18,
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    lightDirection: [50, 80, 30],
    slopeAngle: 3,
    gridSpacing: 10,
    cameraY: 1.7,
  },
}

// Seeded random for deterministic building placement
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface BuildingData {
  x: number
  z: number
  width: number
  depth: number
  height: number
  color: string
}

function generateBuildings(config: IllusionConfig, seed?: number): BuildingData[] {
  const rand = seededRandom(seed ?? (config.illusionType.length * 137 + config.targetDistance))
  const buildings: BuildingData[] = []
  const grayColors = ['#4a5568', '#2d3748', '#4a5568', '#374151', '#1f2937', '#6b7280']

  for (let i = 0; i < config.surroundingCount; i++) {
    const side = rand() > 0.5 ? 1 : -1
    const xSpread = config.illusionType === 'occlusion' ? 25 : 40
    let x = side * (8 + rand() * xSpread)
    const z = -(20 + rand() * (config.targetDistance * 1.2))
    const baseHeight = 15 + rand() * 30
    const height = baseHeight * config.surroundingScale
    const width = 8 + rand() * 12
    const depth = 8 + rand() * 12

    // For occlusion: place some buildings closer to center to partially block target
    // but ensure a gap so the red building is always at least partially visible
    if (config.illusionType === 'occlusion' && i < 5) {
      const minGap = 3 // inner edge must be at least 3m from center
      x = side * (width / 2 + minGap + rand() * 8)
    }

    buildings.push({
      x,
      z,
      width,
      depth,
      height,
      color: grayColors[Math.floor(rand() * grayColors.length)],
    })
  }

  return buildings
}

function Building({ data }: { data: BuildingData }) {
  return (
    <mesh position={[data.x, data.height / 2, data.z]}>
      <boxGeometry args={[data.width, data.height, data.depth]} />
      <meshStandardMaterial color={data.color} />
    </mesh>
  )
}

function TargetBuilding({ config }: { config: IllusionConfig }) {
  // Slightly boosted emissive for shadow so it's visible but still dark
  const emissiveIntensity = config.illusionType === 'shadow' ? 0.55 : 0.3
  return (
    <mesh position={[0, config.targetHeight / 2, -config.targetDistance]}>
      <boxGeometry args={[config.targetWidth, config.targetHeight, config.targetWidth * 0.8]} />
      <meshStandardMaterial
        color="#ef4444"
        emissive="#ff0000"
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
}

function Ground({ config }: { config: IllusionConfig }) {
  const rotation = useMemo(() => {
    const slopeRad = (config.slopeAngle * Math.PI) / 180
    return new THREE.Euler(-Math.PI / 2 + slopeRad, 0, 0)
  }, [config.slopeAngle])

  return (
    <group>
      <mesh rotation={rotation} position={[0, -0.01, -200]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <gridHelper
        args={[600, 600 / config.gridSpacing, '#2a2a4e', '#2a2a4e']}
        position={[0, 0, -200]}
        rotation={new THREE.Euler(0, 0, config.slopeAngle * Math.PI / 180)}
      />
    </group>
  )
}

function FogController({ config }: { config: IllusionConfig }) {
  const { scene } = useThree()

  useMemo(() => {
    scene.fog = new THREE.Fog(config.fogColor, config.fogNear, config.fogFar)
    scene.background = new THREE.Color(config.fogColor)
  }, [scene, config])

  return null
}

// Play mode camera: fixed first-person view
function PlayCamera({ config }: { config: IllusionConfig }) {
  return (
    <PerspectiveCamera
      makeDefault
      position={[0, config.cameraY, 0]}
      fov={config.fov}
      near={0.1}
      far={2000}
      rotation={[0, 0, 0]}
    />
  )
}

// Reveal mode: camera sweeps to overhead then shows distance lines
function RevealCamera({ config, onComplete }: { config: IllusionConfig; onComplete?: () => void }) {
  const { camera } = useThree()
  const timeRef = useRef(0)
  const completeCalled = useRef(false)
  const startPos = useRef(new THREE.Vector3(0, config.cameraY, 0))

  const overheadY = Math.max(config.targetDistance * 0.6, 80)
  const overheadZ = -config.targetDistance * 0.4

  useFrame((_, delta) => {
    timeRef.current += delta
    const t = Math.min(timeRef.current / 2.5, 1)
    const ease = 1 - Math.pow(1 - t, 3)

    camera.position.x = THREE.MathUtils.lerp(startPos.current.x, 30, ease)
    camera.position.y = THREE.MathUtils.lerp(startPos.current.y, overheadY, ease)
    camera.position.z = THREE.MathUtils.lerp(startPos.current.z, overheadZ, ease)

    camera.lookAt(0, 0, -config.targetDistance * 0.5)

    if (t >= 1 && !completeCalled.current) {
      completeCalled.current = true
      if (onComplete) {
        setTimeout(onComplete, 2000)
      }
    }
  })

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, config.cameraY, 0]}
      fov={50}
      near={0.1}
      far={2000}
    />
  )
}

function RevealDistanceLines({
  correctDistance,
  guessedDistance,
}: {
  correctDistance: number
  guessedDistance: number
}) {
  const [progress, setProgress] = useState(0)

  useFrame((_, delta) => {
    if (progress < 1) {
      setProgress((p) => Math.min(1, p + delta * 0.5))
    }
  })

  const correctZ = -correctDistance * progress
  const guessedZ = -guessedDistance * progress

  const correctPoints: [number, number, number][] = [[0, 0.5, 0], [0, 0.5, correctZ]]
  const guessedPoints: [number, number, number][] = [[2, 0.5, 0], [2, 0.5, guessedZ]]

  return (
    <group>
      <Line points={correctPoints} color="#10B981" lineWidth={3} />
      {progress > 0.3 && (
        <Text
          position={[0, 5, correctZ / 2]}
          fontSize={4}
          color="#10B981"
          anchorX="center"
        >
          {`正解: ${correctDistance}m`}
        </Text>
      )}
      {progress >= 1 && (
        <mesh position={[0, 0.5, correctZ]}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
      )}

      <Line points={guessedPoints} color="#3B82F6" lineWidth={3} />
      {progress > 0.3 && (
        <Text
          position={[2, 5, guessedZ / 2]}
          fontSize={4}
          color="#3B82F6"
          anchorX="center"
        >
          {`あなた: ${guessedDistance.toFixed(1)}m`}
        </Text>
      )}
      {progress >= 1 && (
        <mesh position={[2, 0.5, guessedZ]}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial color="#3B82F6" />
        </mesh>
      )}
    </group>
  )
}

function DistanceRuler({ maxDistance }: { maxDistance: number }) {
  const step = 50
  const count = Math.ceil(maxDistance / step) + 2
  const indices = Array.from({ length: count }, (_, i) => i + 1)

  return (
    <group>
      {indices.map((i) => {
        const z = -i * step
        const dist = i * step
        return (
          <group key={i} position={[15, 0, z]}>
            {/* Thin vertical pole */}
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
              <meshStandardMaterial color="#fbbf24" />
            </mesh>
            {/* Distance label */}
            <Text
              position={[0, 3.5, 0]}
              fontSize={1.5}
              color="#fbbf24"
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.08}
              outlineColor="#000000"
            >
              {`${dist}m`}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

function CityScene({
  config,
  mode,
  guessedDistance,
  onComplete,
  showRuler,
  seed,
}: {
  config: IllusionConfig
  mode: 'play' | 'reveal'
  guessedDistance?: number
  onComplete?: () => void
  showRuler?: boolean
  seed?: number
}) {
  const buildings = useMemo(() => generateBuildings(config, seed), [config, seed])

  return (
    <>
      {mode === 'play' ? (
        <PlayCamera config={config} />
      ) : (
        <RevealCamera config={config} onComplete={onComplete} />
      )}

      <FogController config={config} />

      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={config.lightDirection}
        intensity={config.directionalIntensity}
        castShadow
      />

      <Ground config={config} />
      <TargetBuilding config={config} />

      {buildings.map((b, i) => (
        <Building key={i} data={b} />
      ))}

      {showRuler && mode === 'play' && (
        <DistanceRuler maxDistance={config.targetDistance} />
      )}

      {/* Player position marker */}
      <mesh position={[0, 0.05, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
      </mesh>

      {mode === 'reveal' && guessedDistance !== undefined && (
        <RevealDistanceLines
          correctDistance={config.targetDistance}
          guessedDistance={guessedDistance}
        />
      )}
    </>
  )
}

interface IllusionSceneProps {
  illusionType: IllusionType
  mode: 'play' | 'reveal'
  guessedDistance?: number
  onComplete?: () => void
  targetDistance?: number
  showRuler?: boolean
  seed?: number
  compact?: boolean
  /** Reference distance for normalizing the red building's apparent size.
   *  When set, the building is physically scaled so its on-screen size
   *  matches what it would look like at this reference distance. */
  normalizeToDistance?: number
}

export default function IllusionScene({
  illusionType,
  mode,
  guessedDistance,
  onComplete,
  targetDistance,
  showRuler,
  seed,
  compact,
  normalizeToDistance,
}: IllusionSceneProps) {
  const baseConfig = ILLUSION_CONFIGS[illusionType]
  // Override targetDistance; adapt fog per illusion type to keep the effect strong
  // while ensuring the red building stays barely visible
  const config = useMemo(() => {
    if (targetDistance == null) return baseConfig
    const dist = targetDistance

    // Normalize building size so apparent (angular) size is consistent
    // apparent_size ∝ physical_size / distance
    // To match refDist: scale = dist / refDist
    const refDist = normalizeToDistance ?? baseConfig.targetDistance
    const sizeScale = dist / refDist
    const tgtHeight = baseConfig.targetHeight * sizeScale
    const tgtWidth = baseConfig.targetWidth * sizeScale

    if (illusionType === 'atmospheric') {
      return {
        ...baseConfig,
        targetDistance: dist,
        targetHeight: tgtHeight,
        targetWidth: tgtWidth,
        fogNear: dist * 0.15,
        fogFar: dist * 1.15,
      }
    }
    if (illusionType === 'shadow') {
      return {
        ...baseConfig,
        targetDistance: dist,
        targetHeight: tgtHeight,
        targetWidth: tgtWidth,
        fogFar: Math.max(baseConfig.fogFar, dist * 1.3),
      }
    }
    const fogScale = dist / baseConfig.targetDistance
    return {
      ...baseConfig,
      targetDistance: dist,
      targetHeight: tgtHeight,
      targetWidth: tgtWidth,
      fogNear: baseConfig.fogNear * fogScale,
      fogFar: Math.max(baseConfig.fogFar * fogScale, dist * 1.3),
    }
  }, [baseConfig, targetDistance, illusionType, normalizeToDistance])

  return (
    <div className={`w-full ${compact ? 'h-[250px] md:h-[350px]' : 'h-[500px]'} rounded-2xl overflow-hidden relative`}>
      <Canvas>
        <CityScene
          config={config}
          mode={mode}
          guessedDistance={guessedDistance}
          onComplete={onComplete}
          showRuler={showRuler}
          seed={seed}
        />
      </Canvas>
      {mode === 'play' && (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg">
          {config.label}
        </div>
      )}
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-500/50">
        PLATEAU inspired
      </div>
    </div>
  )
}
