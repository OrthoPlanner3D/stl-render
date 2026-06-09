import { useState, useRef, useEffect } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { MAXILLARY, MANDIBULAR } from '../data/stlAssets'
import StlViewer from '../components/StlViewer'
import DentalPanel from '../components/DentalPanel'
import BottomBar from '../components/BottomBar'
import ViewPresets from '../components/ViewPresets'
import PatientInfo from '../components/PatientInfo'

export default function ViewerPage() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showMax, setShowMax] = useState(true)
  const [showMan, setShowMan] = useState(true)
  const { isMobile } = useBreakpoint()
  const focusFnRef = useRef<() => void>(() => {})
  const viewFnRef = useRef<(dir: [number, number, number]) => void>(() => {})
  const total = MAXILLARY.stls.length

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

  return (
    <div className="w-full h-screen bg-black font-sans overflow-hidden flex">
      {/* 70% — Visor 3D + controles */}
      <div className="flex-1 h-screen relative">
        <StlViewer
          maxUrl={MAXILLARY.stls[index]}
          manUrl={MANDIBULAR.stls[index]}
          showMax={showMax}
          showMan={showMan}
          focusFnRef={focusFnRef}
          viewFnRef={viewFnRef}
        />
        <PatientInfo isMobile={isMobile} />
        <ViewPresets onView={dir => viewFnRef.current(dir)} />
        <BottomBar
          index={index}
          total={total}
          playing={playing}
          showMax={showMax}
          showMan={showMan}
          isMobile={isMobile}
          onTogglePlay={togglePlay}
          onToggleMax={() => setShowMax(v => !v)}
          onToggleMan={() => setShowMan(v => !v)}
          onFocus={() => focusFnRef.current()}
          onSelectFrame={i => { setIndex(i); setPlaying(false) }}
        />
      </div>

      {/* 30% — Panel dental */}
      <div className="w-[30%] h-screen shrink-0 bg-[rgba(8,8,8,0.98)] border-l border-white/[0.06]">
        <DentalPanel />
      </div>
    </div>
  )
}
