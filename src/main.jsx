import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.jsx'
import Inicio from './paginas/Inicio.jsx'
import Painel from './paginas/Painel.jsx'
import NovaOcorrencia from './paginas/NovaOcorrencia.jsx'
import DetalheOcorrencia from './paginas/DetalheOcorrencia.jsx'
import Alertas from './paginas/Alertas.jsx'
import MinhasTarefas from './paginas/MinhasTarefas.jsx'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Inicio /> },
      { path: 'gestor', element: <Painel /> },
      { path: 'gestor/nova', element: <NovaOcorrencia /> },
      { path: 'gestor/ocorrencia/:id', element: <DetalheOcorrencia /> },
      { path: 'gestor/alertas', element: <Alertas /> },
      { path: 'tecnico', element: <MinhasTarefas /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)