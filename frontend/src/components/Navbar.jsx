import { useState } from 'react'
import { Home, User, TrendingUp, Settings, LogOut, Menu, X, Users, Zap, ClipboardList, Brain, ChevronLeft, ChevronRight, Sword, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Navbar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'log-activity', label: 'Log Activity', icon: ClipboardList },
    { id: 'calendar', label: 'Calendar', icon: TrendingUp },
    { id: 'ai-coach', label: 'AI Coach', icon: Brain },
    { id: 'abilities', label: 'Abilities', icon: Zap },
    { id: 'guild', label: 'Guild', icon: Users },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <>
      {/* Desktop Sidebar - Enhanced */}
      <aside className={`hidden md:flex flex-col glass-card border-r-2 border-gradient-to-b from-cyan-400/50 to-purple-400/30 fixed left-0 top-0 h-screen transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Logo Section - Enhanced */}
        <div className="p-4 border-b-2 border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="p-2 bg-gradient-to-br from-cyan-400/30 to-blue-500/20 rounded-lg">
                <Sword className="w-8 h-8 text-cyan-300 animate-glow-pulse" style={{ filter: 'drop-shadow(0 0 15px #06B6D4)' }} />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-xl font-bold gradient-text tracking-wide">HealthQuest</h1>
                  <p className="text-xs text-cyan-300/80 uppercase tracking-wider font-semibold">Level up your health</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="transition-all text-cyan-400 hover:text-cyan-300 hover:scale-110 p-1 hover:bg-cyan-500/10 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex justify-center w-full mt-2 transition-all text-cyan-400 hover:text-cyan-300 hover:scale-110 p-1 hover:bg-cyan-500/10 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items - Enhanced */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-600/40 text-white shadow-neon-cyan border-2 border-cyan-400/60 scale-105'
                      : 'text-slate-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 border-2 border-transparent hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20'
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className={`shrink-0 w-5 h-5 ${isActive ? 'animate-glow-pulse' : 'group-hover:scale-125 transition-transform'}`} />
                  {!collapsed && <span className="font-semibold tracking-wide text-sm">{item.label}</span>}
                  {/* Active indicator - Enhanced */}
                  {isActive && !collapsed && (
                    <div className="absolute right-3 w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full animate-pulse shadow-neon-cyan"></div>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* User Info & Logout - Enhanced */}
        <div className="p-4 border-t-2 border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          {!collapsed && (
            <div className="px-3 mb-3 p-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-400/50 shadow-neon-cyan">
              <p className="text-sm font-bold gradient-text truncate tracking-wide">{user?.username || 'Hero'}</p>
              <p className="text-xs text-cyan-300/80 uppercase tracking-wider font-semibold">Level {user?.level || 1}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 bg-gradient-to-r from-red-500/30 to-pink-500/20 hover:from-red-500/50 hover:to-pink-500/40 border-2 border-red-400/40 hover:border-red-400/70 rounded-xl transition-all text-red-300 hover:text-red-200 hover:shadow-lg hover:shadow-red-500/20 group font-semibold`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut className="shrink-0 w-5 h-5 group-hover:scale-125 transition-transform" />
            {!collapsed && <span className="tracking-wide text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header with Menu Button - Enhanced */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b-2 md:hidden glass-card border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cyan-400/30 to-blue-500/20 rounded-lg">
              <Sword className="w-8 h-8 text-cyan-300 animate-glow-pulse" style={{ filter: 'drop-shadow(0 0 15px #06B6D4)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text tracking-wide">HealthQuest</h1>
              <p className="text-xs text-cyan-300/80 uppercase tracking-wider font-semibold">Level up your health</p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-cyan-300 hover:text-cyan-200 transition-all p-2 hover:bg-cyan-500/20 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown - Enhanced */}
        {mobileMenuOpen && (
          <div className="py-4 px-4 border-t-2 border-cyan-400/40 max-h-[calc(100vh-4rem)] overflow-y-auto backdrop-blur-xl bg-gradient-to-b from-slate-900/80 to-slate-950/80">
            {/* User Info */}
            <div className="px-3 py-3 mb-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-400/50 shadow-neon-cyan">
              <p className="text-sm font-bold gradient-text tracking-wide">{user?.username || 'Hero'}</p>
              <p className="text-xs text-cyan-300/80 uppercase tracking-wider font-semibold">Level {user?.level || 1}</p>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-white shadow-neon-cyan border-2 border-cyan-400/60 scale-105'
                        : 'text-slate-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 border-2 border-transparent hover:border-cyan-400/40'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-glow-pulse' : ''}`} />
                    <span className="tracking-wide text-sm">{item.label}</span>
                  </button>
                )
              })}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 space-x-3 rounded-xl bg-gradient-to-r from-red-500/30 to-pink-500/20 hover:from-red-500/50 hover:to-pink-500/40 border-2 border-red-400/40 hover:border-red-400/70 transition-all text-red-300 hover:text-red-200 font-semibold"
              >
                <LogOut className="w-5 h-5" />
                <span className="tracking-wide text-sm">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Navbar