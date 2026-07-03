import { useState, useEffect, useCallback } from 'react'
import { useLoader } from '@react-three/fiber'
import { RetryGLTFLoader } from '../data/RetryGLTFLoader'
import { fetchArches, extendGLTFLoader, type ArchAssets } from '../data/stlAssets'
import { getLatestStoragePrefix } from '../lib/patientModels'

interface StlArchesState {
  loading: boolean
  error: string | null
  maxillary: ArchAssets | null
  mandibular: ArchAssets | null
  /** Prefijo del caso efectivamente cargado (útil cuando se resolvió por fallback). */
  prefix: string | null
}

interface StlArches extends StlArchesState {
  /**
   * Reintenta la carga desde cero: re-firma las URLs (nuevos tokens) y vuelve a
   * precargar. Reproduce el auto-arreglo de un reload manual del browser, útil para
   * el botón "Reintentar" del error boundary cuando se agotaron los retries de red.
   */
  reload: () => void
}

/**
 * Carga los arcos (Maxilar / Mandibular) del caso indicado por `storagePrefix`. Si es
 * null (se abrió el visor sin caso), cae al caso más reciente de patient_models. Tras
 * cargar, preloadea los GLB para que la animación de pasos no tenga hipos. La concurrencia
 * de descargas la limita `RetryGLTFLoader` (semáforo global), así que precargar todo de
 * una acá no genera ráfaga real. Se re-ejecuta cuando cambia el prefijo o al llamar `reload()`.
 */
export function useStlArches(storagePrefix: string | null): StlArches {
  const [state, setState] = useState<StlArchesState>({
    loading: true,
    error: null,
    maxillary: null,
    mandibular: null,
    prefix: null,
  })
  // Bumpear el nonce fuerza re-ejecutar el effect => re-firma URLs (tokens nuevos).
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null }))
    setNonce(n => n + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const prefixPromise = storagePrefix
      ? Promise.resolve(storagePrefix)
      : getLatestStoragePrefix()

    prefixPromise
      .then(prefix => {
        if (!prefix) throw new Error('No hay ningún caso cargado todavía')
        return fetchArches(prefix).then(arches => ({ prefix, ...arches }))
      })
      .then(({ prefix, maxillary, mandibular }) => {
        if (cancelled) return
        for (const url of [...maxillary.stls, ...mandibular.stls]) {
          useLoader.preload(RetryGLTFLoader, url, extendGLTFLoader)
        }
        setState({ loading: false, error: null, maxillary, mandibular, prefix })
      })
      .catch(err => {
        if (cancelled) return
        setState({ loading: false, error: err instanceof Error ? err.message : String(err), maxillary: null, mandibular: null, prefix: null })
      })
    return () => {
      cancelled = true
    }
  }, [storagePrefix, nonce])

  return { ...state, reload }
}
