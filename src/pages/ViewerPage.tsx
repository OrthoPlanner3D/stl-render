import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useStlArches } from '../hooks/useStlArches'
import { usePatientName } from '../hooks/usePatientName'
import { useCaseSpacings } from '../hooks/useCaseSpacings'
import StlViewer from '../components/StlViewer'
import DentalPanel from '../components/DentalPanel'
import BottomBar from '../components/BottomBar'
import ViewPresets from '../components/ViewPresets'
import PatientInfo from '../components/PatientInfo'
import ViewerActions from '../components/ViewerActions'

export default function ViewerPage() {
  const [searchParams] = useSearchParams()
  const storagePrefix = searchParams.get('prefix')
  const { loading, error, maxillary, mandibular, prefix } = useStlArches(storagePrefix)
  const patientName = usePatientName(prefix)
  const spacings = useCaseSpacings(prefix)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showMax, setShowMax] = useState(true)
  const [showMan, setShowMan] = useState(true)
  const { isMobile } = useBreakpoint()
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

  return (
    <div className="w-full h-screen bg-black font-sans overflow-hidden flex">
      {/* 70% — Visor 3D + controles */}
      <div className="flex-1 h-screen relative">
        <StlViewer
          maxUrl={maxillary.stls[index]}
          manUrl={mandibular.stls[index]}
          showMax={showMax}
          showMan={showMan}
          focusFnRef={focusFnRef}
          viewFnRef={viewFnRef}
        />
        <PatientInfo isMobile={isMobile} name={patientName} />
        <ViewerActions prefix={prefix} isMobile={isMobile} />
        <ViewPresets onView={dir => viewFnRef.current(dir)} />
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
      </div>

      {/* 30% — Panel dental */}
      <div className="w-[30%] h-screen shrink-0 bg-[rgba(8,8,8,0.98)] border-l border-white/[0.06]">
        <DentalPanel spacings={spacings} />
      </div>
    </div>
  )
}
