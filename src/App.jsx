import { Outlet } from 'react-router-dom'

function App() {
  return (
    <>
      <header className="bg-dark text-white py-3 mb-4">
        <div className="container">
          <strong>LiftDesk</strong>
        </div>
      </header>
      <main className="container pb-5">
        <Outlet />
      </main>
    </>
  )
}

export default App