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
  const size = isMobile ? 36 : 48

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '4px 10px' : '6px 16px' }}>
      <div style={{
        fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: visible ? '#666' : '#333', minWidth: isMobile ? 52 : 64, flexShrink: 0, transition: 'color 0.2s',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', flex: 1, padding: '2px 0', scrollbarWidth: 'none' }}>
        {names.map((name, i) => {
          const isActive = i === index
          const isPast = i < index
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              title={filenames[i]}
              style={{
                flexShrink: 0, width: size, height: size, borderRadius: 6, padding: 0, cursor: 'pointer',
                border: isActive ? '1px solid rgba(255,255,255,0.45)' : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                overflow: 'hidden', opacity: visible ? 1 : 0.3, position: 'relative', transition: 'border-color 0.15s, opacity 0.2s',
              }}
            >
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', height: '100%', fontSize: 10,
                color: isActive ? '#e0e0e0' : isPast ? '#4a7a4a' : '#333',
                fontWeight: isActive ? 600 : 400,
              }}>
                {name}
              </span>
              {isPast && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(74,122,74,0.7)' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
