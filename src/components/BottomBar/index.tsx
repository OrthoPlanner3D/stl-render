import { Play, Pause, Eye, EyeOff, Focus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import StepPanel from './StepPanel'
import type { ArchAssets } from '../../data/stlAssets'

interface BottomBarProps {
  index: number
  total: number
  playing: boolean
  showMax: boolean
  showMan: boolean
  isMobile: boolean
  maxillary: ArchAssets
  mandibular: ArchAssets
  onTogglePlay: () => void
  onToggleMax: () => void
  onToggleMan: () => void
  onFocus: () => void
  onSelectFrame: (i: number) => void
}

export default function BottomBar({
  index, total, playing, showMax, showMan, isMobile, maxillary, mandibular,
  onTogglePlay, onToggleMax, onToggleMan, onFocus, onSelectFrame,
}: BottomBarProps) {
  const progress = index / (total - 1)

  return (
    <div className="dark absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-lg border-t border-white/5 z-20 pointer-events-none flex flex-col">
      {/* Controls row */}
      <div className={cn(
        'flex items-center justify-center pointer-events-auto',
        isMobile ? 'gap-1.5 pt-2.5 px-3 pb-1.5' : 'gap-2.5 pt-3 px-4 pb-2',
      )}>
        {/* Progress track */}
        <div className={cn('h-0.5 rounded-[1px] bg-white/[0.08] overflow-hidden shrink-0', isMobile ? 'w-[60px]' : 'w-[100px]')}>
          <div
            className="h-full bg-white/35 rounded-[1px] transition-[width] duration-[50ms] linear"
            style={{ width: `${progress * 100}%` }}
          />
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
        <span className="text-[10px] text-[#999] tracking-[0.08em] tabular-nums shrink-0">
          {maxillary.names[index]} / {maxillary.names[total - 1]}
        </span>
      </div>

      <div className="h-px bg-white/5 mx-3" />

      {/* Frame strips */}
      <div className="pointer-events-auto">
        <StepPanel
          label="Maxilar" names={maxillary.names} filenames={maxillary.filenames}
          index={index} visible={showMax} onSelect={onSelectFrame} isMobile={isMobile}
        />
        <div className="h-px bg-white/[0.04] mx-3" />
        <StepPanel
          label="Mandibular" names={mandibular.names} filenames={mandibular.filenames}
          index={index} visible={showMan} onSelect={onSelectFrame} isMobile={isMobile}
        />
      </div>
    </div>
  )
}
