/**
 * Acceso a la tabla op3dcloud.patient_models: cada fila es un caso/escaneo 3D
 * (agrupa todos los GLB del set bajo un storage_prefix). Un paciente puede tener
 * varios casos (historial), así que patient_id no es único.
 */

import { supabase } from './supabase'

export interface PatientModelCase {
  id: number
  patientId: number
  storagePrefix: string
  createdAt: string
}

function mapRow(r: Record<string, unknown>): PatientModelCase {
  return {
    id: r.id as number,
    patientId: r.patient_id as number,
    storagePrefix: r.storage_prefix as string,
    createdAt: r.created_at as string,
  }
}

/**
 * Prefijo del caso más reciente (global). Fallback del visor cuando se abre /app
 * sin `?prefix`. Devuelve null si todavía no hay ningún caso cargado.
 */
export async function getLatestStoragePrefix(): Promise<string | null> {
  const { data, error } = await supabase
    .from('patient_models')
    .select('storage_prefix')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data?.storage_prefix as string | undefined) ?? null
}

/** Mapa patientId → storagePrefix del caso MÁS reciente. Un paciente por entrada; sin casos → ausente. */
export async function getLatestPrefixByPatient(): Promise<Map<number, string>> {
  const { data, error } = await supabase
    .from('patient_models')
    .select('patient_id, storage_prefix, created_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  const map = new Map<number, string>()
  for (const r of data ?? []) {
    const pid = r.patient_id as number
    if (!map.has(pid)) map.set(pid, r.storage_prefix as string) // primer visto = más reciente
  }
  return map
}

/**
 * Spacings interproximales (mm) guardados para un caso, keyeados por contacto
 * (ej. `max_0_1`). Columna JSONB `spacings` en patient_models. Devuelve {} si no hay.
 */
export async function getCaseSpacings(storagePrefix: string): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('patient_models')
    .select('spacings')
    .eq('storage_prefix', storagePrefix)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data?.spacings as Record<string, string> | undefined) ?? {}
}

/**
 * Persiste los spacings del caso (update por storage_prefix). La fila la crea la
 * Cloud Function durante la subida, así que esto se llama DESPUÉS de subir OK.
 */
export async function saveCaseSpacings(storagePrefix: string, spacings: Record<string, string>): Promise<void> {
  const { error } = await supabase
    .from('patient_models')
    .update({ spacings })
    .eq('storage_prefix', storagePrefix)
  if (error) throw new Error(error.message)
}

/** Historial de casos de un paciente, del más nuevo al más viejo. */
export async function getCasesByPatient(patientId: number): Promise<PatientModelCase[]> {
  const { data, error } = await supabase
    .from('patient_models')
    .select('id, patient_id, storage_prefix, created_at')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}
