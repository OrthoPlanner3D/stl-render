import { useState, useRef, useEffect, useCallback } from 'react'
import { useBreakpoint } from './hooks/useBreakpoint'
import { MAXILLARY, MANDIBULAR, allStls } from './data/stlAssets'
import StlViewer from './components/StlViewer'
import ThumbnailGenerator from './components/ThumbnailGenerator'
import DentalPanel from './components/DentalPanel'
import BottomBar from './components/BottomBar'
import ViewPresets from './components/ViewPresets'
import PatientInfo from './components/PatientInfo'

export default function App() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showMax, setShowMax] = useState(true)
  const [showMan, setShowMan] = useState(true)
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map())
  const { isMobile } = useBreakpoint()
  const focusFnRef = useRef<() => void>(() => {})
  const viewFnRef = useRef<(dir: [number, number, number]) => void>(() => {})
  const total = MAXILLARY.stls.length

  const handleCapture = useCallback((url: string, dataUrl: string) => {
    setThumbnails(prev => new Map(prev).set(url, dataUrl))
  }, [])

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
    <div style={{
      width: '100%', height: '100vh', background: '#000',
      fontFamily: 'system-ui, sans-serif', overflow: 'hidden', display: 'flex',
    }}>
      {/* 70% — Visor 3D + controles */}
      <div style={{ flex: 1, height: '100vh', position: 'relative' }}>
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
          thumbnails={thumbnails}
          isMobile={isMobile}
          onTogglePlay={togglePlay}
          onToggleMax={() => setShowMax(v => !v)}
          onToggleMan={() => setShowMan(v => !v)}
          onFocus={() => focusFnRef.current()}
          onSelectFrame={i => { setIndex(i); setPlaying(false) }}
        />
        <ThumbnailGenerator urls={allStls} onCapture={handleCapture} />
      </div>

      {/* 30% — Panel dental */}
      <div style={{
        width: '30%', height: '100vh', flexShrink: 0,
        background: 'rgba(8,8,8,0.98)', borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}>
        <DentalPanel />
      </div>
    </div>
  )
}
