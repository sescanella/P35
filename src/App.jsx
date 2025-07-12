import Dashboard from './pages/Dashboard.jsx'
import { useTheme } from './contexts/ThemeContext.jsx'

function App() {
  const { theme } = useTheme();
  
  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: theme.primary }}
    >
      <header 
        className="shadow-sm transition-colors duration-300"
        style={{ 
          backgroundColor: theme.card, 
          borderBottomColor: theme.border,
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: theme.text }}
          >
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
