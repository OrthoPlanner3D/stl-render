import { useState } from 'react'
import { Play, Pause, Eye, EyeOff, Focus } from 'lucide-react'
import { btnBase } from '../../styles/ui'
import StepPanel from './StepPanel'
import { MAXILLARY, MANDIBULAR } from '../../data/stlAssets'

interface BottomBarProps {
  index: number
  total: number
  playing: boolean
  showMax: boolean
  showMan: boolean
  thumbnails: Map<string, string>
  isMobile: boolean
  onTogglePlay: () => void
  onToggleMax: () => void
  onToggleMan: () => void
  onFocus: () => void
  onSelectFrame: (i: number) => void
}

export default function BottomBar({
  index, total, playing, showMax, showMan, thumbnails, isMobile,
  onTogglePlay, onToggleMax, onToggleMan, onFocus, onSelectFrame,
}: BottomBarProps) {
  const [hoverPlay, setHoverPlay] = useState(false)
  const [hoverMax, setHoverMax] = useState(false)
  const [hoverMan, setHoverMan] = useState(false)
  const [hoverFocus, setHoverFocus] = useState(false)
  const progress = index / (total - 1)

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      zIndex: 20, pointerEvents: 'none', display: 'flex', flexDirection: 'column',
    }}>
      {/* Controls row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: isMobile ? 6 : 10, padding: isMobile ? '10px 12px 6px' : '12px 16px 8px',
        pointerEvents: 'auto',
      }}>
        {/* Progress track */}
        <div style={{ width: isMobile ? 60 : 100, height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'rgba(255,255,255,0.35)', borderRadius: 1, transition: 'width 0.05s linear' }} />
        </div>

        {/* Maxilar visibility */}
        <button
          onClick={onToggleMax}
          onMouseEnter={() => setHoverMax(true)}
          onMouseLeave={() => setHoverMax(false)}
          style={{
            ...btnBase, padding: isMobile ? '8px' : '8px 16px',
            color: showMax ? (hoverMax ? '#ccc' : '#777') : (hoverMax ? '#555' : '#333'),
            background: hoverMax ? 'rgba(30,30,30,0.9)' : btnBase.background,
            borderColor: showMax ? (hoverMax ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.06)',
          }}
        >
          {showMax ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
          {!isMobile && 'Maxilar'}
        </button>

        {/* Play */}
        <button
          onClick={onTogglePlay}
          onMouseEnter={() => setHoverPlay(true)}
          onMouseLeave={() => setHoverPlay(false)}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
            background: playing
              ? (hoverPlay ? 'rgba(180,50,50,0.85)' : 'rgba(150,40,40,0.8)')
              : (hoverPlay ? 'rgba(30,30,30,0.9)' : 'rgba(10,10,10,0.75)'),
            color: playing ? '#e07070' : (hoverPlay ? '#ccc' : '#999'),
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', backdropFilter: 'blur(12px)',
            transform: hoverPlay ? 'scale(1.08)' : 'scale(1)', pointerEvents: 'auto',
          }}
        >
          {playing ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} style={{ marginLeft: 2 }} />}
        </button>

        {/* Mandibular visibility */}
        <button
          onClick={onToggleMan}
          onMouseEnter={() => setHoverMan(true)}
          onMouseLeave={() => setHoverMan(false)}
          style={{
            ...btnBase, padding: isMobile ? '8px' : '8px 16px',
            color: showMan ? (hoverMan ? '#ccc' : '#777') : (hoverMan ? '#555' : '#333'),
            background: hoverMan ? 'rgba(30,30,30,0.9)' : btnBase.background,
            borderColor: showMan ? (hoverMan ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.06)',
          }}
        >
          {showMan ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
          {!isMobile && 'Mandibular'}
        </button>

        {/* Focus */}
        <button
          onClick={onFocus}
          onMouseEnter={() => setHoverFocus(true)}
          onMouseLeave={() => setHoverFocus(false)}
          title="Volver a posición inicial"
          style={{
            ...btnBase, padding: isMobile ? '8px' : '8px 12px',
            color: hoverFocus ? '#ccc' : '#777',
            background: hoverFocus ? 'rgba(30,30,30,0.9)' : btnBase.background,
          }}
        >
          <Focus size={14} strokeWidth={1.5} />
          {!isMobile && 'Focus'}
        </button>

        {/* Step counter */}
        <span style={{ fontSize: 10, color: '#444', letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {MAXILLARY.names[index]} / {MAXILLARY.names[total - 1]}
        </span>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

      {/* Frame strips */}
      <div style={{ pointerEvents: 'auto' }}>
        <StepPanel
          label="Maxilar" names={MAXILLARY.names} filenames={MAXILLARY.filenames}
          stls={MAXILLARY.stls} thumbnails={thumbnails} index={index}
          visible={showMax} onSelect={onSelectFrame} isMobile={isMobile}
        />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 12px' }} />
        <StepPanel
          label="Mandibular" names={MANDIBULAR.names} filenames={MANDIBULAR.filenames}
          stls={MANDIBULAR.stls} thumbnails={thumbnails} index={index}
          visible={showMan} onSelect={onSelectFrame} isMobile={isMobile}
        />
      </div>
    </div>
  )
}
