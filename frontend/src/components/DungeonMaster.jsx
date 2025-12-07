import { useState, useEffect } from 'react'
import { Sparkles, Send, Loader2, Wand2, TrendingUp, Heart, Smile, Frown, Meh, Lightbulb } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

function DungeonMaster() {
  const [reflection, setReflection] = useState('')
  const [coachingMessage, setCoachingMessage] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load initial coaching message on mount
    fetchInitialCoaching()
  }, [])

  const fetchInitialCoaching = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(`${API_BASE}/ai/coaching-message`, {
        sentiment: 'neutral'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCoachingMessage(res.data)
    } catch (error) {
      console.error('Failed to get initial coaching:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reflection.trim()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Get AI coaching based on reflection
      const coachingRes = await axios.post(`${API_BASE}/ai/coaching-message`, {
        reflection_text: reflection
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Get adaptive difficulty
      const difficultyRes = await axios.post(`${API_BASE}/ai/adapt-difficulty`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setCoachingMessage(coachingRes.data)
      setDifficulty(difficultyRes.data)
      setReflection('')
    } catch (error) {
      console.error('Failed to get DM response:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 border-2 border-purple-500/30 relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-transparent to-pink-500 animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center mb-4 space-x-3">
          <div className="relative p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border-2 border-purple-500/50">
            <Sparkles className="w-7 h-7 text-purple-400 animate-pulse" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-purple-500/20 blur-xl"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wide uppercase">AI Dungeon Master</h2>
            <p className="text-xs text-purple-300/70 uppercase tracking-wider">Powered by Advanced AI</p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <p className="text-sm text-slate-300 leading-relaxed">
            <Wand2 className="w-4 h-4 text-purple-400 inline mr-2" />
            Your personal AI coach analyzes your mood and automatically adjusts quest difficulty for optimal motivation
          </p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="How are you feeling today? (e.g., 'I feel great and motivated!')"
          className="w-full h-24 px-4 py-3 text-white border-2 rounded-xl resize-none bg-slate-900/60 border-purple-500/30 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all"
        />

        <button
          type="submit"
          disabled={loading || !reflection.trim()}
          className="flex items-center justify-center w-full px-6 py-3 space-x-2 font-bold text-white transition-all bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-neon-purple hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wide"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit</span>
            </>
          )}
        </button>
      </form>

      {/* AI Coaching Display */}
      {coachingMessage && (
        <div className="p-5 mt-5 border-2 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/40 shadow-xl shadow-purple-500/20 relative overflow-hidden animate-in">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-500/30">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Wand2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 tracking-wide uppercase">AI Analysis Complete</h3>
              <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            </div>

            <div className="space-y-4">
            {/* Sentiment Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Mood Detected:</span>
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                coachingMessage.sentiment === 'positive' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : coachingMessage.sentiment === 'negative' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {coachingMessage.sentiment === 'positive' ? (
                  <><Smile className="w-3.5 h-3.5" /> Positive</>
                ) : coachingMessage.sentiment === 'negative' ? (
                  <><Frown className="w-3.5 h-3.5" /> Struggling</>
                ) : (
                  <><Meh className="w-3.5 h-3.5" /> Neutral</>
                )}
              </span>
            </div>

            {/* Coaching Message */}
            <div className="p-4 border-l-4 rounded-xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-cyan-500 shadow-lg shadow-cyan-500/10">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-cyan-300 font-bold mb-2">AI Coaching Message</p>
                  <p className="text-base text-slate-100 leading-relaxed">{coachingMessage.message}</p>
                </div>
              </div>
            </div>

            {/* Difficulty Adjustment */}
            {difficulty && (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wide">Quest Difficulty</span>
                  </div>
                  <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                    difficulty.difficulty > 1.2 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                    difficulty.difficulty < 0.8 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {(difficulty.difficulty * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Visual difficulty gauge */}
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    style={{ width: `${difficulty.difficulty * 100}%` }}
                    className={`h-full transition-all duration-1000 ${
                      difficulty.difficulty > 1.2 ? 'bg-gradient-to-r from-red-600 to-red-400' : 
                      difficulty.difficulty < 0.8 ? 'bg-gradient-to-r from-green-600 to-green-400' : 
                      'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {difficulty?.feedback && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <p className="text-sm italic text-pink-200">{difficulty.feedback}</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

        {/* Help Text */}
        <div className="flex items-start gap-2 p-3 mt-4 border-2 rounded-xl bg-slate-800/50 border-purple-500/30 text-slate-300">
          <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div><strong className="text-purple-300">Pro Tip:</strong> Share your daily thoughts and the AI will personalize your quest difficulty and provide motivational coaching!</div>
        </div>
      </div>
    </div>
  )
}

export default DungeonMaster
