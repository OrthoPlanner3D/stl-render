import { useState, useEffect } from 'react'
import { getCaseSpacings } from '../lib/patientModels'

/**
 * Lee los spacings interproximales (mm) de un caso a partir de su storagePrefix.
 * Devuelve {} mientras carga, si no hay prefijo, o si falla la consulta. Se
 * re-ejecuta al cambiar el prefijo.
 */
export function useCaseSpacings(storagePrefix: string | null): Record<string, string> {
  const [spacings, setSpacings] = useState<Record<string, string>>({})

  useEffect(() => {
    setSpacings({})
    if (!storagePrefix) return

    let active = true
    getCaseSpacings(storagePrefix)
      .then(s => { if (active) setSpacings(s) })
      .catch(() => { if (active) setSpacings({}) })
    return () => { active = false }
  }, [storagePrefix])

  return spacings
}
