import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, ChevronRight, Target, Footprints, Trophy, Heart, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'

const API_BASE = 'http://localhost:5000/api'

function Calendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const fetchCalendarData = useCallback(async () => {
    if (!user) return
    
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const token = localStorage.getItem('token')
      
      const userId = user.username || user._id || 'hero_001'
      
      const response = await axios.get(`${API_BASE}/calendar/${userId}`, {
        params: { year, month },
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setCalendarData(response.data.calendar || {})
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch calendar data:', error)
      setLoading(false)
    }
  }, [currentDate, user])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const formatDateKey = (day) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${year}-${month}-${dayStr}`
  }

  const getDayData = (day) => {
    const dateKey = formatDateKey(day)
    return calendarData[dateKey] || null
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-gray-50 dark:bg-slate-900/30"></div>)
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = getDayData(day)
      const isToday = 
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear()
      
      const isSelected = selectedDate === formatDateKey(day)

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(formatDateKey(day))}
          className={`h-20 p-2 text-left transition-all rounded-lg cursor-pointer ${
            isToday 
              ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:ring-blue-400' 
              : isSelected
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : dayData
              ? 'bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              : 'bg-white dark:bg-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-700/30'
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <span className={`text-sm font-semibold ${
              isToday 
                ? 'text-blue-600 dark:text-blue-400' 
                : isSelected
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {day}
            </span>
            {dayData && dayData.quests_completed > 0 && (
              <div className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
                {dayData.quests_completed}
              </div>
            )}
          </div>
          
          {dayData && (
            <div className="space-y-0.5">
              {dayData.steps > 0 && (
                <div className="flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{dayData.steps}</span>
                </div>
              )}
              {dayData.xp_gained > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{dayData.xp_gained}</span>
                </div>
              )}
            </div>
          )}
        </button>
      )
    }

    return days
  }

  const renderSelectedDayDetails = () => {
    if (!selectedDate) return null

    const data = calendarData[selectedDate] || {
      quests_completed: 0,
      steps: 0,
      xp_gained: 0,
      activities_logged: 0,
      activities: []
    }
    
    const hasData = calendarData[selectedDate]
    
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="pb-4 mb-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasData ? 'Daily Summary' : 'No activity logged'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-center w-8 h-8 mb-2 bg-green-100 rounded-lg dark:bg-green-900/30">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.quests_completed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quests</p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-center w-8 h-8 mb-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
              <Footprints className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.steps.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Steps</p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-center w-8 h-8 mb-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.xp_gained}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">XP Gained</p>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-center w-8 h-8 mb-2 bg-red-100 rounded-lg dark:bg-red-900/30">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.activities_logged || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Activities</p>
          </div>
        </div>

        {data.activities && data.activities.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Activity Log</h4>
            <div className="space-y-2 overflow-y-auto max-h-48">
              {data.activities.map((activity, idx) => (
                <div key={idx} className="p-3 text-sm rounded-lg bg-gray-50 dark:bg-slate-900/50">
                  <p className="text-gray-700 dark:text-gray-300">{activity.reflection}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-200 rounded dark:text-gray-400 dark:bg-slate-800">
                      {activity.category}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      activity.sentiment === 'positive' 
                        ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                        : activity.sentiment === 'negative'
                        ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                        : 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
                    }`}>
                      {activity.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <div className="text-lg text-gray-400">Loading calendar...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Calendar</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your daily progress and achievements</p>
            </div>
          
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <button
                onClick={previousMonth}
                className="p-2 text-gray-600 transition-colors rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="flex-1 text-base font-semibold text-center text-gray-900 dark:text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              
              <button
                onClick={nextMonth}
                className="p-2 text-gray-600 transition-colors rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-3">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
              {/* Day headers */}
              <div className="grid grid-cols-7 p-4 bg-gray-50 dark:bg-slate-900/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-xs font-semibold text-center text-gray-600 uppercase dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 p-2">
                {renderCalendarDays()}
              </div>
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="lg:col-span-1">
            {selectedDate ? (
              renderSelectedDayDetails()
            ) : (
              <div className="flex items-center justify-center h-full p-8 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a day to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Summary - Professional Cards */}
        <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg dark:bg-green-900/30">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:text-green-400 dark:bg-green-900/30">
                Monthly
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Total Quests</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(calendarData).reduce((sum, day) => sum + (day.quests_completed || 0), 0)}
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                <Footprints className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full dark:text-blue-400 dark:bg-blue-900/30">
                Monthly
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Total Steps</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(calendarData).reduce((sum, day) => sum + (day.steps || 0), 0).toLocaleString()}
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full dark:text-purple-400 dark:bg-purple-900/30">
                Monthly
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Total XP</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(calendarData).reduce((sum, day) => sum + (day.xp_gained || 0), 0).toLocaleString()}
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg dark:bg-red-900/30">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:text-red-400 dark:bg-red-900/30">
                Monthly
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Activities</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(calendarData).reduce((sum, day) => sum + (day.activities_logged || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
