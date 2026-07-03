import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import DentalArch from './DentalArch'

interface DentalPanelProps {
  /** Valores de IPR por contacto (controlado). */
  ipr: Record<string, string>
  /** Si se omite, el panel es de solo-lectura (no edita ni abre el input). */
  onIprChange?: (next: Record<string, string>) => void
}

export default function DentalPanel({ ipr, onIprChange }: DentalPanelProps) {
  const readOnly = !onIprChange
  const [pendingContact, setPendingContact] = useState<string | null>(null)
  const [pendingIprValue, setPendingIprValue] = useState('')
  const [pendingInputPos, setPendingInputPos] = useState<{ x: number; y: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  function handleContactClick(contactId: string, e: React.MouseEvent<SVGElement>) {
    if (!onIprChange) return
    const rect = panelRef.current!.getBoundingClientRect()
    setPendingContact(contactId)
    setPendingIprValue(ipr[contactId] ?? '')
    setPendingInputPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  function commitIpr() {
    if (!pendingContact || !onIprChange) return
    if (pendingIprValue.trim()) {
      onIprChange({ ...ipr, [pendingContact]: pendingIprValue.trim() })
    } else {
      const n = { ...ipr }; delete n[pendingContact]; onIprChange(n)
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
        <DentalArch archKey="max" cx={100} cy={5} flip={false} ipr={ipr} readOnly={readOnly} onContactClick={handleContactClick} />
      </svg>

      <Separator className="my-4" />

      <div className="text-[9px] tracking-[0.14em] uppercase text-[#444] mb-1.5">
        Mandibular
      </div>
      <svg viewBox="0 0 200 90" width="100%" className="block overflow-visible">
        <DentalArch archKey="man" cx={100} cy={85} flip={true} ipr={ipr} readOnly={readOnly} onContactClick={handleContactClick} />
      </svg>

      {!readOnly && pendingContact && pendingInputPos && (
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
            value={pendingIprValue}
            onChange={e => setPendingIprValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitIpr()
              if (e.key === 'Escape') { setPendingContact(null); setPendingInputPos(null) }
            }}
            onBlur={commitIpr}
            className="h-6 w-[50px] border-none bg-transparent p-0 text-[13px] text-[#ffc864] focus-visible:ring-0"
          />
          <span className="text-[11px] text-[#555]">mm</span>
        </div>
      )}
    </div>
  )
}
