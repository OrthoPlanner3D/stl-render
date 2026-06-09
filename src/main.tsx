import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import './styles/index.css'
import ViewerPage from './pages/ViewerPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import UploadPage from './pages/UploadPage.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/app', element: <ViewerPage /> },
  { path: '/upload', element: <UploadPage /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
