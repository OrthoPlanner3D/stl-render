import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoaderCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ErrorBoundary from '../components/ErrorBoundary'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useStlArches } from '../hooks/useStlArches'
import { usePatientName } from '../hooks/usePatientName'
import { useCaseIpr } from '../hooks/useCaseIpr'
import StlViewer from '../components/StlViewer'
import DentalPanel from '../components/DentalPanel'
import BottomBar from '../components/BottomBar'
import ViewPresets from '../components/ViewPresets'
import PatientInfo from '../components/PatientInfo'
import ViewerActions from '../components/ViewerActions'

export default function ViewerPage() {
  const [searchParams] = useSearchParams()
  const storagePrefix = searchParams.get('prefix')
  const { loading, error, maxillary, mandibular, prefix, reload } = useStlArches(storagePrefix)
  const patientName = usePatientName(prefix)
  const ipr = useCaseIpr(prefix)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showMax, setShowMax] = useState(true)
  const [showMan, setShowMan] = useState(true)
  const { isMobile, isBelowLg } = useBreakpoint()
  const focusFnRef = useRef<() => void>(() => {})
  const viewFnRef = useRef<(dir: [number, number, number]) => void>(() => {})
  const total = maxillary?.stls.length ?? 0

  function togglePlay() {
    if (!playing && index === total - 1) setIndex(0)
    setPlaying(p => !p)
  }

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setIndex(i => {
        if (i >= total - 1) { setPlaying(false); return i }
        return i + 1
      })
    }, 200)
    return () => clearInterval(id)
  }, [playing, total])

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-white/60" />
      </div>
    )
  }

  if (error || !maxillary || !mandibular) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-red-400 text-sm px-6 text-center">
        No se pudieron cargar los modelos{error ? `: ${error}` : ''}
      </div>
    )
  }

  const viewer = (
    <>
      <ErrorBoundary
        resetKeys={[prefix, index]}
        fallback={({ reset }) => (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-white/80">No se pudo cargar el modelo</p>
            <Button variant="outline" size="sm" onClick={() => { reset(); reload() }}>
              Reintentar
            </Button>
          </div>
        )}
      >
        <StlViewer
          maxUrl={maxillary.stls[index]}
          manUrl={mandibular.stls[index]}
          showMax={showMax}
          showMan={showMan}
          focusFnRef={focusFnRef}
          viewFnRef={viewFnRef}
        />
      </ErrorBoundary>
      <PatientInfo isMobile={isMobile} name={patientName} />
      <ViewerActions prefix={prefix} isMobile={isMobile} />
      <ViewPresets isMobile={isMobile} onView={dir => viewFnRef.current(dir)} />
      <BottomBar
        index={index}
        total={total}
        playing={playing}
        showMax={showMax}
        showMan={showMan}
        isMobile={isMobile}
        maxillary={maxillary}
        mandibular={mandibular}
        onTogglePlay={togglePlay}
        onToggleMax={() => setShowMax(v => !v)}
        onToggleMan={() => setShowMan(v => !v)}
        onFocus={() => focusFnRef.current()}
        onSelectFrame={i => { setIndex(i); setPlaying(false) }}
      />
    </>
  )

  if (isBelowLg) {
    return (
      <div className="dark w-full h-screen bg-black font-sans overflow-hidden">
        <Tabs defaultValue="vista" className="flex h-full flex-col gap-0">
          <div className="shrink-0 flex justify-center px-3 pt-3 pb-2">
            <TabsList className="w-full max-w-sm">
              <TabsTrigger value="vista">Vista</TabsTrigger>
              <TabsTrigger value="ipr">IPR</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="vista"
            keepMounted
            className="relative min-h-0 flex-1"
          >
            {viewer}
          </TabsContent>
          <TabsContent
            value="ipr"
            className="min-h-0 flex-1 bg-[rgba(8,8,8,0.98)]"
          >
            <DentalPanel ipr={ipr} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black font-sans overflow-hidden flex">
      <div className="flex-1 h-screen relative">
        {viewer}
      </div>
      <div className="w-[30%] h-screen shrink-0 bg-[rgba(8,8,8,0.98)] border-l border-white/[0.06]">
        <DentalPanel ipr={ipr} />
      </div>
    </div>
  )
}
