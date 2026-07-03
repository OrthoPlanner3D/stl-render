import { useState, useEffect } from 'react'
import { getCaseIpr } from '../lib/patientModels'

/**
 * Lee los IPR interproximales (mm) de un caso a partir de su storagePrefix.
 * Devuelve {} mientras carga, si no hay prefijo, o si falla la consulta. Se
 * re-ejecuta al cambiar el prefijo.
 */
export function useCaseIpr(storagePrefix: string | null): Record<string, string> {
  const [ipr, setIpr] = useState<Record<string, string>>({})

  useEffect(() => {
    setIpr({})
    if (!storagePrefix) return

    let active = true
    getCaseIpr(storagePrefix)
      .then(s => { if (active) setIpr(s) })
      .catch(() => { if (active) setIpr({}) })
    return () => { active = false }
  }, [storagePrefix])

  return ipr
}
