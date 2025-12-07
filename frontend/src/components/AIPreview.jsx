import { Brain, Sparkles, ArrowRight, Zap } from 'lucide-react'

function AIPreview({ onNavigate }) {
  return (
    <div className="glass-card p-6 border-2 border-purple-500/30 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300" onClick={() => onNavigate?.('ai-coach')}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-transparent to-pink-500 animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border-2 border-purple-500/50">
              <Brain className="w-7 h-7 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 rounded-xl bg-purple-500/20 blur-xl"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wide uppercase">AI Coach</h2>
              <p className="text-xs text-purple-300/70 uppercase tracking-wider">Powered by Gemini AI</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-purple-400" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase">Mood Analysis</span>
            </div>
            <p className="text-xs text-slate-400">AI adapts difficulty based on your feelings</p>
          </div>
          
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 uppercase">Smart Plans</span>
            </div>
            <p className="text-xs text-slate-400">Personalized workouts & nutrition tips</p>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2 shadow-neon-purple">
          <Brain className="w-5 h-5" />
          Access AI Coach
        </button>
      </div>
    </div>
  )
}

export default AIPreview
