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
