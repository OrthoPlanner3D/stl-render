/**
 * Parser de STL → posiciones de vértices (flat Float32Array, 9 floats por triángulo).
 *
 * Reemplaza al STLLoader de three: el formato STL es trivial y así evitamos
 * la fricción ESM/CommonJS de `three/examples/jsm/*` y una dependencia pesada.
 * Soporta STL binario (lo normal en modelos dentales) y ASCII.
 */

'use strict'

/**
 * Heurística: ¿es STL binario? El header ASCII empieza con "solid", pero también
 * algunos binarios, así que el discriminador fiable es el tamaño esperado:
 * 80 (header) + 4 (uint32 count) + 50 * count.
 * @param {Buffer} buf
 * @returns {boolean}
 */
function isBinaryStl(buf) {
  if (buf.length < 84) return false
  const triangles = buf.readUInt32LE(80)
  return buf.length === 84 + triangles * 50
}

/** @param {Buffer} buf @returns {Float32Array} */
function parseBinary(buf) {
  const triangles = buf.readUInt32LE(80)
  const positions = new Float32Array(triangles * 9)
  let offset = 84
  let p = 0
  for (let i = 0; i < triangles; i++) {
    offset += 12 // saltar normal (3 floats)
    for (let v = 0; v < 9; v++) {
      positions[p++] = buf.readFloatLE(offset)
      offset += 4
    }
    offset += 2 // attribute byte count
  }
  return positions
}

/** @param {string} text @returns {Float32Array} */
function parseAscii(text) {
  const verts = []
  const re = /vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g
  let m
  while ((m = re.exec(text)) !== null) {
    verts.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]))
  }
  return new Float32Array(verts)
}

/**
 * Devuelve las posiciones (VEC3 flat, no indexadas) de un .stl.
 * @param {Buffer} buf
 * @returns {Float32Array}
 */
function parseStlPositions(buf) {
  const positions = isBinaryStl(buf) ? parseBinary(buf) : parseAscii(buf.toString('utf8'))
  if (positions.length === 0 || positions.length % 9 !== 0) {
    throw new Error('STL inválido: no se obtuvieron triángulos válidos')
  }
  return positions
}

module.exports = { parseStlPositions }
