import { cn } from '@/lib/utils'

interface PatientInfoProps {
  isMobile: boolean
  name: string | null
}

export default function PatientInfo({ isMobile, name }: PatientInfoProps) {
  return (
    <div className={cn(
      'absolute z-10 pointer-events-none flex flex-col',
      isMobile ? 'top-3 left-3 gap-2' : 'top-6 left-6 gap-3',
    )}>
      <img
        src="/assets/logo-white.png"
        alt="Logo"
        className={cn('opacity-90 object-cover lg:mx-auto', isMobile ? 'w-10' : 'w-16')}
      />
      <div className="pl-0.5">
        <div className={cn(
          'tracking-[0.14em] uppercase text-[#666] mb-0.5',
          isMobile ? 'text-[8px]' : 'text-[9px]',
        )}>
          Paciente
        </div>
        <div className={cn(
          'font-semibold text-[#e0e0e0] tracking-[0.02em]',
          isMobile ? 'text-xs' : 'text-[15px]',
        )}>
          {name ?? '—'}
        </div>
      </div>
    </div>
  )
}
