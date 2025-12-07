import { useAuth } from './context/AuthContext'
import Auth from './components/auth'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚔️</div>
          <p className="text-cyber-cyan text-xl font-bold">Loading HealthQuest...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth type="login" />
  }

  return <Dashboard />
}

export default App
