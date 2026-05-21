import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useProgress, Html } from '@react-three/drei'
import CameraController from './CameraController'
import StlModel from './StlModel'

interface StlViewerProps {
  maxUrl: string
  manUrl: string
  showMax: boolean
  showMan: boolean
  focusFnRef: React.MutableRefObject<() => void>
  viewFnRef: React.MutableRefObject<(dir: [number, number, number]) => void>
}

function Loader() {
  const { progress } = useProgress()
  return <Html center style={{ color: '#fff', fontSize: 14 }}>{Math.round(progress)}%</Html>
}

export default function StlViewer({ maxUrl, manUrl, showMax, showMan, focusFnRef, viewFnRef }: StlViewerProps) {
  const [adjustCam, setAdjustCam] = useState<number | false>(2)

  useEffect(() => {
    const t = setTimeout(() => setAdjustCam(false), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{ position: 'absolute', inset: 0, cursor: 'grab' }}
      onMouseDown={e => (e.currentTarget.style.cursor = 'grabbing')}
      onMouseUp={e => (e.currentTarget.style.cursor = 'grab')}
      onMouseLeave={e => (e.currentTarget.style.cursor = 'grab')}
    >
      <Canvas shadows frameloop="always" camera={{ fov: 35 }} style={{ height: '100%' }}>
        <Suspense fallback={<Loader />}>
          <Stage environment="city" intensity={0.5} shadows adjustCamera={adjustCam}>
            <CameraController focusFnRef={focusFnRef} viewFnRef={viewFnRef} />
            <StlModel url={maxUrl} color="#a8aaab" visible={showMax} />
            <StlModel url={manUrl} color="#a8aaab" visible={showMan} />
          </Stage>
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.15} />
      </Canvas>
    </div>
  )
}
