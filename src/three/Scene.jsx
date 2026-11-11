import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import Experience from './Experience'

/**
 * The single, persistent WebGL canvas. It sits fixed behind the HTML content
 * for the whole page; scroll moves the camera rather than the canvas.
 */
export default function Scene({ profile }) {
  const [dpr, setDpr] = useState(profile.maxDpr)

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, dpr]}
        frameloop={profile.reducedMotion ? 'demand' : 'always'}
        gl={{
          antialias: profile.tier === 'high',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        camera={{ fov: 38, near: 0.1, far: 240, position: [0.4, 0.5, 8.6] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
        }}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr(profile.minDpr)}
          onIncline={() => setDpr(profile.maxDpr)}
          onFallback={() => setDpr(profile.minDpr)}
        />
        <Suspense fallback={null}>
          <Experience profile={profile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
