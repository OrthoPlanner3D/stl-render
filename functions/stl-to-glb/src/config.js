/**
 * Configuración centralizada de la function: constantes + lectura de env-vars.
 *
 * Único lugar que responde "¿cómo se configura esto?". Las env-vars se exponen
 * como getters (no como constantes) a propósito: `dotenv` se carga en index.js
 * antes de usarlas, y así no se leen en import-time (lo que rompería los tests
 * y la carga del módulo cuando una var todavía no está seteada).
 */

'use strict'

const DEFAULT_BUCKET = 'glb-models'

// --- Límites de subida y URLs firmadas (antes en index.js) ---
const MAX_FILE_BYTES = 50 * 1024 * 1024 // 50MB por archivo
const MAX_TOTAL_BYTES = 200 * 1024 * 1024 // 200MB por request
const SIGNED_URL_TTL = 6 * 60 * 60 // 6h de validez para las URLs firmadas

// --- Compresión Draco (antes en convert.js) ---
// quantizePosition 11 ≈ 0.03mm de resolución sobre un modelo dental típico: más
// preciso que los GLB que ya se venían usando (~0.06mm) y ~1/3 más liviano que el
// default de 14 bits (que para mallas dentales es precisión de sobra y pesa el doble).
const DRACO_QUANTIZE_POSITION = 11

// --- Env-vars ---
const apiKey = () => process.env.STL_API_KEY
const supabaseUrl = () => process.env.SUPABASE_URL
const supabaseServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY
const bucketName = () => process.env.SUPABASE_BUCKET || DEFAULT_BUCKET

module.exports = {
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  SIGNED_URL_TTL,
  DRACO_QUANTIZE_POSITION,
  apiKey,
  supabaseUrl,
  supabaseServiceKey,
  bucketName,
}
