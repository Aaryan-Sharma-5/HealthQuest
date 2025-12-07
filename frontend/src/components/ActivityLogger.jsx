import { useState, useEffect } from 'react'
import { Mic, MicOff, Send, Droplet, Footprints, Moon, Apple, Brain, Frown, Meh, Smile, FileText, Lightbulb, Zap, MapPin, Flame } from 'lucide-react'
import axiosInstance from '../api/axios'
import { API_BASE } from '../config'


const ACTIVITY_TYPES = [
  { id: 'steps', label: 'Steps', icon: Footprints, color: 'green', unit: 'steps' },
  { id: 'meditation', label: 'Meditation', icon: Brain, color: 'purple', unit: 'minutes' },
  { id: 'water', label: 'Water', icon: Droplet, color: 'blue', unit: 'glasses' },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: 'indigo', unit: 'hours' },
  { id: 'healthy_meal', label: 'Healthy Meals', icon: Apple, color: 'orange', unit: 'meals' }
]

export default function ActivityLogger({ onActivityLogged }) {
  const [activities, setActivities] = useState({
    steps: '',
    meditation: '',
    water: '',
    sleep: '',
    healthy_meal: ''
  })
  const [mood, setMood] = useState(3)
  const [reflection, setReflection] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [distanceData, setDistanceData] = useState(null)

  // Calculate distance whenever steps change
  useEffect(() => {
    const calculateDistance = async () => {
      const stepsValue = parseInt(activities.steps)
      
      if (stepsValue && stepsValue > 0) {
        try {
          const response = await axiosInstance.post(`${API_BASE}/activity/calculate-distance`, {
            steps: stepsValue,
            gender: null // Can be enhanced to use user's gender
          })
          
          setDistanceData(response.data)
        } catch (error) {
          console.error('Failed to calculate distance:', error)
          setDistanceData(null)
        }
      } else {
        setDistanceData(null)
      }
    }

    const debounceTimer = setTimeout(calculateDistance, 500)
    return () => clearTimeout(debounceTimer)
  }, [activities.steps])

  const handleActivityChange = (activityId, value) => {
    setActivities(prev => ({
      ...prev,
      [activityId]: value
    }))
  }

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in your browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setReflection(prev => prev + ' ' + transcript)
      setIsRecording(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
      alert('Voice recording failed. Please try again.')
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      // Convert string values to numbers
      const activitiesData = {}
      Object.keys(activities).forEach(key => {
        const value = parseFloat(activities[key])
        if (!isNaN(value) && value > 0) {
          activitiesData[key] = value
        }
      })

      const response = await axiosInstance.post(
        `${API_BASE}/activity/log`,
        {
          reflection: reflection || 'Daily check-in',
          category: 'daily_activity',
          mood,
          activities: activitiesData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        },
      )

      if (response.data.success) {
        alert(`Activity logged! You earned ${response.data.xpEarned} XP!`)
        
        // Reset form
        setActivities({
          steps: '',
          meditation: '',
          water: '',
          sleep: '',
          healthy_meal: ''
        })
        setReflection('')
        setMood(3)
        setDistanceData(null)
        
        // Notify parent component
        if (onActivityLogged) {
          onActivityLogged(response.data)
        }
      }
    } catch (error) {
      console.error('Failed to log activity:', error)
      alert('Failed to log activity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const moodLabels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Excellent']

  return (
    <div className="glass-card p-6 border-2 border-cyan-500/30">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-7 h-7 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white tracking-wide uppercase">Daily Activity Log</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity Inputs */}
        <div className="space-y-4">
          <h3 className="mb-4 text-lg font-semibold text-slate-300">Track Your Activities</h3>
          
          {ACTIVITY_TYPES.map(activity => {
            const Icon = activity.icon
            const colorMap = {
              green: { bg: 'bg-green-500/20', icon: 'text-green-400', border: 'border-green-500/30' },
              purple: { bg: 'bg-purple-500/20', icon: 'text-purple-400', border: 'border-purple-500/30' },
              blue: { bg: 'bg-blue-500/20', icon: 'text-blue-400', border: 'border-blue-500/30' },
              indigo: { bg: 'bg-indigo-500/20', icon: 'text-indigo-400', border: 'border-indigo-500/30' },
              orange: { bg: 'bg-orange-500/20', icon: 'text-orange-400', border: 'border-orange-500/30' }
            }
            const colors = colorMap[activity.color] || colorMap.blue
            
            return (
              <div key={activity.id}>
                <div className={`flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50`}>
                  <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border} shrink-0`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-300 min-w-[120px]">
                      {activity.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={activity.id === 'sleep' ? '0.5' : '1'}
                      value={activities[activity.id]}
                      onChange={(e) => handleActivityChange(activity.id, e.target.value)}
                      className="flex-1 px-4 py-2 text-white border-2 rounded-xl bg-slate-900/60 border-slate-700 focus:outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20 transition-all"
                      placeholder="0"
                    />
                    <span className="text-sm text-slate-400 font-medium min-w-[70px] text-right">
                      {activity.unit}
                    </span>
                  </div>
                </div>
                
                {/* Distance Display for Steps */}
                {activity.id === 'steps' && distanceData && distanceData.steps > 0 && (
                  <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-3 flex-1">
                        {/* Distance KM */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                            <MapPin className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Distance</p>
                            <div className="flex gap-4">
                              <div>
                                <p className="text-lg font-bold text-green-300">{distanceData.distance_km} <span className="text-sm">km</span></p>
                              </div>
                              <div className="border-l border-green-500/30 pl-4">
                                <p className="text-lg font-bold text-green-300">{distanceData.distance_miles} <span className="text-sm">mi</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Calories */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                            <Flame className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Calories Burned</p>
                            <p className="text-lg font-bold text-orange-300">{distanceData.calories_burned} <span className="text-sm">kcal</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fun Facts */}
                    <div className="mt-3 pt-3 border-t border-green-500/20">
                      <p className="text-xs text-green-300 font-semibold">
                        💡 {distanceData.distance_km >= 1 ? `That's equivalent to a ${Math.round(distanceData.distance_km)}km journey!` : `You're ${Math.round(distanceData.distance_km * 1000)}m closer to your 1km goal!`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mood Selector */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-slate-300">How are you feeling?</h3>
          <div className="grid grid-cols-5 gap-2">
            {moodLabels.map((label, index) => {
              const MoodIcon = index <= 1 ? Frown : index === 2 ? Meh : Smile
              const iconColor = index === 0 ? 'text-red-400' : index === 1 ? 'text-orange-400' : index === 2 ? 'text-yellow-400' : index === 3 ? 'text-lime-400' : 'text-green-400'
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMood(index + 1)}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all ${
                    mood === index + 1
                      ? 'border-cyan-500 bg-cyan-500/20 scale-105 shadow-neon-cyan'
                      : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-cyan-500/30'
                  }`}
                >
                  <MoodIcon className={`w-7 h-7 mb-1 ${mood === index + 1 ? 'text-cyan-400' : iconColor}`} />
                  <div className={`text-xs ${mood === index + 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>{label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Reflection Input with Voice */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-slate-300">
            Daily Reflection
          </h3>
          <div className="relative">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full px-4 py-3 pr-12 text-white border rounded-lg resize-none bg-slate-700 border-slate-600 focus:outline-none focus:border-cyan-500"
              rows="4"
              placeholder="How was your day? What did you accomplish? What challenges did you face?"
            />
            
            <button
              type="button"
              onClick={startVoiceRecording}
              disabled={isRecording}
              className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                isRecording
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              title="Voice input"
            >
              {isRecording ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2 mt-2 text-sm text-cyan-400 animate-pulse">
              <Mic className="w-4 h-4" />
              Listening... Speak now
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
            loading
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-white shadow-neon-cyan'
          }`}
        >
          {loading ? (
            <>
              <Zap className="w-5 h-5 animate-spin" />
              <span>Logging Activity...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Log Activity & Earn XP</span>
            </>
          )}
        </button>
      </form>

      {/* Tips */}
      <div className="flex items-start gap-2 p-4 mt-6 border-2 rounded-xl bg-slate-800/50 border-cyan-500/30 text-slate-300">
        <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div><strong className="text-cyan-300">Pro Tip:</strong> Log your activities daily to maintain your streak and unlock bonus XP multipliers! Every step you take counts towards your daily distance goal!</div>
      </div>
    </div>
  )
}