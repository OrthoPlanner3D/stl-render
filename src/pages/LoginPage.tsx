import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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
      navigate('/patients')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="dark min-h-screen bg-black flex items-center justify-center">
      <Card className="w-[380px]">
        <CardHeader className="items-center text-center">
          <div className="flex justify-center mb-2">
            <img src="/assets/logo-white.png" alt="OrthoPlan 3D" className="size-12 object-contain" />
          </div>
          <CardTitle className="text-xl">OrthoPlanner 3D</CardTitle>
          <CardDescription>Visor de planificación dental</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="hi@orthoplanner3d.com"
                autoComplete="email"
                aria-invalid={!!error}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!error}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full mt-1.5">
              Iniciar sesión
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground/60">Acceso de demostración</p>
        </CardFooter>
      </Card>
    </div>
  )
}
