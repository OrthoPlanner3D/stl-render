/**
 * Cliente Supabase compartido con op3dcloud (mismo proyecto Supabase).
 *
 * Apunta al schema Postgres `op3dcloud` (no `public`) porque ahí viven las tablas
 * del otro proyecto, incluida `patients`.
 *
 * NOTA DE SEGURIDAD (temporal): usamos la SERVICE-ROLE key, que viaja en el bundle del
 * browser vía VITE_SUPABASE_SERVICE_ROLE y SALTEA RLS. Es la única forma de leer
 * op3dcloud.patients sin una sesión autenticada (la policy de esa tabla es
 * `for all to authenticated`, así que la anon key devolvería 0 filas). Aceptable solo
 * hasta definir la auth real — misma deuda que VITE_STL_API_KEY.
 */

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_PROJECT_URL as string | undefined
const serviceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE as string | undefined
const schema = (import.meta.env.VITE_SUPABASE_SCHEMA as string | undefined) ?? 'op3dcloud'

export const supabase = createClient(url ?? '', serviceRole ?? '', {
  db: { schema },
})
