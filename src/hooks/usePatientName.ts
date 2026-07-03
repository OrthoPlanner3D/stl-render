import { useState, useEffect } from 'react'
import { getPatientById, patientLabel } from '../lib/patients'

/**
 * Deriva el nombre del paciente a partir del storagePrefix del caso. El prefijo tiene
 * la forma `<patientId>/<uuid>/`, así que el primer segmento es el id del paciente.
 * Devuelve null mientras carga, si el prefijo no trae un id válido, o si falla la consulta.
 */
export function usePatientName(storagePrefix: string | null): string | null {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    setName(null)
    if (!storagePrefix) return

    const id = Number(storagePrefix.split('/')[0])
    if (!Number.isFinite(id)) return

    let active = true
    getPatientById(id)
      .then(p => { if (active) setName(p ? patientLabel(p) : null) })
      .catch(() => { if (active) setName(null) })
    return () => { active = false }
  }, [storagePrefix])

  return name
}
