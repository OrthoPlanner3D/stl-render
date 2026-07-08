import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './styles/index.css'
import ViewerPage from './pages/ViewerPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import PatientsPage from './pages/PatientsPage.tsx'
import AppLayout from './components/AppLayout.tsx'

// Red de seguridad contra extensiones de traducción (Google Translate y similares).
// Cuando el traductor reemplaza nodos de texto que React controla, el próximo render
// choca al remover/insertar nodos que ya no reconoce y lanza NotFoundError, tumbando la
// app. El HTML ya declara notranslate, pero algunas extensiones lo ignoran: acá
// convertimos ese crash en un no-op silencioso. Patrón conocido de facebook/react#11538.
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn('[i18n-guard] removeChild evitado: el nodo ya fue movido por una extensión de traducción.')
      return child
    }
    return originalRemoveChild.call(this, child) as T
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn('[i18n-guard] insertBefore ajustado: el nodo de referencia ya fue movido por una extensión de traducción.')
      return originalInsertBefore.call(this, newNode, null) as T
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T
  }
}

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/app', element: <ViewerPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/patients', element: <PatientsPage /> },
      { path: '/upload', element: <UploadPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
