/**
 * Acceso a la tabla op3dcloud.treatment_planning: una fila por paciente con su ficha
 * de tratamiento. Acá solo persistimos el link del render 3D.
 */

import { supabase } from './supabase'

/**
 * Guarda el link compartible del render 3D en la ficha de tratamiento del paciente.
 * Una sola fila por paciente (ya existe), así que es un UPDATE por patient_id.
 */
export async function saveRender3dLink(patientId: number, url: string): Promise<void> {
  const { error } = await supabase
    .from('treatment_planning')
    .update({ render_3d: url })
    .eq('patient_id', patientId)
  if (error) throw new Error(error.message)
}
