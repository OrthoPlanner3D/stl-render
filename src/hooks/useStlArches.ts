import { useState, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { fetchArches, extendGLTFLoader, type ArchAssets } from '../data/stlAssets'

interface StlArchesState {
  loading: boolean
  error: string | null
  maxillary: ArchAssets | null
  mandibular: ArchAssets | null
}

/**
 * Carga los arcos (Maxilar / Mandibular) desde el bucket vía el endpoint, una vez
 * al montar. Tras cargar, preloadea los GLB para que la animación de pasos no tenga hipos.
 */
export function useStlArches(): StlArchesState {
  const [state, setState] = useState<StlArchesState>({
    loading: true,
    error: null,
    maxillary: null,
    mandibular: null,
  })

  useEffect(() => {
    let cancelled = false
    fetchArches()
      .then(({ maxillary, mandibular }) => {
        if (cancelled) return
        for (const url of [...maxillary.stls, ...mandibular.stls]) {
          useLoader.preload(GLTFLoader, url, extendGLTFLoader)
        }
        setState({ loading: false, error: null, maxillary, mandibular })
      })
      .catch(err => {
        if (cancelled) return
        setState({ loading: false, error: err instanceof Error ? err.message : String(err), maxillary: null, mandibular: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
