interface PatientInfoProps {
  isMobile: boolean
}

export default function PatientInfo({ isMobile }: PatientInfoProps) {
  return (
    <div style={{
      position: 'absolute', top: isMobile ? 12 : 24, left: isMobile ? 12 : 24,
      zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column',
      gap: isMobile ? 8 : 12,
    }}>
      <img src="/assets/logo-white.png" alt="Logo" style={{ height: isMobile ? 36 : 72, opacity: 0.9 }} />
      <div style={{ paddingLeft: 2 }}>
        <div style={{ fontSize: isMobile ? 8 : 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#666', marginBottom: 3 }}>
          Paciente
        </div>
        <div style={{ fontSize: isMobile ? 12 : 15, fontWeight: 600, color: '#e0e0e0', letterSpacing: '0.02em' }}>
          John Wick
        </div>
      </div>
    </div>
  )
}
