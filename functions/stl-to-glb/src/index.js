/**
 * Cloud Function HTTP: recibe N x .stl, los convierte a .glb+Draco y los sube a Supabase.
 *
 * Request:  POST multipart/form-data, campo `files` (uno o varios .stl).
 *           Header `x-api-key` validado contra STL_API_KEY.
 * Response: 200 { files: [ { originalName, storedPath, size } ] }
 *           207 si hubo fallos parciales (cada item trae `error` en vez de storedPath/size).
 */

'use strict'

require('dotenv').config() // carga .env en local; no-op en GCF (las vars vienen del deploy)

const path = require('node:path')

const { http } = require('@google-cloud/functions-framework')
const Busboy = require('busboy')

const { convertStlToCompressedGlb } = require('./convert')
const { uploadToSupabase, listSignedGlbUrls } = require('./supabase')

const MAX_FILE_BYTES = 50 * 1024 * 1024 // 50MB por archivo
const MAX_TOTAL_BYTES = 200 * 1024 * 1024 // 200MB por request
const SIGNED_URL_TTL = 6 * 60 * 60 // 6h de validez para las URLs firmadas

/**
 * Parsea el multipart del request en archivos { filename, data }.
 * @param {import('@google-cloud/functions-framework').Request} req
 * @returns {Promise<Array<{ filename: string, data: Buffer }>>}
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_BYTES } })
    const files = []
    let total = 0
    let failed = null

    bb.on('file', (_field, stream, info) => {
      const chunks = []
      stream.on('data', (chunk) => {
        total += chunk.length
        if (total > MAX_TOTAL_BYTES) failed = new Error('total upload too large')
        chunks.push(chunk)
      })
      stream.on('limit', () => {
        failed = new Error(`archivo "${info.filename}" excede ${MAX_FILE_BYTES} bytes`)
      })
      stream.on('end', () => {
        files.push({ filename: info.filename, data: Buffer.concat(chunks) })
      })
    })
    bb.on('error', (err) => reject(err instanceof Error ? err : new Error(String(err))))
    bb.on('close', () => (failed ? reject(failed) : resolve(files)))

    // En Cloud Functions el body ya viene en req.rawBody; en local se pipea el stream.
    if (req.rawBody) bb.end(req.rawBody)
    else req.pipe(bb)
  })
}

http('stlToGlb', async (req, res) => {
  // CORS: el front (browser) hace requests cross-origin con header x-api-key,
  // lo que dispara un preflight OPTIONS. '*' alcanza por ahora porque el acceso
  // lo gatea la api-key; cuando se defina la auth real conviene restringir el origin.
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST')
    res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    return
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const expected = process.env.STL_API_KEY
  if (!expected || req.get('x-api-key') !== expected) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  // GET → listar los .glb del bucket con signed URLs (para que el viewer los lea).
  if (req.method === 'GET') {
    try {
      const files = await listSignedGlbUrls(SIGNED_URL_TTL)
      res.status(200).json({ files })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
    return
  }

  let parsed
  try {
    parsed = await parseMultipart(req)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) })
    return
  }

  if (parsed.length === 0) {
    res.status(400).json({ error: "no files provided (campo 'files')" })
    return
  }

  const results = []
  for (const file of parsed) {
    const originalName = file.filename || 'unnamed.stl'
    try {
      const glb = await convertStlToCompressedGlb(file.data)
      const storedPath = path.parse(originalName).name + '.glb'
      await uploadToSupabase(storedPath, glb)
      results.push({ originalName, storedPath, size: glb.length })
    } catch (err) {
      results.push({ originalName, error: err instanceof Error ? err.message : String(err) })
    }
  }

  const status = results.some((r) => r.error) ? 207 : 200
  res.status(status).json({ files: results })
})
