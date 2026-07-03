/**
 * Lectura de pacientes desde op3dcloud (tabla `op3dcloud.patients`), para vincular
 * las cargas de STL a un paciente. Proyecta solo lo que necesita la UI.
 */

import { supabase } from './supabase'

export interface Patient {
  id: number
  name: string
  lastName: string
}

/** Etiqueta para mostrar en el desplegable / resultados. */
export const patientLabel = (p: Patient) => `${p.name} ${p.lastName}`.trim()

/** Trae la lista de pacientes ordenada del más nuevo al más viejo. Rechaza en error. */
export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('id, name, last_name')
    .order('id', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map(r => ({
    id: r.id as number,
    name: (r.name as string) ?? '',
    lastName: (r.last_name as string) ?? '',
  }))
}
