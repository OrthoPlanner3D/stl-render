import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Users, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Ítems del navbar flotante. Navegación imperativa (el proyecto no usa <Link>).
const NAV_ITEMS = [
  { path: '/patients', label: 'Pacientes', icon: Users },
  { path: '/upload', label: 'Cargar STL', icon: Upload },
]

/**
 * Layout compartido de las pantallas de gestión (/patients, /upload): un navbar flotante
 * para moverse entre ellas + el <Outlet> de la ruta activa. El navbar flota por encima
 * (fixed) para no interferir con el centrado full-screen de las páginas.
 */
export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 rounded-full border bg-background/80 backdrop-blur-lg shadow-sm px-2 py-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <Button
            key={path}
            size="sm"
            variant={location.pathname === path ? 'secondary' : 'ghost'}
            className="rounded-full"
            onClick={() => navigate(path)}
          >
            <Icon className="size-4 mr-1.5" />
            {label}
          </Button>
        ))}
      </nav>

      <Outlet />
    </>
  )
}
