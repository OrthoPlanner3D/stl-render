import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { supabase } from '../lib/supabase'

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

const BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) ?? 'patient-models'
const SIGNED_URL_TTL = 3600 // 1h de validez para las URLs firmadas

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
 * Lista los GLB del caso bajo `storagePrefix` (con signed URLs) y arma los arcos
 * Maxilar / Mandibular en orden de pasos. Firma del lado cliente con Supabase.
 */
export async function fetchArches(
  storagePrefix: string,
): Promise<{ maxillary: ArchAssets; mandibular: ArchAssets }> {
  const bucket = supabase.storage.from(BUCKET)

  const { data: entries, error: listError } = await bucket.list(storagePrefix, { limit: 1000 })
  if (listError) {
    throw new Error(`No se pudo listar el caso: ${listError.message}`)
  }
  const names = (entries ?? [])
    .map(e => e.name)
    .filter(n => n.toLowerCase().endsWith('.glb'))
  if (names.length === 0) {
    throw new Error('El caso no tiene modelos GLB')
  }

  const { data: signed, error: signError } = await bucket.createSignedUrls(
    names.map(n => storagePrefix + n),
    SIGNED_URL_TTL,
  )
  if (signError) {
    throw new Error(`No se pudieron firmar las URLs: ${signError.message}`)
  }

  // createSignedUrls devuelve el path completo; recuperamos el nombre para el split/orden.
  const files: BucketFile[] = (signed ?? [])
    .flatMap(s =>
      s.error || !s.signedUrl
        ? []
        : [{ name: (s.path ?? '').slice(storagePrefix.length), url: s.signedUrl }],
    )

  const max = files.filter(f => /Maxillary/i.test(f.name))
  const man = files.filter(f => /Mandibular/i.test(f.name))
  return {
    maxillary: buildArch('Maxilar', max),
    mandibular: buildArch('Mandibular', man),
  }
}
