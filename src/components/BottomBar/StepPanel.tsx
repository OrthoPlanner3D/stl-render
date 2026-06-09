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
    <div className="dark" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '4px 10px' : '6px 16px' }}>
      <span style={{
        fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: visible ? '#666' : '#333', width: isMobile ? 64 : 76, flexShrink: 0, transition: 'color 0.2s',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', flex: 1, padding: '2px 2px', scrollbarWidth: 'none' }}>
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
