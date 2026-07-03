import ToothShape, { ARCH_ANGLES, TOOTH_TYPE_MAP } from './ToothShape'

function archPoint(angleDeg: number, cx: number, cy: number, R: number, flip: boolean) {
  const a = (angleDeg * Math.PI) / 180
  const dy = R * (1 - Math.cos(a))
  return {
    x: cx + R * Math.sin(a),
    y: flip ? cy - dy : cy + dy,
    // Lower arch tangent is negated, so rotate opposite to align grooves with arch direction
    angle: flip ? -angleDeg : angleDeg,
  }
}

interface DentalArchProps {
  archKey: 'max' | 'man'
  cx: number
  cy: number
  flip: boolean
  ipr: Record<string, string>
  /** Sin interacción: no muestra cursor, no dispara onContactClick. */
  readOnly?: boolean
  onContactClick: (id: string, e: React.MouseEvent<SVGElement>) => void
}

export default function DentalArch({ archKey, cx, cy, flip, ipr, readOnly, onContactClick }: DentalArchProps) {
  const points = ARCH_ANGLES.map(a => archPoint(a, cx, cy, 70, flip))

  return (
    <g>
      {points.map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y}) rotate(${p.angle})`}>
          <ToothShape type={TOOTH_TYPE_MAP[i]} />
        </g>
      ))}

      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1]
        const mx = (p.x + next.x) / 2
        const my = (p.y + next.y) / 2
        const id = `${archKey}_${i}_${i + 1}`
        const val = ipr[id]
        const midAngle = (ARCH_ANGLES[i] + ARCH_ANGLES[i + 1]) / 2
        const contactAngle = flip ? -midAngle : midAngle

        return (
          <g
            key={id}
            className={readOnly ? undefined : 'cursor-pointer'}
            onClick={readOnly ? undefined : (e) => { e.stopPropagation(); onContactClick(id, e) }}
          >
            {!readOnly && (
              <rect
                x={mx - 8} y={my - 8} width={16} height={16}
                fill="transparent"
                transform={`rotate(${contactAngle}, ${mx}, ${my})`}
              />
            )}
            <line
              x1={mx - 4} y1={my} x2={mx + 4} y2={my}
              stroke={val ? '#ffc864' : 'rgba(255,255,255,0.22)'}
              strokeWidth={val ? 1.5 : 0.8}
              transform={`rotate(${contactAngle}, ${mx}, ${my})`}
            />
            {val && (
              <text
                x={mx} y={flip ? my + 9 : my - 5}
                textAnchor="middle"
                fill="#ffc864"
                fontSize={5.5}
                fontFamily="system-ui, sans-serif"
              >
                {val}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}
