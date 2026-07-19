import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, FlipHorizontal2, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PRESET_VIEWS: { title: string; Icon: LucideIcon; dir: [number, number, number]; col: number; row: number }[] = [
  { title: 'Vista superior',          Icon: ArrowUp,          dir: [0,  1,  0], col: 2, row: 1 },
  { title: 'Vista lateral izquierda', Icon: ArrowLeft,        dir: [-1, 0,  0], col: 1, row: 2 },
  { title: 'Vista posterior',         Icon: FlipHorizontal2,  dir: [0,  0, -1], col: 2, row: 2 },
  { title: 'Vista lateral derecha',   Icon: ArrowRight,       dir: [1,  0,  0], col: 3, row: 2 },
  { title: 'Vista inferior',          Icon: ArrowDown,        dir: [0, -1,  0], col: 2, row: 3 },
]

interface ViewPresetsProps {
  onView: (dir: [number, number, number]) => void
  isMobile: boolean
}

export default function ViewPresets({ onView, isMobile }: ViewPresetsProps) {
  return (
    <div
      className={cn(
        'dark absolute top-1/2 -translate-y-1/2 grid z-20 pointer-events-auto',
        isMobile
          ? 'right-2 gap-0.5 [grid-template-columns:repeat(3,22px)] [grid-template-rows:repeat(3,22px)]'
          : 'right-5 gap-1 [grid-template-columns:repeat(3,30px)] [grid-template-rows:repeat(3,30px)]',
      )}
    >
      {PRESET_VIEWS.map(({ title, Icon, dir, col, row }) => (
        <Button
          key={title}
          variant="secondary"
          size="icon"
          onClick={() => onView(dir)}
          title={title}
          className={cn('rounded-md', isMobile ? 'size-[22px]' : 'size-[30px]')}
          style={{ gridColumn: col, gridRow: row }}
        >
          <Icon className={isMobile ? 'size-3' : 'size-3.5'} />
        </Button>
      ))}
    </div>
  )
}
