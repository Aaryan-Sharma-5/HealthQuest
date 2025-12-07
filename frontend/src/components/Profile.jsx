import { useState, useEffect } from 'react'
import { User, Award, Trophy, Calendar, Target, Zap, Dumbbell, Brain, Heart, FileText, Smile, Flame, Star, Crown, Gem, BookOpen } from 'lucide-react'
import axiosInstance from '../api/axios'
import HerAvatarF from '../assests/Her_Avatar_F.jpg'
import HimAvatarM from '../assests/Him_Avatar_M.jpg'
import { API_BASE } from '../config'


function Profile() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const [userRes, activityRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/user/hero_001`),
        axiosInstance.get(`${API_BASE}/activity/history?limit=30`)
      ])
      
      setUser(userRes.data)
      
      // Calculate stats from activity history
      const logs = activityRes.data.logs || []
      const stats = {
        totalReflections: logs.length,
        positiveDays: logs.filter(l => l.sentiment === 'positive').length,
        streakDays: calculateStreak(logs),
        avgMultiplier: logs.length > 0 
          ? (logs.reduce((sum, l) => sum + l.multiplier, 0) / logs.length).toFixed(2)
          : 1.0
      }
      setStats(stats)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setLoading(false)
    }
  }

  const calculateStreak = (logs) => {
    if (logs.length === 0) return 0
    
    let streak = 1
    const sortedLogs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    for (let i = 1; i < sortedLogs.length; i++) {
      const prevDate = new Date(sortedLogs[i - 1].timestamp).toDateString()
      const currDate = new Date(sortedLogs[i].timestamp).toDateString()
      
      if (prevDate !== currDate) {
        const dayDiff = Math.floor(
          (new Date(prevDate) - new Date(currDate)) / (1000 * 60 * 60 * 24)
        )
        
        if (dayDiff === 1) {
          streak++
        } else {
          break
        }
      }
    }
    
    return streak
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Failed to load profile</div>
      </div>
    )
  }

  const xpPercentage = (user.currentXP / user.nextLevelXP) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/50 flex-shrink-0">
            <img 
              src={user.gender === 'male' ? HimAvatarM : HerAvatarF}
              alt={`${user.username}'s avatar`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-3xl font-bold text-white">{user.username}</h2>
              <span className="px-3 py-1 bg-cyan-500 text-slate-900 rounded-full text-sm font-bold">
                Level {user.level}
              </span>
            </div>
            
            {/* XP Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Experience Points</span>
                <span className="text-sm font-medium text-cyan-400">
                  {user.currentXP} / {user.nextLevelXP} XP
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  style={{ width: `${xpPercentage}%` }}
                  className="h-full bg-cyan-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{user.questsCompleted}</p>
                <p className="text-xs text-slate-400">Quests Done</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{user.currentStreak}</p>
                <p className="text-xs text-slate-400">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{user.longestStreak}</p>
                <p className="text-xs text-slate-400">Best Streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Character Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Dumbbell className="w-4 h-4 text-cyan-400" /> Strength
              </span>
              <span className="text-white font-bold">{user.stats?.strength || 10}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Brain className="w-4 h-4 text-purple-400" /> Wisdom
              </span>
              <span className="text-white font-bold">{user.stats?.wisdom || 10}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Heart className="w-4 h-4 text-pink-400" /> Vitality
              </span>
              <span className="text-white font-bold">{user.stats?.vitality || 10}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <span className="text-slate-400">Health</span>
              <span className="text-white font-bold">
                {user.health} / {user.maxHealth} HP
              </span>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Activity Stats</h3>
          </div>
          {stats && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-400">
                  <FileText className="w-4 h-4 text-cyan-400" /> Total Reflections
                </span>
                <span className="text-white font-bold">{stats.totalReflections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-400">
                  <Smile className="w-4 h-4 text-green-400" /> Positive Days
                </span>
                <span className="text-white font-bold">{stats.positiveDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-400">
                  <Flame className="w-4 h-4 text-orange-400" /> Current Streak
                </span>
                <span className="text-white font-bold">{stats.streakDays} days</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <span className="text-slate-400">Avg Multiplier</span>
                <span className="text-white font-bold">{stats.avgMultiplier}x</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Achievements</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'First Quest', icon: Target, color: 'text-cyan-400', unlocked: user.questsCompleted >= 1 },
            { name: 'Week Warrior', icon: Flame, color: 'text-orange-400', unlocked: user.longestStreak >= 7 },
            { name: 'Level 5', icon: Star, color: 'text-yellow-400', unlocked: user.level >= 5 },
            { name: 'Quest Master', icon: Crown, color: 'text-purple-400', unlocked: user.questsCompleted >= 50 },
            { name: 'Dedicated', icon: Gem, color: 'text-blue-400', unlocked: user.currentStreak >= 3 },
            { name: 'Healthy', icon: Heart, color: 'text-pink-400', unlocked: user.health === user.maxHealth },
            { name: 'Reflective', icon: BookOpen, color: 'text-indigo-400', unlocked: stats?.totalReflections >= 10 },
            { name: 'Optimist', icon: Smile, color: 'text-green-400', unlocked: stats?.positiveDays >= 5 },
          ].map((achievement, idx) => {
            const IconComponent = achievement.icon
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg text-center ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50'
                    : 'bg-slate-900 border border-slate-700 opacity-50 grayscale'
                }`}
              >
                <IconComponent className={`w-10 h-10 mx-auto mb-2 ${
                  achievement.unlocked ? achievement.color : 'text-slate-600'
                }`} />
                <div className="text-sm text-white font-medium">{achievement.name}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-bold text-white">Account Info</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Account ID:</span>
            <span className="text-white font-mono">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total XP Earned:</span>
            <span className="text-white">{user.currentXP + (user.level - 1) * 100} XP</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
