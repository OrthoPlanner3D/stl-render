import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, FlipHorizontal2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PRESET_VIEWS: { title: string; icon: React.ReactNode; dir: [number, number, number]; col: number; row: number }[] = [
  { title: 'Vista superior',          icon: <ArrowUp className="size-3.5" />,        dir: [0,  1,  0], col: 2, row: 1 },
  { title: 'Vista lateral izquierda', icon: <ArrowLeft className="size-3.5" />,       dir: [-1, 0,  0], col: 1, row: 2 },
  { title: 'Vista posterior',         icon: <FlipHorizontal2 className="size-3.5" />, dir: [0,  0, -1], col: 2, row: 2 },
  { title: 'Vista lateral derecha',   icon: <ArrowRight className="size-3.5" />,      dir: [1,  0,  0], col: 3, row: 2 },
  { title: 'Vista inferior',          icon: <ArrowDown className="size-3.5" />,       dir: [0, -1,  0], col: 2, row: 3 },
]

interface ViewPresetsProps {
  onView: (dir: [number, number, number]) => void
}

export default function ViewPresets({ onView }: ViewPresetsProps) {
  return (
    <div
      className="dark absolute right-5 top-1/2 -translate-y-1/2 grid gap-1 z-20 pointer-events-auto [grid-template-columns:repeat(3,30px)] [grid-template-rows:repeat(3,30px)]"
    >
      {PRESET_VIEWS.map(({ title, icon, dir, col, row }) => (
        <Button
          key={title}
          variant="secondary"
          size="icon"
          onClick={() => onView(dir)}
          title={title}
          className="size-[30px] rounded-md"
          style={{ gridColumn: col, gridRow: row }}
        >
          {icon}
        </Button>
      ))}
    </div>
  )
}
