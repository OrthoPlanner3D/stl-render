import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Mesh, BufferGeometry } from 'three'

interface StlModelProps {
  url: string
  color: string
  visible: boolean
}

export default function StlModel({ url, color, visible }: StlModelProps) {
  const gltf = useLoader(GLTFLoader, url)
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
