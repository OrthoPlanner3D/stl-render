export type ToothType = 'central' | 'lateral' | 'canine' | 'premolar' | 'molar' | 'wisdom'

export const ARCH_ANGLES = [-85, -73, -59, -47, -37, -27, -17, -6, 6, 17, 27, 37, 47, 59, 73, 85]

export const TOOTH_TYPE_MAP: ToothType[] = [
  'wisdom', 'molar', 'molar', 'premolar', 'premolar', 'canine', 'lateral', 'central',
  'central', 'lateral', 'canine', 'premolar', 'premolar', 'molar', 'molar', 'wisdom',
]

export default function ToothShape({ type }: { type: ToothType }) {
  const fill = 'rgba(220,215,205,0.18)'
  const stroke = 'rgba(255,255,255,0.32)'
  const sw = 0.7
  const groove = 'rgba(255,255,255,0.18)'

  switch (type) {
    case 'central':
      return <path fill={fill} stroke={stroke} strokeWidth={sw}
        d="M -4,-2 L 4,-2 Q 4.3,0 4,2.5 Q 0,3.5 -4,2.5 Q -4.3,0 -4,-2 Z" />
    case 'lateral':
      return <path fill={fill} stroke={stroke} strokeWidth={sw}
        d="M -3,-1.8 L 3,-1.8 Q 3.2,0 3,2.2 Q 0,3 -3,2.2 Q -3.2,0 -3,-1.8 Z" />
    case 'canine':
      return <path fill={fill} stroke={stroke} strokeWidth={sw}
        d="M 0,5 Q 5,4.5 5.5,1 Q 5.5,-3.5 0,-5 Q -5.5,-3.5 -5.5,1 Q -5,4.5 0,5 Z" />
    case 'premolar':
      return <g>
        <path fill={fill} stroke={stroke} strokeWidth={sw}
          d="M -4,0 C -4,-4.5 4,-4.5 4,0 C 4,4.5 -4,4.5 -4,0 Z" />
        <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke={groove} strokeWidth={1} />
      </g>
    case 'molar':
      return <g>
        <path fill={fill} stroke={stroke} strokeWidth={sw}
          d="M -4.5,-5 Q 0,-6.5 4.5,-5 Q 6.5,-2.5 6.5,0 Q 6.5,2.5 4.5,5 Q 0,6.5 -4.5,5 Q -6.5,2.5 -6.5,0 Q -6.5,-2.5 -4.5,-5 Z" />
        <line x1="-6.5" y1="0" x2="6.5" y2="0" stroke={groove} strokeWidth={1} />
        <line x1="0" y1="-6" x2="0" y2="6" stroke={groove} strokeWidth={1} />
      </g>
    case 'wisdom':
      return <g>
        <path fill={fill} stroke={stroke} strokeWidth={sw}
          d="M -4,-4.5 Q 0,-5.8 4,-4.5 Q 5.8,0 4,4.5 Q 0,5.8 -4,4.5 Q -5.8,0 -4,-4.5 Z" />
        <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke={groove} strokeWidth={0.9} />
        <line x1="0" y1="-5" x2="0" y2="5" stroke={groove} strokeWidth={0.9} />
      </g>
  }
}
