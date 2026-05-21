import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const DEMO_EMAIL = 'hi@orthoplanner3d.com'
const DEMO_PASSWORD = 'asdf1234'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      navigate('/app')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 380,
        background: 'rgba(16,16,16,0.98)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '48px 40px',
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        {/* Logo / branding */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 20,
          }}>
            <img src="/assets/logo-white.png" alt="OrthoPlan 3D" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.3px' }}>
            OrthoPlan 3D
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Visor de planificación dental
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="hi@orthoplanner3d.com"
              autoComplete="email"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                padding: '10px 14px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                padding: '10px 14px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(239,68,68,0.85)', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              marginTop: 6,
              background: 'rgba(255,255,255,0.92)',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '11px 0',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.1px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.92)')}
          >
            Iniciar sesión
          </button>
        </form>

        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          Acceso de demostración
        </p>
      </div>
    </div>
  )
}
