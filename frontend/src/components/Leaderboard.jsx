import { useState, useEffect } from 'react'
import { TrendingUp, Users, Award, Zap, Target, Trophy, Medal } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'http://localhost:5000/api'

function Leaderboard() {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState('global') // global or guild
  const [activeMetric, setActiveMetric] = useState('xp') // xp, streaks, quests
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guildName, setGuildName] = useState('')

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab, activeMetric])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const userId = authUser?.username || authUser?._id || 'hero_001'
      
      let url = ''
      let rankUrl = ''
      
      if (activeTab === 'global') {
        if (activeMetric === 'xp') {
          url = `${API_BASE}/leaderboards/global/xp`
        } else if (activeMetric === 'streaks') {
          url = `${API_BASE}/leaderboards/global/streaks`
        } else if (activeMetric === 'quests') {
          url = `${API_BASE}/leaderboards/global/quests`
        }
        rankUrl = `${API_BASE}/leaderboards/user-rank/${userId}`
      } else if (activeTab === 'guild') {
        if (activeMetric === 'xp') {
          url = `${API_BASE}/leaderboards/guild/${userId}/xp`
        } else if (activeMetric === 'streaks') {
          url = `${API_BASE}/leaderboards/guild/${userId}/streaks`
        } else if (activeMetric === 'quests') {
          url = `${API_BASE}/leaderboards/guild/${userId}/quests`
        }
        rankUrl = `${API_BASE}/leaderboards/guild/${userId}/user-rank`
      }

      const [leaderboardRes, rankRes] = await Promise.all([
        axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(rankUrl, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setLeaderboard(leaderboardRes.data.leaderboard || [])
      setGuildName(leaderboardRes.data.guild_name || '')
      setUserRank(rankRes.data.ranks)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  const renderMetricValue = (user, metric) => {
    if (metric === 'xp') {
      return `${user.totalXP || user.currentXP || 0} XP`
    } else if (metric === 'streaks') {
      return `${user.currentStreak || 0} days`
    } else if (metric === 'quests') {
      return `${user.questsCompleted || 0} quests`
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Trophy className="w-8 h-8 text-yellow-400 animate-glow-pulse" />
        <div>
          <h2 className="text-3xl font-bold text-white">Leaderboards</h2>
          <p className="text-slate-400">Compete and climb the rankings</p>
        </div>
      </div>

      {/* Your Rank Cards */}
      {userRank && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6 border-2 border-cyan-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400 uppercase font-semibold">Your XP Rank</span>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-4xl font-bold gradient-text">#{userRank.xp}</p>
            <p className="text-xs text-slate-500 mt-1">Global Position</p>
          </div>

          <div className="glass-card p-6 border-2 border-purple-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400 uppercase font-semibold">Your Streak Rank</span>
              <Medal className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-4xl font-bold gradient-text">#{userRank.streak}</p>
            <p className="text-xs text-slate-500 mt-1">Global Position</p>
          </div>

          <div className="glass-card p-6 border-2 border-green-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400 uppercase font-semibold">Your Quest Rank</span>
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold gradient-text">#{userRank.quests}</p>
            <p className="text-xs text-slate-500 mt-1">Global Position</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-slate-700">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-6 py-3 font-semibold uppercase tracking-wide transition-all border-b-2 ${
            activeTab === 'global'
              ? 'text-cyan-300 border-cyan-400 shadow-neon-cyan'
              : 'text-slate-400 border-transparent hover:text-cyan-300'
          }`}
        >
          <TrendingUp className="w-5 h-5 inline mr-2" />
          Global
        </button>
        <button
          onClick={() => setActiveTab('guild')}
          className={`px-6 py-3 font-semibold uppercase tracking-wide transition-all border-b-2 ${
            activeTab === 'guild'
              ? 'text-cyan-300 border-cyan-400 shadow-neon-cyan'
              : 'text-slate-400 border-transparent hover:text-cyan-300'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Guild {guildName && `(${guildName})`}
        </button>
      </div>

      {/* Metric Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setActiveMetric('xp')}
          className={`px-6 py-2 rounded-full font-semibold uppercase tracking-wide transition-all ${
            activeMetric === 'xp'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan border-2 border-cyan-400'
              : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-cyan-400'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          XP
        </button>
        <button
          onClick={() => setActiveMetric('streaks')}
          className={`px-6 py-2 rounded-full font-semibold uppercase tracking-wide transition-all ${
            activeMetric === 'streaks'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50 border-2 border-purple-400'
              : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-purple-400'
          }`}
        >
          <Medal className="w-4 h-4 inline mr-2" />
          Streaks
        </button>
        <button
          onClick={() => setActiveMetric('quests')}
          className={`px-6 py-2 rounded-full font-semibold uppercase tracking-wide transition-all ${
            activeMetric === 'quests'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 border-2 border-green-400'
              : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-green-400'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Quests
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card p-6 border-2 border-cyan-500/30 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading leaderboard...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">No leaderboard data available</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-400 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-400 uppercase">Player</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-400 uppercase">Level</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-400 uppercase">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-slate-900/30' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getRankIcon(user.rank)}</span>
                        <span className="font-bold text-lg text-cyan-300 min-w-[30px]">#{user.rank}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full text-sm font-bold">
                        Lvl {user.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold gradient-text">
                        {renderMetricValue(user, activeMetric)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
