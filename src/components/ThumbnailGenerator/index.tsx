import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

interface ThumbnailGeneratorProps {
  urls: string[]
  onCapture: (url: string, dataUrl: string) => void
}

function ThumbnailFrame({ url, onCapture }: { url: string; onCapture: (dataUrl: string) => void }) {
  const geometry = useLoader(STLLoader, url)
  const { camera, invalidate } = useThree()
  const capturedRef = useRef(false)

  useEffect(() => {
    geometry.computeBoundingSphere()
    const r = geometry.boundingSphere!.radius
    camera.position.set(r * 1.5, r * 0.5, r * 2.5)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    invalidate()
  }, [geometry, camera, invalidate])

  useFrame(({ gl, scene, camera }) => {
    if (capturedRef.current) return
    capturedRef.current = true
    gl.render(scene, camera)
    onCapture(gl.domElement.toDataURL('image/jpeg', 0.75))
  })

  return (
    <>
      <color attach="background" args={[0x111111]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 4]} intensity={1} />
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#a8aaab" />
      </mesh>
    </>
  )
}

export default function ThumbnailGenerator({ urls, onCapture }: ThumbnailGeneratorProps) {
  const capturedUrls = useRef(new Set<string>())
  const nextUrl = urls.find(u => !capturedUrls.current.has(u))
  if (!nextUrl) return null

  return (
    <div style={{
      position: 'fixed', left: -200, top: 0,
      width: 64, height: 64,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      <Canvas frameloop="demand" camera={{ fov: 35 }} gl={{ preserveDrawingBuffer: true, antialias: false }}>
        <Suspense fallback={null}>
          <ThumbnailFrame
            key={nextUrl}
            url={nextUrl}
            onCapture={(dataUrl) => {
              capturedUrls.current.add(nextUrl)
              onCapture(nextUrl, dataUrl)
            }}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
