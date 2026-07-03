/**
 * Cliente del endpoint stl-to-glb (Cloud Function).
 *
 * Sube cada .stl en su PROPIA request (Cloud Run rechaza requests > ~32MB, y un
 * lote junto se pasa fácil). El batch corre con concurrencia limitada.
 *
 * NOTA DE SEGURIDAD (temporal): la api-key viaja en el bundle del browser vía
 * VITE_STL_API_KEY — queda expuesta. Es aceptable solo hasta definir la auth real
 * (JWT de Supabase u otra), que está pendiente de decisión de producto.
 */

const ENDPOINT = import.meta.env.VITE_STL_ENDPOINT as string | undefined
const API_KEY = import.meta.env.VITE_STL_API_KEY as string | undefined

export interface UploadResult {
  originalName: string
  storedPath?: string
  size?: number
  error?: string
}

/** Sube un único archivo al endpoint y devuelve su resultado (nunca rechaza). */
export async function uploadStlFile(
  file: File,
  { patientId, storagePrefix }: { patientId?: number; storagePrefix?: string } = {},
): Promise<UploadResult> {
  if (!ENDPOINT || !API_KEY) {
    return { originalName: file.name, error: 'Faltan VITE_STL_ENDPOINT / VITE_STL_API_KEY' }
  }
  const form = new FormData()
  form.append('files', file, file.name)
  if (patientId != null) form.append('patientId', String(patientId))
  if (storagePrefix != null) form.append('storage_prefix', storagePrefix)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY },
      body: form,
    })
    const json = await res.json().catch(() => null)
    if (!res.ok && res.status !== 207) {
      return { originalName: file.name, error: json?.error ?? `HTTP ${res.status}` }
    }
    const result = json?.files?.[0] as UploadResult | undefined
    return result ?? { originalName: file.name, error: 'respuesta inesperada del servidor' }
  } catch (err) {
    return { originalName: file.name, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Sube varios archivos con concurrencia limitada. Llama a `onResult` apenas
 * termina cada uno (para refrescar el progreso en la UI). Devuelve todos los
 * resultados en el orden original.
 */
export async function uploadStlFiles(
  files: File[],
  {
    concurrency = 4,
    onResult,
    patientId,
    storagePrefix,
  }: {
    concurrency?: number
    onResult?: (r: UploadResult) => void
    patientId?: number
    storagePrefix?: string
  } = {},
): Promise<UploadResult[]> {
  const results: UploadResult[] = new Array(files.length)
  let next = 0

  async function worker() {
    while (next < files.length) {
      const i = next++
      const r = await uploadStlFile(files[i], { patientId, storagePrefix })
      results[i] = r
      onResult?.(r)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker))
  return results
}
