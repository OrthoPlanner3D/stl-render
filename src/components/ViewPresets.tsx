import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, FlipHorizontal2 } from 'lucide-react'

const PRESET_VIEWS: { title: string; icon: React.ReactNode; dir: [number, number, number]; col: number; row: number }[] = [
  { title: 'Vista superior',          icon: <ArrowUp size={14} strokeWidth={1.5} />,        dir: [0,  1,  0], col: 2, row: 1 },
  { title: 'Vista lateral izquierda', icon: <ArrowLeft size={14} strokeWidth={1.5} />,       dir: [-1, 0,  0], col: 1, row: 2 },
  { title: 'Vista posterior',         icon: <FlipHorizontal2 size={14} strokeWidth={1.5} />, dir: [0,  0, -1], col: 2, row: 2 },
  { title: 'Vista lateral derecha',   icon: <ArrowRight size={14} strokeWidth={1.5} />,      dir: [1,  0,  0], col: 3, row: 2 },
  { title: 'Vista inferior',          icon: <ArrowDown size={14} strokeWidth={1.5} />,       dir: [0, -1,  0], col: 2, row: 3 },
]

interface ViewPresetsProps {
  onView: (dir: [number, number, number]) => void
}

export default function ViewPresets({ onView }: ViewPresetsProps) {
  return (
    <div style={{
      position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
      display: 'grid', gridTemplateColumns: 'repeat(3, 30px)', gridTemplateRows: 'repeat(3, 30px)',
      gap: 4, zIndex: 20, pointerEvents: 'auto',
    }}>
      {PRESET_VIEWS.map(({ title, icon, dir, col, row }) => (
        <button
          key={title}
          onClick={() => onView(dir)}
          title={title}
          style={{
            gridColumn: col, gridRow: row, width: 30, height: 30, borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,10,10,0.7)',
            backdropFilter: 'blur(12px)', color: '#666', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s, border-color 0.15s, background 0.15s', padding: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ccc'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.background = 'rgba(30,30,30,0.9)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#666'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.background = 'rgba(10,10,10,0.7)'
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
