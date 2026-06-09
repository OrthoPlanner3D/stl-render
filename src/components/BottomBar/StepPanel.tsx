import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepPanelProps {
  label: string
  names: string[]
  filenames: string[]
  index: number
  visible: boolean
  onSelect: (i: number) => void
  isMobile: boolean
}

export default function StepPanel({ label, names, filenames, index, visible, onSelect, isMobile }: StepPanelProps) {
  return (
    <div className={cn('dark flex items-center gap-2', isMobile ? 'py-1 px-2.5' : 'py-1.5 px-4')}>
      <span className={cn(
        'text-[9px] font-semibold tracking-[0.12em] uppercase shrink-0 transition-colors duration-200',
        visible ? 'text-[#666]' : 'text-[#333]',
        isMobile ? 'w-16' : 'w-[76px]',
      )}>
        {label}
      </span>
      <div className="flex gap-1 overflow-x-auto flex-1 p-0.5 [scrollbar-width:none]">
        {names.map((name, i) => {
          const isActive = i === index
          const isPast = i < index
          return (
            <Button
              key={i}
              variant="secondary"
              size="icon"
              onClick={() => onSelect(i)}
              title={filenames[i]}
              className={cn(
                'relative overflow-hidden rounded-md shrink-0 text-[10px]',
                isMobile ? 'size-9' : 'size-12',
                isActive && 'font-semibold ring-1 ring-white/40',
                isPast && !isActive && 'text-green-500',
                !isActive && !isPast && 'text-muted-foreground',
                !visible && 'opacity-30',
              )}
            >
              {name}
              {isPast && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700/70" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
