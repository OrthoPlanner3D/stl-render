import { useState, useRef, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileIcon, X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { uploadStlFiles, type UploadResult } from '@/lib/uploadStl'
import { getPatients, patientLabel, type Patient } from '@/lib/patients'
import { saveCaseSpacings } from '@/lib/patientModels'
import DentalPanel from '@/components/DentalPanel'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type FileStatus = 'idle' | 'uploading' | 'done' | 'error'

export default function UploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<Record<string, FileStatus>>({})
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<UploadResult[] | null>(null)

  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientsError, setPatientsError] = useState<string | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  // Prefijo del caso recién subido; se le pasa al visor para que liste ese caso.
  const [storagePrefix, setStoragePrefix] = useState<string | null>(null)
  // Spacings interproximales (mm) cargados a mano; opcionales, se persisten por caso.
  const [spacings, setSpacings] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    getPatients()
      .then(list => { if (active) setPatients(list) })
      .catch(err => { if (active) setPatientsError(err instanceof Error ? err.message : String(err)) })
      .finally(() => { if (active) setPatientsLoading(false) })
    return () => { active = false }
  }, [])

  const selectedPatient = patients.find(p => p.id === selectedPatientId) ?? null

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

  function clearFiles() {
    setFiles([])
    setStatus({})
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (files.length === 0 || selectedPatientId == null) return
    setUploading(true)
    setStatus(Object.fromEntries(files.map(f => [f.name, 'uploading' as FileStatus])))

    // Un prefijo único por caso — la barra final es obligatoria. Todos los archivos
    // del caso comparten este prefijo y se agrupan bajo él en el bucket.
    const prefix = `${selectedPatientId}/${crypto.randomUUID()}/`
    setStoragePrefix(prefix)

    const res = await uploadStlFiles(files, {
      concurrency: 4,
      patientId: selectedPatientId ?? undefined,
      storagePrefix: prefix,
      onResult: r =>
        setStatus(prev => ({ ...prev, [r.originalName]: r.error ? 'error' : 'done' })),
    })

    // La fila patient_models la crea la Cloud Function durante la subida, así que
    // recién ahora existe para asociarle los spacings. No rompe el flujo si falla.
    if (res.some(r => !r.error) && Object.keys(spacings).length > 0) {
      await saveCaseSpacings(prefix, spacings).catch(() => {})
    }

    setResults(res)
    setUploading(false)
  }

  // Pantalla de resultados
  if (results) {
    const ok = results.filter(r => !r.error)
    const failed = results.filter(r => r.error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4 pb-4 pt-20">
        <Card className="w-full max-w-md flex flex-col max-h-[calc(100vh-6rem)]">
          <CardHeader className="text-center shrink-0">
            <div className="flex justify-center mb-2">
              {failed.length === 0 ? (
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              ) : (
                <AlertCircle className="h-12 w-12 text-amber-500" />
              )}
            </div>
            <CardTitle>{failed.length === 0 ? 'Conversión completa' : 'Terminado con errores'}</CardTitle>
            <CardDescription>
              {ok.length} convertido{ok.length !== 1 ? 's' : ''} a GLB
              {failed.length > 0 && ` · ${failed.length} con error`}
              {selectedPatient && ` · Paciente: ${patientLabel(selectedPatient)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            <ul className="space-y-2">
              {results.map(r => (
                <li key={r.originalName} className="flex items-center gap-2 text-sm">
                  {r.error ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  )}
                  <span className="truncate flex-1">{r.error ? r.originalName : r.storedPath}</span>
                  {r.error ? (
                    <span className="text-xs text-destructive truncate max-w-[45%]" title={r.error}>{r.error}</span>
                  ) : (
                    <Badge variant="secondary" className="shrink-0">{formatBytes(r.size ?? 0)}</Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 shrink-0">
            <Button
              className="w-full"
              disabled={ok.length === 0 || !storagePrefix}
              onClick={() => navigate(`/app?prefix=${encodeURIComponent(storagePrefix ?? '')}`)}
            >
              Ir al visor
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => { setResults(null); setStatus({}); setFiles([]); setSelectedPatientId(null); setStoragePrefix(null); setSpacings({}) }}
            >
              Subir otro caso
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-4 bg-black px-4 pb-4 pt-20">
      <Card className="w-full max-w-md flex flex-col max-h-[calc(100vh-6rem)]">
        <CardHeader className="shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Subir archivos STL</CardTitle>
          </div>
          <CardDescription>
            Seleccioná los archivos del caso para convertir y cargar en OP3DViewer
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <CardContent className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
            {/* Selector de paciente */}
            <div className="space-y-2 shrink-0">
              <Label htmlFor="patient">Paciente</Label>
              <select
                id="patient"
                value={selectedPatientId ?? ''}
                disabled={uploading || patientsLoading || !!patientsError}
                onChange={e => setSelectedPatientId(e.target.value ? Number(e.target.value) : null)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [color-scheme:dark]"
              >
                <option value="" disabled className="bg-popover text-popover-foreground">
                  {patientsLoading ? 'Cargando pacientes…' : 'Seleccioná un paciente'}
                </option>
                {patients.map(p => (
                  <option key={p.id} value={p.id} className="bg-popover text-popover-foreground">{patientLabel(p)}</option>
                ))}
              </select>
              {patientsError ? (
                <p className="text-xs text-destructive">No se pudieron cargar los pacientes: {patientsError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Los archivos se vincularán a este paciente
                </p>
              )}
            </div>

            {/* Selector de archivos */}
            <div className="space-y-2 shrink-0">
              <Label>Archivos STL</Label>
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
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivos
              </Button>
              <p className="text-xs text-muted-foreground">
                Formato aceptado: .stl — podés seleccionar múltiples archivos
              </p>
            </div>

            {/* Lista de archivos */}
            {files.length > 0 && (
              <div className="flex flex-col gap-2 flex-1 min-h-0">
                <div className="flex items-center justify-between shrink-0">
                  <Label>
                    Archivos seleccionados
                    <Badge variant="secondary" className="ml-2">{files.length}</Badge>
                  </Label>
                  {!uploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFiles}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Borrar todos
                    </Button>
                  )}
                </div>
                <ul className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                  {files.map(f => {
                    const st = status[f.name] ?? 'idle'
                    return (
                      <li
                        key={f.name}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
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
                        {!uploading && (
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
              </div>
            )}
          </CardContent>

          <CardFooter className="shrink-0 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={files.length === 0 || uploading || selectedPatientId == null}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo y convirtiendo…
                </>
              ) : (
                `Subir ${files.length > 0 ? `${files.length} archivo${files.length !== 1 ? 's' : ''}` : 'archivos'}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Editor de spacings (opcional) — al lado del form */}
      <Card className="w-full max-w-md flex flex-col max-h-[calc(100vh-6rem)]">
        <CardHeader className="shrink-0">
          <CardTitle>Spacings</CardTitle>
          <CardDescription>
            Opcional — clickeá los puntos de contacto entre dientes para cargar la separación en mm
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full rounded-md border bg-[rgba(8,8,8,0.98)] overflow-hidden">
            <DentalPanel spacings={spacings} onSpacingsChange={setSpacings} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
