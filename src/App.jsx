import { Outlet } from 'react-router-dom'
import Cabecalho from './componentes/Cabecalho.jsx'

function App() {
  return (
    <>
      <Cabecalho />
      <main className="container pb-5">
        <Outlet />
      </main>
    </>
  )
}

export default App
