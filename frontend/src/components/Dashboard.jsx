import { useState, useEffect } from 'react'
import { Sword } from 'lucide-react'
import axios from 'axios'
import Navbar from './Navbar'
import HUD from './HUD'
import QuestBoard from './QuestBoard'
import BossBattle from './BossBattle'
import AIPreview from './AIPreview'
import Profile from './Profile'
import Analytics from './Analytics'
import Settings from './Settings'
import GuildHub from './GuildHub';
import AbilityTree from './AbilityTree';
import ActivityLogger from './ActivityLogger';
import AIRecommendations from './AIRecommendations';
import Calendar from './Calendar';
import Leaderboard from './Leaderboard';
import { API_BASE } from '../config'


function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [quests, setQuests] = useState([])
  const [boss, setBoss] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchGameData = async () => {
    try {
      const [userRes, questsRes, bossRes] = await Promise.all([
        axios.get(`${API_BASE}/user/hero_001`),
        axios.get(`${API_BASE}/quests`),
        axios.get(`${API_BASE}/boss`)
      ])
      
      setUser(userRes.data)
      setQuests(questsRes.data.quests || [])
      setBoss(bossRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch game data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentPage === 'dashboard' && !user) {
      fetchGameData()
    }
  }, [currentPage, user])

  const handleQuestComplete = async (questId) => {
    try {
      // Complete the quest (this now automatically adds XP and handles level up)
      const questResponse = await axios.post(`${API_BASE}/quests/${questId}/complete`)
      
      if (questResponse.data.success) {
        const xpGained = questResponse.data.xpGained
        
        // Deal damage to boss (10% of XP gained)
        const bossDamage = Math.floor(xpGained * 0.1)
        await axios.post(`${API_BASE}/boss/damage`, {
          damage: bossDamage
        })
        
        // Refresh all data
        await fetchGameData()
        
        // Show level up notification
        if (questResponse.data.leveledUp) {
          setTimeout(() => {
            alert(`LEVEL UP! You are now Level ${questResponse.data.newLevel}!`)
          }, 500)
        }
      }
    } catch (error) {
      console.error('Failed to complete quest:', error)
      alert('Failed to complete quest. Please try again.')
    }
  }

  if (loading && currentPage === 'dashboard' && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-cyan-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/30 animate-pulse" style={{ animationDuration: '3s' }}></div>
            </div>
            <div className="relative flex items-center justify-center">
              <Sword className="w-16 h-16 text-cyan-400 animate-spin" style={{ filter: 'drop-shadow(0 0 20px #06B6D4)', animationDuration: '2s' }} />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse">
            Loading your adventure...
          </p>
          <p className="mt-2 text-sm text-slate-400 uppercase tracking-wider">Initializing Quest System</p>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile />
      case 'analytics':
        return <Analytics />
      case 'leaderboards':
        return <Leaderboard />
      case 'settings':
        return <Settings />
      case 'guild':
        return <GuildHub />
      case 'abilities':
        return (
          <div className="max-w-6xl mx-auto">
            <AbilityTree 
              userLevel={user?.level || 1}
              unlockedAbilities={user?.abilities || []}
            />
          </div>
        )
      case 'log-activity':
        return (
          <div className="max-w-2xl mx-auto">
            <ActivityLogger onActivityLogged={() => fetchGameData()} />
          </div>
        )
      case 'ai-coach':
        return <AIRecommendations />
      case 'calendar':
        return <Calendar user={user} />
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* HUD */}
            {user && <HUD user={user} />}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Quest Board */}
              <div className="lg:col-span-2">
                <QuestBoard 
                  quests={quests} 
                  onQuestComplete={handleQuestComplete}
                />
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Boss Battle */}
                {boss && <BossBattle boss={boss} />}
                
                {/* AI Coach Preview */}
                <AIPreview onNavigate={setCurrentPage} />
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {/* Main Content Area */}
      <div className="flex-1 pt-16 md:ml-64 md:pt-0">
        <div className="container px-4 py-8 mx-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

export default Dashboard