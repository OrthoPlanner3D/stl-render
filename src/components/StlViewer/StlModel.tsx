import { useLoader } from '@react-three/fiber'
import { Mesh, BufferGeometry } from 'three'
import { RetryGLTFLoader } from '../../data/RetryGLTFLoader'
import { extendGLTFLoader } from '../../data/stlAssets'

interface StlModelProps {
  url: string
  color: string
  visible: boolean
}

export default function StlModel({ url, color, visible }: StlModelProps) {
  const gltf = useLoader(RetryGLTFLoader, url, extendGLTFLoader)
  let geometry: BufferGeometry | undefined
  gltf.scene.traverse(child => {
    if (!geometry && (child as Mesh).isMesh) geometry = (child as Mesh).geometry
  })
  return (
    <mesh key={url} geometry={geometry} castShadow receiveShadow visible={visible}>
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
