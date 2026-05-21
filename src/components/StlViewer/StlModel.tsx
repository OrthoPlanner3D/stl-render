import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

interface StlModelProps {
  url: string
  color: string
  visible: boolean
}

export default function StlModel({ url, color, visible }: StlModelProps) {
  const geometry = useLoader(STLLoader, url)
  return (
    <mesh key={url} geometry={geometry} castShadow receiveShadow visible={visible}>
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
