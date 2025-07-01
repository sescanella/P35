import Dashboard from './pages/Dashboard.jsx'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-black shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-black">
            Project 35
          </h1>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Dashboard />
      </main>
    </div>
  )
}

export default App
