import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Heart, Brain, Activity, Award, Smile, Meh, Frown, TrendingDown, Zap, Target } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axiosInstance from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../config'


function Analytics() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState(null)
  const [activityLogs, setActivityLogs] = useState([])
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authUser) {
      fetchAnalytics()
    }
  }, [authUser])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = authUser?.username || authUser?._id || 'hero_001'
      
      const [userRes, activityRes, streakRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get(`${API_BASE}/activity/history?limit=30`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get(`${API_BASE}/calendar/${userId}/streak`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setUser(userRes.data)
      setActivityLogs(activityRes.data.logs || [])
      setStreak({
        current: streakRes.data.current_streak || 0,
        longest: userRes.data.longestStreak || 0
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading analytics...</div>
      </div>
    )
  }

  // Calculate analytics
  const last7Days = activityLogs.slice(0, 7)
  const last30Days = activityLogs

  const sentimentBreakdown = {
    positive: last30Days.filter(l => l.sentiment === 'positive').length,
    neutral: last30Days.filter(l => l.sentiment === 'neutral').length,
    negative: last30Days.filter(l => l.sentiment === 'negative').length,
  }

  const avgMultiplier = last30Days.length > 0
    ? (last30Days.reduce((sum, l) => sum + l.multiplier, 0) / last30Days.length).toFixed(2)
    : 1.0

  const weeklyActivity = last7Days.length

  // 1. Weekly Activity Chart Data
  const getWeeklyChartData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = new Date()
    const data = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay()]
      const dayLogs = last7Days.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate.toDateString() === date.toDateString()
      })
      
      data.push({
        day: dayName.slice(0, 3),
        fullDay: dayName,
        activities: dayLogs.length,
        avgMood: dayLogs.length > 0 
          ? dayLogs.filter(l => l.sentiment === 'positive').length / dayLogs.length 
          : 0,
        xp: dayLogs.reduce((sum, l) => sum + (l.multiplier || 1), 0)
      })
    }
    return data
  }

  // 2. Sentiment Trend Data
  const getSentimentTrendData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const data = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayLogs = last7Days.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate.toDateString() === date.toDateString()
      })
      
      data.push({
        day: days[date.getDay()],
        positive: dayLogs.filter(l => l.sentiment === 'positive').length,
        neutral: dayLogs.filter(l => l.sentiment === 'neutral').length,
        negative: dayLogs.filter(l => l.sentiment === 'negative').length
      })
    }
    return data
  }

  // 3. Activity Heatmap Data
  const getHeatmapData = () => {
    const today = new Date()
    const weekData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayLogs = last7Days.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate.toDateString() === date.toDateString()
      })
      
      const intensity = Math.min(dayLogs.length / 3, 1)
      weekData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activities: dayLogs.length,
        intensity,
        color: intensity === 0 ? 'bg-slate-700' : intensity < 0.33 ? 'bg-cyan-900' : intensity < 0.66 ? 'bg-cyan-600' : 'bg-cyan-400'
      })
    }
    return weekData
  }

  // 4. AI Insights
  const getAIInsights = () => {
    const insights = []

    if (last7Days.length >= 5) insights.push('🔥 You\'re consistent! 5+ activities this week.')
    if (sentimentBreakdown.positive >= sentimentBreakdown.negative * 2) insights.push('😊 Your mood is predominantly positive!')
    if (streak.current >= 5) insights.push('🎯 Amazing streak! You\'re in the zone.')
    if (avgMultiplier >= 1.5) insights.push('⭐ High multiplier achievement unlocked!')
    if (last7Days.length === 0) insights.push('📝 Start your first reflection to see insights!')
    if (insights.length === 0) insights.push('💪 Keep logging more activities for personalized insights!')

    return insights
  }

  // 5. Weekly Comparison
  const calculateWeekComparison = () => {
    const currentWeekCount = last7Days.length
    const twoWeeksAgo = activityLogs.slice(7, 14).length
    const improvement = twoWeeksAgo === 0 ? 'N/A' : (((currentWeekCount - twoWeeksAgo) / twoWeeksAgo) * 100).toFixed(0)
    
    return {
      thisWeek: currentWeekCount,
      lastWeek: twoWeeksAgo,
      improvement: improvement,
      trend: currentWeekCount >= twoWeeksAgo ? 'up' : 'down'
    }
  }

  // 6. Goal Progress
  const getGoalProgress = () => {
    const goals = [
      {
        name: 'Weekly Reflections',
        target: 7,
        current: weeklyActivity,
        icon: Activity
      },
      {
        name: 'Positive Mood Days',
        target: 5,
        current: sentimentBreakdown.positive,
        icon: Smile
      },
      {
        name: 'Consistency Streak',
        target: 10,
        current: streak.current,
        icon: Flame
      },
      {
        name: 'Quest Completion',
        target: Math.ceil(user?.questsCompleted / 10) * 10 + 5 || 5,
        current: user?.questsCompleted || 0,
        icon: Award
      }
    ]
    return goals
  }

  const weeklyChartData = getWeeklyChartData()
  const sentimentTrendData = getSentimentTrendData()
  const heatmapData = getHeatmapData()
  const aiInsights = getAIInsights()
  const weekComparison = calculateWeekComparison()
  const goalProgress = getGoalProgress()
  const Flame = Heart

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <TrendingUp className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-slate-400">Track your health journey progress</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-400 text-sm">Weekly Activity</span>
          </div>
          <p className="text-3xl font-bold text-white">{weeklyActivity}</p>
          <p className="text-xs text-slate-500 mt-1">reflections this week</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400 text-sm">Total Quests</span>
          </div>
          <p className="text-3xl font-bold text-white">{user?.questsCompleted || 0}</p>
          <p className="text-xs text-slate-500 mt-1">quests completed</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-slate-400 text-sm">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-white">{streak.current}</p>
          <p className="text-xs text-slate-500 mt-1">consecutive days</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400 text-sm">Avg Multiplier</span>
          </div>
          <p className="text-3xl font-bold text-white">{avgMultiplier}x</p>
          <p className="text-xs text-slate-500 mt-1">reward multiplier</p>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">Mood Distribution (Last 30 Days)</h3>
        
        <div className="space-y-4">
          {/* Positive */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 flex items-center space-x-2">
                <Smile className="w-5 h-5 text-green-400" />
                <span>Positive</span>
              </span>
              <span className="text-sm font-medium text-cyan-400">
                {sentimentBreakdown.positive} days ({((sentimentBreakdown.positive / last30Days.length) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${(sentimentBreakdown.positive / last30Days.length) * 100}%` }}
                className="h-full bg-cyan-500"
              />
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 flex items-center space-x-2">
                <Meh className="w-5 h-5 text-yellow-400" />
                <span>Neutral</span>
              </span>
              <span className="text-sm font-medium text-slate-400">
                {sentimentBreakdown.neutral} days ({((sentimentBreakdown.neutral / last30Days.length) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${(sentimentBreakdown.neutral / last30Days.length) * 100}%` }}
                className="h-full bg-slate-500"
              />
            </div>
          </div>

          {/* Negative */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 flex items-center space-x-2">
                <Frown className="w-5 h-5 text-red-400" />
                <span>Negative</span>
              </span>
              <span className="text-sm font-medium text-red-400">
                {sentimentBreakdown.negative} days ({((sentimentBreakdown.negative / last30Days.length) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${(sentimentBreakdown.negative / last30Days.length) * 100}%` }}
                className="h-full bg-red-500"
              />
            </div>
          </div>
        </div>

        {sentimentBreakdown.positive >= sentimentBreakdown.negative && (
          <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-sm text-cyan-400">
              ✨ Great job! You're maintaining a positive mindset. Keep up the good work!
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        </div>

        {activityLogs.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No activity logged yet. Start your journey!</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.slice(0, 15).map((log, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900 border border-slate-700 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      {log.sentiment === 'positive' ? (
                        <Smile className="w-5 h-5 text-green-400" />
                      ) : log.sentiment === 'negative' ? (
                        <Frown className="w-5 h-5 text-red-400" />
                      ) : (
                        <Meh className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{log.sentiment}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()} at{' '}
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                    {log.multiplier}x
                  </span>
                </div>
                
                <p className="text-sm text-slate-300 mb-2 line-clamp-2">{log.reflection}</p>
                
                {log.coaching_message && (
                  <p className="text-xs text-slate-400 italic border-l-2 border-purple-500 pl-2">
                    {log.coaching_message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Insights */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Progress Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Best Streak</p>
            <p className="text-2xl font-bold text-white">{Math.max(streak.current, streak.longest)} days</p>
            <p className="text-xs text-slate-500 mt-1">Keep the momentum going!</p>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Total XP Earned</p>
            <p className="text-2xl font-bold text-white">
              {user ? user.currentXP + (user.level - 1) * 100 : 0} XP
            </p>
            <p className="text-xs text-slate-500 mt-1">Across {user?.level || 1} levels</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Completion Rate</p>
            <p className="text-2xl font-bold text-white">
              {user?.questsCompleted ? ((user.questsCompleted / (user.level * 5)) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Quest success ratio</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Health Status</p>
            <p className="text-2xl font-bold text-white">
              {user ? ((user.health / user.maxHealth) * 100).toFixed(0) : 100}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {user?.health} / {user?.maxHealth} HP
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
