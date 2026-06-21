/**
 * Carga masiva de .stl al endpoint stl-to-glb.
 *
 * Sube UN archivo por request (en paralelo, con concurrencia limitada) en vez de
 * agrupar todo en una sola request: Cloud Run tope ~32MB por request, así que un
 * lote grande (ej. 50 archivos = 257MB) es rechazado por la plataforma. Uno-por-
 * request entra holgado (cada .stl ~5MB) y aísla los fallos.
 *
 * Uso:
 *   node bulk-upload.mjs <carpeta> [--local] [--concurrency=5]
 *   npm run upload -- <carpeta>
 *
 * URL destino: deployado por default; --local usa http://localhost:8080;
 * o se override con la env ENDPOINT_URL.
 */

import 'dotenv/config'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const DEPLOYED_URL = 'https://us-central1-orthoplanner.cloudfunctions.net/stl-to-glb'

function parseArgs(argv) {
  const args = { dir: null, local: false, concurrency: 5 }
  for (const a of argv) {
    if (a === '--local') args.local = true
    else if (a.startsWith('--concurrency=')) args.concurrency = Math.max(1, parseInt(a.split('=')[1], 10) || 5)
    else if (!a.startsWith('--')) args.dir = a
  }
  return args
}

function fmtBytes(n) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`
}

async function uploadOne(url, apiKey, dir, name) {
  const buf = await readFile(path.join(dir, name))
  const form = new FormData()
  form.append('files', new Blob([buf], { type: 'model/stl' }), name)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: form,
  })

  let json
  try {
    json = await res.json()
  } catch {
    throw new Error(`HTTP ${res.status} (respuesta no-JSON)`)
  }
  if (!res.ok && res.status !== 207) {
    throw new Error(`HTTP ${res.status}: ${json?.error ?? 'error desconocido'}`)
  }
  const result = json?.files?.[0]
  if (!result || result.error) {
    throw new Error(result?.error ?? 'sin resultado en la respuesta')
  }
  return result // { originalName, storedPath, size }
}

async function main() {
  const { dir, local, concurrency } = parseArgs(process.argv.slice(2))

  if (!dir) {
    console.error('Uso: node bulk-upload.mjs <carpeta-con-stls> [--local] [--concurrency=5]')
    process.exit(2)
  }

  const apiKey = process.env.STL_API_KEY
  if (!apiKey) {
    console.error('Falta STL_API_KEY (cargalo en .env)')
    process.exit(2)
  }

  const url = process.env.ENDPOINT_URL || (local ? 'http://localhost:8080' : DEPLOYED_URL)

  const entries = await readdir(dir)
  const stls = entries.filter((f) => /\.stl$/i.test(f)).sort()
  if (stls.length === 0) {
    console.error(`No hay archivos .stl en "${dir}"`)
    process.exit(1)
  }

  console.log(`Subiendo ${stls.length} archivos → ${url}`)
  console.log(`Concurrencia: ${concurrency}\n`)

  let done = 0
  const ok = []
  const failed = []
  let next = 0

  async function worker() {
    while (next < stls.length) {
      const i = next++
      const name = stls[i]
      const n = ++done
      try {
        const r = await uploadOne(url, apiKey, dir, name)
        ok.push(r)
        console.log(`[${n}/${stls.length}] ${name} → ${r.storedPath} (${fmtBytes(r.size)})`)
      } catch (err) {
        failed.push({ name, error: err.message })
        console.log(`[${n}/${stls.length}] ✗ ${name}: ${err.message}`)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, stls.length) }, worker))

  console.log(`\nResumen: ${ok.length} subidos, ${failed.length} fallidos.`)
  if (failed.length > 0) {
    console.log('Fallidos:')
    for (const f of failed) console.log(`  - ${f.name}: ${f.error}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Error fatal:', err.message)
  process.exit(1)
})
