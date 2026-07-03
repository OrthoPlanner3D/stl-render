/**
 * Cliente Supabase + helper de upload a Storage.
 *
 * La function es backend (service role), así que RLS no aplica.
 */

'use strict'

const { createClient } = require('@supabase/supabase-js')

const { supabaseUrl, supabaseServiceKey, bucketName, schemaName, TABLE } = require('./config')

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null

function getClient() {
  if (!client) {
    const url = supabaseUrl()
    const key = supabaseServiceKey()
    if (!url || !key) {
      throw new Error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    }
    client = createClient(url, key)
  }
  return client
}

/**
 * Sube `data` a `<bucket>/<path>` y devuelve el path almacenado.
 * upsert: un re-upload del mismo nombre pisa el anterior (estrategia de colisiones es V2).
 * @param {string} path
 * @param {Buffer} data
 * @returns {Promise<string>}
 */
async function uploadToSupabase(path, data) {
  const { error } = await getClient()
    .storage.from(bucketName())
    .upload(path, data, { contentType: 'model/gltf-binary', upsert: true })
  if (error) {
    throw new Error(`Supabase upload falló para "${path}": ${error.message}`)
  }
  return path
}

/**
 * Registra el caso 3D en la tabla patient_models (una fila por storage_prefix).
 * Idempotente: como cada archivo del caso llega en su propia request, esta función
 * corre una vez por archivo pero siempre con el mismo storage_prefix → on conflict
 * do nothing. Requiere un UNIQUE constraint sobre storage_prefix en la tabla.
 * @param {number} patientId
 * @param {string} storagePrefix
 * @returns {Promise<void>}
 */
async function upsertPatientModel(patientId, storagePrefix) {
  const { error } = await getClient()
    .schema(schemaName())
    .from(TABLE)
    .upsert(
      { patient_id: patientId, storage_prefix: storagePrefix },
      { onConflict: 'storage_prefix', ignoreDuplicates: true },
    )
  if (error) {
    throw new Error(`Supabase upsert patient_models falló para "${storagePrefix}": ${error.message}`)
  }
}

/**
 * @deprecated El viewer ahora lista por storage_prefix con su propio cliente Supabase.
 * Se mantiene solo para no romper el contrato del GET; lista la raíz del bucket, que
 * bajo el layout por prefijo ya no tiene .glb sueltos.
 *
 * Lista los .glb del bucket y devuelve signed URLs temporales para cada uno.
 * Firma del lado servidor con el service_role: el browser nunca ve la key.
 * @param {number} expiresIn segundos de validez de la URL firmada
 * @returns {Promise<Array<{ name: string, url: string }>>}
 */
async function listSignedGlbUrls(expiresIn) {
  const bucket = getClient().storage.from(bucketName())

  const { data: files, error: listError } = await bucket.list('', { limit: 1000 })
  if (listError) {
    throw new Error(`Supabase list falló: ${listError.message}`)
  }
  const names = files.map((f) => f.name).filter((n) => n.toLowerCase().endsWith('.glb'))
  if (names.length === 0) return []

  const { data: signed, error: signError } = await bucket.createSignedUrls(names, expiresIn)
  if (signError) {
    throw new Error(`Supabase createSignedUrls falló: ${signError.message}`)
  }

  return signed
    .filter((s) => !s.error && s.signedUrl)
    .map((s) => ({ name: s.path, url: s.signedUrl }))
}

module.exports = { uploadToSupabase, upsertPatientModel, listSignedGlbUrls }
