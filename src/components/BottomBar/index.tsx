import { Play, Pause, Eye, EyeOff, Focus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import StepPanel from './StepPanel'
import { MAXILLARY, MANDIBULAR } from '../../data/stlAssets'

interface BottomBarProps {
  index: number
  total: number
  playing: boolean
  showMax: boolean
  showMan: boolean
  isMobile: boolean
  onTogglePlay: () => void
  onToggleMax: () => void
  onToggleMan: () => void
  onFocus: () => void
  onSelectFrame: (i: number) => void
}

export default function BottomBar({
  index, total, playing, showMax, showMan, isMobile,
  onTogglePlay, onToggleMax, onToggleMan, onFocus, onSelectFrame,
}: BottomBarProps) {
  const progress = index / (total - 1)

  return (
    <div
      className="dark"
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 20, pointerEvents: 'none', display: 'flex', flexDirection: 'column',
      }}
    >
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
        <Button
          variant="secondary"
          size={isMobile ? 'icon' : 'sm'}
          onClick={onToggleMax}
          className={cn(!showMax && 'opacity-50')}
        >
          {showMax ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          {!isMobile && 'Maxilar'}
        </Button>

        {/* Play */}
        <Button
          variant={playing ? 'destructive' : 'default'}
          size="icon"
          onClick={onTogglePlay}
          className="rounded-full size-10"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
        </Button>

        {/* Mandibular visibility */}
        <Button
          variant="secondary"
          size={isMobile ? 'icon' : 'sm'}
          onClick={onToggleMan}
          className={cn(!showMan && 'opacity-50')}
        >
          {showMan ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          {!isMobile && 'Mandibular'}
        </Button>

        {/* Focus */}
        <Button
          variant="secondary"
          size={isMobile ? 'icon' : 'sm'}
          onClick={onFocus}
          title="Volver a posición inicial"
        >
          <Focus className="size-3.5" />
          {!isMobile && 'Focus'}
        </Button>

        {/* Step counter */}
        <span style={{ fontSize: 10, color: '#999', letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {MAXILLARY.names[index]} / {MAXILLARY.names[total - 1]}
        </span>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

      {/* Frame strips */}
      <div style={{ pointerEvents: 'auto' }}>
        <StepPanel
          label="Maxilar" names={MAXILLARY.names} filenames={MAXILLARY.filenames}
          index={index} visible={showMax} onSelect={onSelectFrame} isMobile={isMobile}
        />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 12px' }} />
        <StepPanel
          label="Mandibular" names={MANDIBULAR.names} filenames={MANDIBULAR.filenames}
          index={index} visible={showMan} onSelect={onSelectFrame} isMobile={isMobile}
        />
      </div>
    </div>
  )
}
