import { useState, useRef } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { FileIcon, X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { uploadStlFiles, type UploadResult } from '@/lib/uploadStl'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type FileStatus = 'idle' | 'uploading' | 'done' | 'error'

/**
 * Sección de carga para un arco (maxilar o mandibular). Mantiene su propio
 * estado, de modo que cada arco se selecciona y sube de forma independiente,
 * pero ambas secciones comparten el mismo cliente `uploadStlFiles` (mismo
 * endpoint).
 */
function ArchUploadSection({ title }: { title: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<Record<string, FileStatus>>({})
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<UploadResult[] | null>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const fresh = selected.filter(f => !existing.has(f.name))
      return [...prev, ...fresh]
    })
    e.target.value = ''
  }

  function removeFile(name: string) {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  function reset() {
    setResults(null)
    setStatus({})
    setFiles([])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setUploading(true)
    setStatus(Object.fromEntries(files.map(f => [f.name, 'uploading' as FileStatus])))

    // TODO(nomenclatura): cuando la clienta defina la convención de nombres por
    // arco, normalizar/validar acá los nombres (que contengan "Maxillary" /
    // "Mandibular" según `title`) antes de subir. El visor categoriza por nombre
    // de archivo — ver src/data/stlAssets.ts.
    const res = await uploadStlFiles(files, {
      concurrency: 4,
      onResult: r =>
        setStatus(prev => ({ ...prev, [r.originalName]: r.error ? 'error' : 'done' })),
    })

    setResults(res)
    setUploading(false)
  }

  const ok = results?.filter(r => !r.error).length ?? 0
  const failed = results?.filter(r => r.error).length ?? 0
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0)

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full min-h-0 flex-col gap-4 rounded-xl border bg-card/50 p-5"
    >
      <div className="flex items-center gap-2">
        <Label className="text-lg font-semibold">{title}</Label>
        {files.length > 0 && (
          <>
            <Badge variant="secondary">{files.length}</Badge>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatBytes(totalBytes)}
            </span>
          </>
        )}
      </div>

      {/* Selector de archivos */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".stl"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={uploading || !!results}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Seleccionar archivos
      </Button>

      {/* Área de lista (crece a todo el alto del panel) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {files.length === 0 ? (
          <div className="flex h-full min-h-[8rem] flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-muted-foreground">
            <FileIcon className="h-6 w-6 opacity-50" />
            <p className="text-xs">Sin archivos seleccionados</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {files.map(f => {
              const st = status[f.name] ?? 'idle'
              return (
                <li
                  key={f.name}
                  className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {st === 'uploading' ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : st === 'done' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : st === 'error' ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  ) : (
                    <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate flex-1">{f.name}</span>
                  <Badge variant="outline" className="shrink-0">{formatBytes(f.size)}</Badge>
                  {!uploading && !results && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeFile(f.name)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Resumen / acción de la sección (anclado al pie del panel) */}
      <div className="mt-auto">
        {results ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {ok} convertido{ok !== 1 ? 's' : ''} a GLB
              {failed > 0 && ` · ${failed} con error`}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              Subir otros
            </Button>
          </div>
        ) : (
          <Button type="submit" className="w-full" disabled={files.length === 0 || uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo y convirtiendo…
              </>
            ) : (
              `Subir ${title.toLowerCase()}${files.length > 0 ? ` (${files.length})` : ''}`
            )}
          </Button>
        )}
      </div>
    </form>
  )
}

export default function UploadPage() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="shrink-0 border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Subir archivos STL</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Seleccioná los archivos del caso para convertir y cargar en OP3DViewer
        </p>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
          <ArchUploadSection title="Maxilares" />
          <ArchUploadSection title="Mandibulares" />
        </div>
      </main>
    </div>
  )
}
