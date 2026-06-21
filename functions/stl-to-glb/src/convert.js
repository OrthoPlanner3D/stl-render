/**
 * Función pura: Buffer(.stl) → Buffer(.glb comprimido con Draco).
 *
 * No toca red, ni Supabase, ni filesystem. three NO interviene: parseamos el STL
 * con un parser propio (ver stl.js) y armamos/comprimimos el GLB con gltf-transform,
 * cuyo encoder Draco (draco3dgltf) produce KHR_draco_mesh_compression válido y
 * compatible con el DRACOLoader del viewer.
 */

'use strict'

const { Document, NodeIO } = require('@gltf-transform/core')
const { KHRDracoMeshCompression } = require('@gltf-transform/extensions')
const { draco, weld } = require('@gltf-transform/functions')
const draco3d = require('draco3dgltf')

const { DRACO_QUANTIZE_POSITION } = require('./config')
const { parseStlPositions } = require('./stl')

// El encoder/decoder de Draco son WASM: se inicializan una sola vez y se reutilizan.
let depsPromise = null
function dracoDependencies() {
  if (!depsPromise) {
    depsPromise = Promise.all([
      draco3d.createEncoderModule(),
      draco3d.createDecoderModule(),
    ]).then(([encoder, decoder]) => ({
      'draco3d.encoder': encoder,
      'draco3d.decoder': decoder,
    }))
  }
  return depsPromise
}

/**
 * @param {Buffer} stl
 * @returns {Promise<Buffer>}
 */
async function convertStlToCompressedGlb(stl) {
  const positions = parseStlPositions(stl)

  const doc = new Document()
  const gltfBuffer = doc.createBuffer()
  const positionAccessor = doc
    .createAccessor()
    .setType('VEC3')
    .setArray(positions)
    .setBuffer(gltfBuffer)
  const primitive = doc.createPrimitive().setAttribute('POSITION', positionAccessor)
  const mesh = doc.createMesh().addPrimitive(primitive)
  const node = doc.createNode().setMesh(mesh)
  doc.createScene().addChild(node)

  // weld(): indexa vértices duplicados (el STL es no indexado) → Draco comprime mucho mejor.
  // draco(): aplica KHR_draco_mesh_compression (ver DRACO_QUANTIZE_POSITION en config.js).
  await doc.transform(weld(), draco({ quantizePosition: DRACO_QUANTIZE_POSITION }))

  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies(await dracoDependencies())

  const glb = await io.writeBinary(doc)
  return Buffer.from(glb)
}

module.exports = { convertStlToCompressedGlb }
