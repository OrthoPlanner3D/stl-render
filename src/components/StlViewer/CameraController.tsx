import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

interface CameraControllerProps {
  focusFnRef: React.MutableRefObject<() => void>
  viewFnRef: React.MutableRefObject<(dir: [number, number, number]) => void>
}

export default function CameraController({ focusFnRef, viewFnRef }: CameraControllerProps) {
  const { camera, controls } = useThree()
  const savedPos = useRef<Vector3 | null>(null)
  const savedTarget = useRef<Vector3 | null>(null)
  const animTarget = useRef<Vector3 | null>(null)
  const animating = useRef(false)
  const hasSaved = useRef(false)

  useEffect(() => {
    const ctrl = controls as any
    if (!ctrl || hasSaved.current) return
    const timer = setTimeout(() => {
      savedPos.current = camera.position.clone()
      savedTarget.current = ctrl.target?.clone() ?? new Vector3()

      focusFnRef.current = () => {
        animTarget.current = savedPos.current!.clone()
        ctrl.enabled = false
        animating.current = true
      }

      viewFnRef.current = ([dx, dy, dz]) => {
        if (!savedTarget.current || !savedPos.current) return
        const dist = savedPos.current.distanceTo(savedTarget.current)
        const dir = new Vector3(dx, dy, dz).normalize()
        animTarget.current = savedTarget.current.clone().addScaledVector(dir, dist)
        ctrl.enabled = false
        animating.current = true
      }

      hasSaved.current = true
    }, 2500)
    return () => clearTimeout(timer)
  }, [controls, focusFnRef, viewFnRef, camera])

  useFrame(() => {
    if (!animating.current || !animTarget.current || !savedTarget.current) return
    const ctrl = controls as any
    camera.position.lerp(animTarget.current, 0.1)
    ctrl?.target?.lerp(savedTarget.current, 0.1)
    ctrl?.update?.()
    if (camera.position.distanceTo(animTarget.current) < 0.5) {
      camera.position.copy(animTarget.current)
      ctrl?.target?.copy(savedTarget.current)
      ctrl.enabled = true
      ctrl?.update?.()
      animating.current = false
    }
  })

  return null
}
