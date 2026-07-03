/**
 * Fetch de un recurso con reintentos + backoff exponencial con jitter.
 *
 * Pensado para los GLB del visor, que se sirven desde Supabase Storage (detrás de
 * Cloudflare). Un edge frío (cache MISS) sumado a la ráfaga de descargas en paralelo
 * hace que el primer fetch a veces falle con "Failed to fetch" (un `TypeError` de red:
 * DNS/TLS/reset). Reintentar de forma silenciosa cubre ese caso transitorio.
 *
 * NO reintenta ante cancelación del caller (unmount) ni ante 4xx no reintentables
 * (p. ej. 403 = URL firmada vencida/ inválida: reintentar no ayuda, hay que re-firmar).
 */

export interface FetchWithRetryOptions {
  /** Reintentos adicionales tras el primer intento. Default 3 (=> hasta 4 intentos). */
  retries?: number
  /** Base del backoff en ms. Default 300. */
  baseDelayMs?: number
  /** Tope del backoff en ms. Default 4000. */
  maxDelayMs?: number
  /** Timeout por intento en ms. Default 20000. */
  timeoutMs?: number
  /** Señal de cancelación del caller (p. ej. cleanup de un effect). */
  signal?: AbortSignal
}

/** Status HTTP que vale la pena reintentar (transitorios del server/CDN). */
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])

/** Error definitivo (4xx no transitorio): no debe reintentarse. */
class NonRetryableError extends Error {}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new Error('aborted'))
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(id)
      reject(signal?.reason ?? new Error('aborted'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export async function fetchWithRetry(
  url: string,
  opts: FetchWithRetryOptions = {},
): Promise<ArrayBuffer> {
  const {
    retries = 3,
    baseDelayMs = 300,
    maxDelayMs = 4000,
    timeoutMs = 20000,
    signal,
  } = opts

  let lastErr: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    // El caller canceló (unmount / cambio de caso): no reintentar, propagar el abort.
    if (signal?.aborted) throw signal.reason ?? new Error('aborted')

    // AbortController propio del intento para el timeout, linkeado al signal externo.
    const timeoutCtrl = new AbortController()
    const onExternalAbort = () => timeoutCtrl.abort(signal?.reason)
    signal?.addEventListener('abort', onExternalAbort, { once: true })
    const timer = setTimeout(() => timeoutCtrl.abort(new Error('timeout')), timeoutMs)

    try {
      const res = await fetch(url, { signal: timeoutCtrl.signal })

      if (!res.ok) {
        // 4xx no reintentables (salvo 408/429): error definitivo.
        if (!RETRYABLE_STATUS.has(res.status)) {
          throw new NonRetryableError(`HTTP ${res.status} ${res.statusText} al cargar ${url}`)
        }
        // Respeta Retry-After si el server lo indica (segundos).
        const retryAfter = Number(res.headers.get('retry-after'))
        lastErr = new Error(`HTTP ${res.status} ${res.statusText}`)
        if (attempt < retries) {
          const wait = Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : backoff(attempt, baseDelayMs, maxDelayMs)
          await delay(wait, signal)
        }
        continue
      }

      return await res.arrayBuffer()
    } catch (err) {
      // Errores definitivos: propagar sin reintentar.
      if (err instanceof NonRetryableError) throw err
      // Cancelación del caller: no es un fallo reintentable, propagar.
      if (signal?.aborted) throw signal.reason ?? err
      lastErr = err
      if (attempt < retries) {
        await delay(backoff(attempt, baseDelayMs, maxDelayMs), signal)
      }
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onExternalAbort)
    }
  }

  const cause = lastErr instanceof Error ? lastErr.message : String(lastErr)
  throw new Error(`No se pudo cargar ${url} tras ${retries + 1} intentos: ${cause}`)
}

/** Backoff exponencial con jitter, topeado en maxDelayMs. */
function backoff(attempt: number, base: number, max: number): number {
  const exp = Math.min(max, base * 2 ** attempt)
  return exp / 2 + Math.random() * (exp / 2)
}
