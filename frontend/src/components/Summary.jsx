import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axios'
import Badge from './Badge'
import { Trophy, Flame, Star, Activity as ActIcon, Smile } from 'lucide-react'
import { API_BASE } from '../config'


function computeStreak(logs = []) {
  if (!logs || logs.length === 0) return { current: 0, longest: 0 }
  const daysSet = new Set(logs.map(l => new Date(l.timestamp).toDateString()))
  const days = Array.from(daysSet).map(d => new Date(d)).sort((a, b) => a - b)

  let longest = 0
  let temp = 1
  for (let i = 1; i < days.length; i++) {
    const diff = (days[i] - days[i - 1]) / (1000 * 60 * 60 * 24)
    if (diff === 1) temp += 1
    else {
      if (temp > longest) longest = temp
      temp = 1
    }
  }
  if (temp > longest) longest = temp

  // current streak: count backwards from the latest day
  let current = 0
  const today = new Date(days[days.length - 1])
  for (let i = days.length - 1; i >= 0; i--) {
    const diff = Math.round((today - days[i]) / (1000 * 60 * 60 * 24))
    if (diff === 0 || diff === current) {
      current += 1
      today.setDate(today.getDate() - 1)
    } else break
  }

  return { current, longest }
}

function Summary() {
  const [activityLogs, setActivityLogs] = useState([])
  const [user, setUser] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, activityRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/user/hero_001`),
        axiosInstance.get(`${API_BASE}/activity/history?limit=30`)
      ])
      const logs = activityRes.data.logs || []
      setUser(userRes.data)
      setActivityLogs(logs)

      const streaks = computeStreak(logs)
      const computedBadges = evaluateBadges(streaks, logs)

      const stored = JSON.parse(localStorage.getItem('earnedBadges') || '[]')
      const newlyEarned = computedBadges.filter(b => b.earned && !stored.includes(b.id))
      if (newlyEarned.length > 0) {
        const newList = Array.from(new Set([...stored, ...newlyEarned.map(b => b.id)]))
        localStorage.setItem('earnedBadges', JSON.stringify(newList))
      }

      setBadges(computedBadges.map(b => ({ ...b, earned: stored.includes(b.id) || b.earned })))
      setLoading(false)
    } catch (err) {
      console.error('Failed fetching summary data', err)
      setLoading(false)
    }
  }

  const evaluateBadges = (streaks, logs) => {
    const positiveCount = logs.filter(l => l.sentiment === 'positive').length

    const definitions = [
      { id: 'streak-3', title: '3-Day Streak', description: 'Log 3 days in a row', threshold: 3, icon: Trophy },
      { id: 'streak-7', title: '7-Day Streak', description: 'One week streak', threshold: 7, icon: Flame },
      { id: 'streak-14', title: '14-Day Streak', description: 'Two week streak', threshold: 14, icon: Star },
      { id: 'positive-10', title: 'Positive 10', description: '10 positive reflections', threshold: 10, icon: Smile },
      { id: 'consistent-5', title: 'Consistent 5', description: 'Log 5 activities in last 7 days', threshold: 5, icon: ActIcon }
    ]

    return definitions.map(d => {
      let earned = false
      if (d.id.startsWith('streak')) {
        earned = streaks.current >= d.threshold || streaks.longest >= d.threshold
      } else if (d.id === 'positive-10') {
        earned = positiveCount >= d.threshold
      } else if (d.id === 'consistent-5') {
        const last7 = logs.slice(0, 7)
        earned = last7.length >= d.threshold
      }
      return { ...d, earned }
    })
  }

  if (loading) return <div className="text-slate-400">Loading summary...</div>

  const streaks = computeStreak(activityLogs)
  const avgMultiplier = activityLogs.length > 0 ? (activityLogs.reduce((s, a) => s + (a.multiplier || 1), 0) / activityLogs.length).toFixed(2) : '1.00'
  const positiveCount = activityLogs.filter(l => l.sentiment === 'positive').length
  const positivePct = activityLogs.length ? Math.round((positiveCount / activityLogs.length) * 100) : 0

  const topBadges = badges.slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Summary</h2>
          <p className="text-sm text-slate-400">Overview of recent activity and earned achievements</p>
        </div>
        <div className="flex items-center gap-3">
          {topBadges.map(b => (
            <div key={b.id} className={`w-12 h-12 rounded-md flex items-center justify-center ${b.earned ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800 border border-slate-700'}`}>
              <b.icon className={`w-5 h-5 ${b.earned ? 'text-amber-400' : 'text-slate-400'}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900/60 to-slate-900 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Last 30 Days</div>
              <div className="text-5xl font-bold text-white mt-2">{activityLogs.length}</div>
              <div className="text-sm text-slate-400">reflections</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm text-slate-400">Positive</div>
              <div className="text-2xl font-bold text-white">{positivePct}%</div>
              <div className="text-sm text-slate-500">{positiveCount} positive</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
              <div className="text-sm text-slate-400">Current Streak</div>
              <div className="text-xl font-bold text-white">{streaks.current}d</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
              <div className="text-sm text-slate-400">Best Streak</div>
              <div className="text-xl font-bold text-white">{streaks.longest}d</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
              <div className="text-sm text-slate-400">Avg Multiplier</div>
              <div className="text-xl font-bold text-white">{avgMultiplier}x</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">Achievements</h3>
          <div className="space-y-3">
            {badges.map(b => (
              <Badge key={b.id} badge={b} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3">Recent Reflections</h3>
        {activityLogs.length === 0 ? (
          <div className="text-slate-400">No activity yet.</div>
        ) : (
          <div className="space-y-3">
            {activityLogs.slice(0, 8).map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-900 rounded border border-slate-700 flex items-start gap-4">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${log.sentiment === 'positive' ? 'bg-green-800' : log.sentiment === 'negative' ? 'bg-red-800' : 'bg-yellow-800'}`}>
                  {log.sentiment === 'positive' ? <Smile className="w-5 h-5 text-green-300" /> : log.sentiment === 'negative' ? <Flame className="w-5 h-5 text-red-300" /> : <ActIcon className="w-5 h-5 text-yellow-300" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-200 capitalize">{log.sentiment || 'neutral'}</div>
                    <div className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-slate-300 mt-2 line-clamp-2">{log.reflection}</div>
                </div>
                <div className="text-xs text-slate-400">{log.multiplier}x</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Summary
