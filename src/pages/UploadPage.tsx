import { useState, useRef } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileIcon, X, Upload, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      timestamp: new Date().toISOString(),
    }
    console.log('[OP3DViewer] Upload payload:', payload)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md flex flex-col max-h-[90vh]">
          <CardHeader className="text-center shrink-0">
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>Archivos listos</CardTitle>
            <CardDescription>
              {files.length} archivo{files.length !== 1 ? 's' : ''} cargado{files.length !== 1 ? 's' : ''} para el visor
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            <ul className="space-y-2">
              {files.map(f => (
                <li key={f.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <Badge variant="secondary" className="ml-auto shrink-0">{formatBytes(f.size)}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 shrink-0">
            <Button className="w-full" onClick={() => navigate('/app')}>
              Ir al visor
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { setSubmitted(false); setFiles([]) }}>
              Subir otro caso
            </Button>
          </CardFooter>

        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md flex flex-col max-h-[90vh]">
        <CardHeader className="shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Subir archivos STL</CardTitle>
          </div>
          <CardDescription>
            Seleccioná los archivos del caso para cargar en OP3DViewer
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <CardContent className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
            {/* Selector de archivos */}
            <div className="space-y-2 shrink-0">
              <Label>Archivos STL / GLB</Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".stl,.glb"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivos
              </Button>
              <p className="text-xs text-muted-foreground">
                Formatos aceptados: .stl, .glb — podés seleccionar múltiples archivos
              </p>
            </div>

            {/* Lista de archivos */}
            {files.length > 0 && (
              <div className="flex flex-col gap-2 flex-1 min-h-0">
                <Label className="shrink-0">
                  Archivos seleccionados
                  <Badge variant="secondary" className="ml-2">{files.length}</Badge>
                </Label>
                <ul className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                  {files.map(f => (
                    <li
                      key={f.name}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{f.name}</span>
                      <Badge variant="outline" className="shrink-0">{formatBytes(f.size)}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeFile(f.name)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>

          <CardFooter className="shrink-0 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={files.length === 0}
            >
              Subir {files.length > 0 ? `${files.length} archivo${files.length !== 1 ? 's' : ''}` : 'archivos'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
