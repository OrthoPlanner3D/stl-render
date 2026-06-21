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

const config = require('./config')
const { convertStlToCompressedGlb } = require('./convert')
const { uploadToSupabase, listSignedGlbUrls } = require('./supabase')

/** Mensaje de error legible, venga un Error o cualquier otra cosa. */
function errorMessage(err) {
  return err instanceof Error ? err.message : String(err)
}

/**
 * Setea los headers CORS y responde el preflight OPTIONS.
 * El front (browser) hace requests cross-origin con header x-api-key, lo que dispara
 * un preflight. '*' alcanza por ahora porque el acceso lo gatea la api-key; cuando se
 * defina la auth real conviene restringir el origin.
 * @returns {boolean} true si ya respondió el preflight (el handler debe cortar).
 */
function applyCors(req, res) {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method !== 'OPTIONS') return false
  res.set('Access-Control-Allow-Methods', 'GET, POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
  res.set('Access-Control-Max-Age', '3600')
  res.status(204).send('')
  return true
}

/** ¿El request trae la api-key correcta? */
function isAuthorized(req) {
  const expected = config.apiKey()
  return Boolean(expected) && req.get('x-api-key') === expected
}

/**
 * Parsea el multipart del request en archivos { filename, data }.
 * @param {import('@google-cloud/functions-framework').Request} req
 * @returns {Promise<Array<{ filename: string, data: Buffer }>>}
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: config.MAX_FILE_BYTES } })
    const files = []
    let total = 0
    let failed = null

    bb.on('file', (_field, stream, info) => {
      const chunks = []
      stream.on('data', (chunk) => {
        total += chunk.length
        if (total > config.MAX_TOTAL_BYTES) failed = new Error('total upload too large')
        chunks.push(chunk)
      })
      stream.on('limit', () => {
        failed = new Error(`archivo "${info.filename}" excede ${config.MAX_FILE_BYTES} bytes`)
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

/** GET → lista los .glb del bucket con signed URLs (para que el viewer los lea). */
async function handleList(res) {
  try {
    const files = await listSignedGlbUrls(config.SIGNED_URL_TTL)
    res.status(200).json({ files })
  } catch (err) {
    res.status(500).json({ error: errorMessage(err) })
  }
}

/** POST → parsea el multipart, convierte cada .stl a .glb y lo sube a Supabase. */
async function handleConvert(req, res) {
  let parsed
  try {
    parsed = await parseMultipart(req)
  } catch (err) {
    res.status(400).json({ error: errorMessage(err) })
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
      results.push({ originalName, error: errorMessage(err) })
    }
  }

  const status = results.some((r) => r.error) ? 207 : 200
  res.status(status).json({ files: results })
}

http('stlToGlb', async (req, res) => {
  if (applyCors(req, res)) return

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  if (req.method === 'GET') return handleList(res)
  return handleConvert(req, res)
})
