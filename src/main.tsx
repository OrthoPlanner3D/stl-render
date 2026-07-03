import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './styles/index.css'
import ViewerPage from './pages/ViewerPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import UploadPage from './pages/UploadPage.tsx'
import PatientsPage from './pages/PatientsPage.tsx'
import AppLayout from './components/AppLayout.tsx'

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
