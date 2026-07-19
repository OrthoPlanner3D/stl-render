import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Eye, Loader2, AlertCircle, Share2, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPatients, patientLabel, type Patient } from '@/lib/patients'
import { getLatestPrefixByPatient } from '@/lib/patientModels'
import { renderUrl } from '@/lib/renderUrl'

export default function PatientsPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  // patientId → storagePrefix del caso más reciente. Solo estos pacientes tienen render.
  const [prefixByPatient, setPrefixByPatient] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Paciente cuyo link se acaba de copiar (para el feedback "Copiado" temporal).
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getPatients(), getLatestPrefixByPatient()])
      .then(([list, prefixes]) => {
        if (!active) return
        setPatients(list)
        setPrefixByPatient(prefixes)
      })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : String(err)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  // Solo pacientes con al menos un render, preservando el orden de getPatients (id desc).
  const withRender = patients.filter(p => prefixByPatient.has(p.id))

  function handleOpen(p: Patient) {
    const prefix = prefixByPatient.get(p.id)
    if (!prefix) return
    navigate(`/app?prefix=${encodeURIComponent(prefix)}`)
  }

  async function handleShare(p: Patient) {
    const prefix = prefixByPatient.get(p.id)
    if (!prefix) return
    try {
      await navigator.clipboard.writeText(renderUrl(prefix))
      setCopiedId(p.id)
      setTimeout(() => setCopiedId(c => (c === p.id ? null : c)), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo copiar el link')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 pb-4 pt-20">
      <Card className="w-full max-w-md flex flex-col max-h-[calc(100vh-6rem)]">
        <CardHeader className="shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Pacientes</CardTitle>
          </div>
          <CardDescription>Elegí un paciente para ver su render</CardDescription>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando pacientes…
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 py-8 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>No se pudieron cargar los pacientes: {error}</span>
            </div>
          ) : withRender.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay pacientes con render todavía
            </p>
          ) : (
            <ul className="space-y-2">
              {withRender.map(p => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <span className="truncate flex-1">{patientLabel(p)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    title="Copiar link del render"
                    onClick={() => handleShare(p)}
                  >
                    {copiedId === p.id ? (
                      <>
                        <Check className="h-4 w-4 md:mr-1.5 text-green-500" />
                        <span className='hidden md:inline'>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 md:mr-1.5" />
                        <span className='hidden md:inline'>Compartir</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleOpen(p)}
                  >
                    <Eye className="h-4 w-4 md:mr-1.5" />
                    <span className='hidden md:inline'>Ver render</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
