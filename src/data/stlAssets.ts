import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const _draco = new DRACOLoader()
_draco.setDecoderPath('/draco/')

export function extendGLTFLoader(loader: GLTFLoader) {
  loader.setDRACOLoader(_draco)
}

export interface ArchAssets {
  label: string
  /** URLs firmadas de los GLB, en orden de pasos */
  stls: string[]
  /** etiquetas de paso: '1'..'N' (posicional) */
  names: string[]
  /** nombre del archivo en el bucket: '1Maxillary.glb', ... */
  filenames: string[]
}

interface BucketFile {
  name: string
  url: string
}

const ENDPOINT = import.meta.env.VITE_STL_ENDPOINT as string | undefined
const API_KEY = import.meta.env.VITE_STL_API_KEY as string | undefined

/** Orden por número ascendente; "_with_attachments" va justo después de su número base. */
function sortKey(filename: string): [number, number] {
  const num = parseInt(filename, 10) || 0
  const att = /_with_attachments/i.test(filename) ? 1 : 0
  return [num, att]
}

function buildArch(label: string, files: BucketFile[]): ArchAssets {
  const sorted = [...files].sort((a, b) => {
    const [na, aa] = sortKey(a.name)
    const [nb, ab] = sortKey(b.name)
    return na - nb || aa - ab
  })
  return {
    label,
    stls: sorted.map(f => f.url),
    filenames: sorted.map(f => f.name),
    names: sorted.map((_, i) => String(i + 1)),
  }
}

/**
 * Pide al endpoint stl-to-glb la lista de GLB del bucket (con signed URLs) y
 * arma los arcos Maxilar / Mandibular en orden de pasos.
 */
export async function fetchArches(): Promise<{ maxillary: ArchAssets; mandibular: ArchAssets }> {
  if (!ENDPOINT || !API_KEY) {
    throw new Error('Faltan VITE_STL_ENDPOINT / VITE_STL_API_KEY')
  }
  const res = await fetch(ENDPOINT, { headers: { 'x-api-key': API_KEY } })
  if (!res.ok) {
    throw new Error(`No se pudo listar el bucket (HTTP ${res.status})`)
  }
  const { files } = (await res.json()) as { files: BucketFile[] }
  const max = files.filter(f => /Maxillary/i.test(f.name))
  const man = files.filter(f => /Mandibular/i.test(f.name))
  return {
    maxillary: buildArch('Maxilar', max),
    mandibular: buildArch('Mandibular', man),
  }
}
