import { useState, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { fetchArches, extendGLTFLoader, type ArchAssets } from '../data/stlAssets'
import { getLatestStoragePrefix } from '../lib/patientModels'

interface StlArchesState {
  loading: boolean
  error: string | null
  maxillary: ArchAssets | null
  mandibular: ArchAssets | null
}

/**
 * Carga los arcos (Maxilar / Mandibular) del caso indicado por `storagePrefix`. Si es
 * null (se abrió el visor sin caso), cae al caso más reciente de patient_models. Tras
 * cargar, preloadea los GLB para que la animación de pasos no tenga hipos. Se re-ejecuta
 * cuando cambia el prefijo.
 */
export function useStlArches(storagePrefix: string | null): StlArchesState {
  const [state, setState] = useState<StlArchesState>({
    loading: true,
    error: null,
    maxillary: null,
    mandibular: null,
  })

  useEffect(() => {
    let cancelled = false

    const prefixPromise = storagePrefix
      ? Promise.resolve(storagePrefix)
      : getLatestStoragePrefix()

    prefixPromise
      .then(prefix => {
        if (!prefix) throw new Error('No hay ningún caso cargado todavía')
        return fetchArches(prefix)
      })
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
  }, [storagePrefix])

  return state
}
