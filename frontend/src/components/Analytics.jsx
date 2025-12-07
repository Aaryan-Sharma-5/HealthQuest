import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Heart, Brain, Activity, Award, Smile, Meh, Frown, TrendingDown, Zap, Target, Flame } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
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
        axios.get(`${API_BASE}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/activity/history?limit=30`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/calendar/${userId}/streak`, {
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
  
  const sentimentPieData = [
    { name: 'Positive', value: sentimentBreakdown.positive, fill: '#06b6d4' },
    { name: 'Neutral', value: sentimentBreakdown.neutral, fill: '#64748b' },
    { name: 'Negative', value: sentimentBreakdown.negative, fill: '#ef4444' }
  ].filter(item => item.value > 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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

      {/* 1. WEEKLY ACTIVITY CHART */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Weekly Activity Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="activities" 
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 5 }}
              activeDot={{ r: 7 }}
              name="Activities"
            />
            <Line 
              type="monotone" 
              dataKey="xp" 
              stroke="#a78bfa" 
              strokeWidth={2}
              dot={{ fill: '#a78bfa', r: 5 }}
              name="XP Earned"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. SENTIMENT TREND & PIE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Smile className="w-5 h-5 text-green-400" />
            Sentiment Trend (Weekly)
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="positive" fill="#06b6d4" name="Positive" />
              <Bar dataKey="neutral" fill="#64748b" name="Neutral" />
              <Bar dataKey="negative" fill="#ef4444" name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Mood Distribution (30 Days)
          </h3>
          {sentimentPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* 3. ACTIVITY HEATMAP */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-400" />
          Activity Intensity Heatmap (This Week)
        </h3>
        <div className="flex items-end gap-2 justify-between">
          {heatmapData.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-20 rounded-lg ${day.color} border border-slate-600 flex items-center justify-center transition hover:scale-110`}>
                <span className="text-white font-bold text-lg">{day.activities}</span>
              </div>
              <span className="text-xs text-slate-400">{day.date}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <span className="text-slate-400">Low</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-slate-700 rounded"></div>
            <div className="w-4 h-4 bg-cyan-900 rounded"></div>
            <div className="w-4 h-4 bg-cyan-600 rounded"></div>
            <div className="w-4 h-4 bg-cyan-400 rounded"></div>
          </div>
          <span className="text-slate-400">High</span>
        </div>
      </div>

      {/* 4. GOAL PROGRESS */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          Goal Progress Tracker
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goalProgress.map((goal, idx) => {
            const IconComponent = goal.icon
            const progress = Math.min((goal.current / goal.target) * 100, 100)
            const completed = goal.current >= goal.target
            
            return (
              <div key={idx} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-cyan-400" />
                    <span className="font-medium text-white">{goal.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${completed ? 'text-green-400' : 'text-cyan-400'}`}>
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className={`h-full transition-all ${completed ? 'bg-green-500' : 'bg-cyan-500'}`}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {completed ? '✨ Goal Achieved!' : `${Math.ceil(goal.target - goal.current)} to go`}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. AI INSIGHTS */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          AI-Powered Insights
        </h3>
        <div className="space-y-2">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-purple-500/30">
              <p className="text-sm text-slate-200">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. WEEKLY COMPARISON */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          {weekComparison.trend === 'up' ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          Weekly Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">This Week</p>
            <p className="text-3xl font-bold text-cyan-400">{weekComparison.thisWeek}</p>
            <p className="text-xs text-slate-500 mt-1">activities logged</p>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Last Week</p>
            <p className="text-3xl font-bold text-slate-300">{weekComparison.lastWeek}</p>
            <p className="text-xs text-slate-500 mt-1">activities logged</p>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Improvement</p>
            <p className={`text-3xl font-bold ${weekComparison.improvement === 'N/A' ? 'text-slate-300' : weekComparison.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weekComparison.improvement === 'N/A' ? '—' : `${weekComparison.improvement > 0 ? '+' : ''}${weekComparison.improvement}%`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {weekComparison.trend === 'up' ? '📈 Going strong!' : '📉 Keep pushing!'}
            </p>
          </div>
        </div>
      </div>

      {/* 7. RECENT ACTIVITY */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        </div>

        {activityLogs.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No activity logged yet. Start your journey!</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.slice(0, 10).map((log, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
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
                      <p className="text-sm font-medium text-white capitalize">{log.sentiment} Mood</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()} at{' '}
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded font-bold">
                    +{(log.multiplier * 10).toFixed(0)} XP
                  </span>
                </div>
                
                <p className="text-sm text-slate-300 mb-2 line-clamp-2">{log.reflection}</p>
                
                {log.coaching_message && (
                  <p className="text-xs text-slate-400 italic border-l-2 border-purple-500 pl-2 mt-2">
                    💡 {log.coaching_message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
