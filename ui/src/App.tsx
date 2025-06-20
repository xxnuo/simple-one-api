import { Outlet } from 'react-router-dom'
import '@/App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Simple One API</h1>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <footer className="mt-auto py-4 text-center text-gray-500 text-sm">
        <p>Simple One API &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App
