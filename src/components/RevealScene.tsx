import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, PerspectiveCamera, Line } from '@react-three/drei'
import * as THREE from 'three'

interface RevealSceneProps {
  imageUrl: string
  correctDistance: number
  guessedDistance: number
  correctHeight?: number
  guessedHeight?: number
  onComplete: () => void
}

function ImagePlane({ imageUrl }: { imageUrl: string }) {
  const texture = useRef<THREE.Texture | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(imageUrl, (tex) => {
      texture.current = tex
      setLoaded(true)
    })
  }, [imageUrl])

  if (!loaded || !texture.current) return null

  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[16, 9]} />
      <meshBasicMaterial map={texture.current} />
    </mesh>
  )
}

function DistanceLine({
  distance,
  color,
  yOffset,
  label,
}: {
  distance: number
  color: string
  yOffset: number
  label: string
}) {
  const [progress, setProgress] = useState(0)

  useFrame((_, delta) => {
    if (progress < 1) {
      setProgress((p) => Math.min(1, p + delta * 0.8))
    }
  })

  const scaledDistance = Math.min(distance / 100, 8)
  const currentLength = scaledDistance * progress

  const points: [number, number, number][] = [
    [0, yOffset, 0],
    [0, yOffset, -currentLength],
  ]

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={3}
      />
      {progress > 0.5 && (
        <Text
          position={[0.5, yOffset + 0.3, -currentLength / 2]}
          fontSize={0.3}
          color={color}
          anchorX="left"
        >
          {label}: {distance.toFixed(1)}m
        </Text>
      )}
      {progress >= 1 && (
        <mesh position={[0, yOffset, -scaledDistance]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  )
}

function CameraController({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree()
  const [phase, setPhase] = useState<'orbit' | 'settle' | 'done'>('orbit')
  const timeRef = useRef(0)
  const completeCalled = useRef(false)

  useFrame((_, delta) => {
    timeRef.current += delta

    if (phase === 'orbit' && timeRef.current < 3) {
      const angle = (timeRef.current / 3) * Math.PI * 0.4
      const radius = 8
      camera.position.x = Math.sin(angle) * radius
      camera.position.z = Math.cos(angle) * radius - 2
      camera.position.y = 2 + Math.sin(timeRef.current) * 0.5
      camera.lookAt(0, 0, -4)
    } else if (phase === 'orbit') {
      setPhase('settle')
      timeRef.current = 0
    }

    if (phase === 'settle') {
      const t = Math.min(timeRef.current / 1.5, 1)
      const easeOut = 1 - Math.pow(1 - t, 3)

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 5, easeOut * 0.1)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 3, easeOut * 0.1)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2, easeOut * 0.1)
      camera.lookAt(0, 0, -4)

      if (t >= 1 && !completeCalled.current) {
        completeCalled.current = true
        setPhase('done')
        setTimeout(onComplete, 1500)
      }
    }
  })

  return null
}

function Scene({
  imageUrl,
  correctDistance,
  guessedDistance,
  onComplete,
}: RevealSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 6]} fov={60} />
      <CameraController onComplete={onComplete} />

      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <ImagePlane imageUrl={imageUrl} />

      <DistanceLine
        distance={correctDistance}
        color="#10B981"
        yOffset={0}
        label="正解"
      />

      <DistanceLine
        distance={guessedDistance}
        color="#3B82F6"
        yOffset={-0.5}
        label="あなた"
      />

      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>

      <gridHelper args={[20, 20, '#374151', '#374151']} position={[0, -0.99, 0]} />
    </>
  )
}

export default function RevealScene(props: RevealSceneProps) {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden">
      <Canvas>
        <Scene {...props} />
      </Canvas>
    </div>
  )
}
