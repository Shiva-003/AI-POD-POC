import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SkinExamination from './components/SkinExamination/SkinExamination.tsx'
import Home from './components/HomePage/HomePage.tsx'
import EyeExamination from './components/EyeExamination/EyeExamination.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App can include an <Outlet />
    children: [
      { index: true, element: <Home /> },
      { path: 'skin-examination', element: <SkinExamination /> },
      { path: 'eye-examination', element: <EyeExamination/> }
    ],
  },
]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
