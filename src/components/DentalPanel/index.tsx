import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import DentalArch from './DentalArch'

const STORAGE_KEY = 'dental-spacings'

export default function DentalPanel() {
  const [spacings, setSpacings] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
  })
  const [pendingContact, setPendingContact] = useState<string | null>(null)
  const [pendingSpacingValue, setPendingSpacingValue] = useState('')
  const [pendingInputPos, setPendingInputPos] = useState<{ x: number; y: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spacings))
  }, [spacings])

  function handleContactClick(contactId: string, e: React.MouseEvent<SVGElement>) {
    const rect = panelRef.current!.getBoundingClientRect()
    setPendingContact(contactId)
    setPendingSpacingValue(spacings[contactId] ?? '')
    setPendingInputPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  function commitSpacing() {
    if (!pendingContact) return
    if (pendingSpacingValue.trim()) {
      setSpacings(prev => ({ ...prev, [pendingContact]: pendingSpacingValue.trim() }))
    } else {
      setSpacings(prev => { const n = { ...prev }; delete n[pendingContact!]; return n })
    }
    setPendingContact(null)
    setPendingInputPos(null)
  }

  return (
    <div
      ref={panelRef}
      className="dark relative flex h-full w-full flex-col justify-center px-5 py-6 pointer-events-auto"
    >
      <div className="text-[9px] tracking-[0.14em] uppercase text-[#444] mb-1.5">
        Maxilar
      </div>
      <svg viewBox="0 0 200 90" width="100%" className="block overflow-visible">
        <DentalArch archKey="max" cx={100} cy={5} flip={false} spacings={spacings} onContactClick={handleContactClick} />
      </svg>

      <Separator className="my-4" />

      <div className="text-[9px] tracking-[0.14em] uppercase text-[#444] mb-1.5">
        Mandibular
      </div>
      <svg viewBox="0 0 200 90" width="100%" className="block overflow-visible">
        <DentalArch archKey="man" cx={100} cy={85} flip={true} spacings={spacings} onContactClick={handleContactClick} />
      </svg>

      {pendingContact && pendingInputPos && (
        <div
          className="absolute z-30 bg-[rgba(10,10,10,0.95)] border border-[rgba(255,200,100,0.35)] rounded-[5px] px-1.5 py-0.5 flex items-center gap-1"
          style={{ left: pendingInputPos.x + 8, top: pendingInputPos.y - 14 }}
        >
          <Input
            autoFocus
            type="number"
            step="0.1"
            min="0"
            max="5"
            placeholder="0.0"
            value={pendingSpacingValue}
            onChange={e => setPendingSpacingValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitSpacing()
              if (e.key === 'Escape') { setPendingContact(null); setPendingInputPos(null) }
            }}
            onBlur={commitSpacing}
            className="h-6 w-[50px] border-none bg-transparent p-0 text-[13px] text-[#ffc864] focus-visible:ring-0"
          />
          <span className="text-[11px] text-[#555]">mm</span>
        </div>
      )}
    </div>
  )
}
