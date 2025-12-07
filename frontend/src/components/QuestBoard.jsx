import { CheckCircle, Circle, Target, Sparkles, Dumbbell, Apple, Droplet, Zap, Brain, Footprints } from 'lucide-react'

const iconMap = {
  Dumbbell,
  Apple,
  Droplet,
  Brain,
  Footprints
}

function QuestBoard({ quests, onQuestComplete }) {
  if (!quests || quests.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-7 h-7 text-cyan-400 animate-glow-pulse" />
          <h2 className="text-2xl font-bold gradient-text tracking-wide uppercase">Quest Board</h2>
        </div>
        <div className="text-center text-slate-400 py-8">Loading quests...</div>
      </div>
    )
  }

  const completedCount = quests.filter(q => q.completed).length

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent group-hover:opacity-40 transition-opacity duration-500"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-lg border border-cyan-400/50">
            <Target className="w-7 h-7 text-cyan-300 animate-glow-pulse" />
          </div>
          <h2 className="text-2xl font-bold gradient-text tracking-wide uppercase">Quest Board</h2>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 px-4 py-2 rounded-full border border-cyan-400/60 shadow-neon-cyan">
          <Sparkles className="w-4 h-4 text-cyan-300 animate-glow-pulse" />
          <span className="text-sm text-cyan-300 font-bold">
            {completedCount} / {quests.length} Complete
          </span>
        </div>
      </div>

      {/* Mission Cards */}
      <div className="space-y-4 relative z-10">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`
              group relative p-5 rounded-2xl border-2 transition-all duration-300
              ${quest.completed 
                ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-green-500/40 opacity-70' 
                : 'bg-gradient-to-r from-slate-800/70 to-slate-700/50 border-cyan-500/40 hover:border-cyan-400 hover:scale-[1.02] hover:shadow-neon-cyan cursor-pointer'
              }
            `}
          >
            {/* Hover glow effect - Enhanced */}
            {!quest.completed && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>
              </>
            )}

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-start space-x-4 flex-1">
                {/* Icon Box - Enhanced */}
                <div className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                  quest.completed 
                    ? 'bg-slate-700/50 border-slate-600/50 grayscale opacity-50' 
                    : 'bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border-cyan-400/60 group-hover:shadow-neon-cyan'
                }`}>
                  {(() => {
                    const IconComponent = iconMap[quest.icon]
                    return IconComponent ? (
                      <IconComponent className={`w-8 h-8 transition-all ${quest.completed ? 'text-slate-500' : 'text-cyan-300 group-hover:animate-glow-pulse'}`} />
                    ) : (
                      <Circle className={`w-8 h-8 ${quest.completed ? 'text-slate-500' : 'text-cyan-300'}`} />
                    )
                  })()}
                </div>
                
                {/* Quest Info */}
                <div className="flex-1 space-y-2">
                  <h3 className={`text-lg font-bold tracking-wide transition-all ${
                    quest.completed 
                      ? 'text-slate-500 line-through' 
                      : 'text-white group-hover:text-cyan-300'
                  }`}>
                    {quest.name}
                  </h3>
                  <p className={`text-sm leading-relaxed transition-all ${
                    quest.completed 
                      ? 'text-slate-600' 
                      : 'text-slate-300 group-hover:text-slate-200'
                  }`}>
                    {quest.description}
                  </p>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${
                    quest.completed
                      ? 'bg-slate-700/30 border-slate-600/30'
                      : 'bg-gradient-to-r from-yellow-500/30 to-orange-500/20 border-yellow-400/50 group-hover:from-yellow-500/50 group-hover:to-orange-500/40'
                  }`}>
                    <Zap className={`w-4 h-4 transition-all ${quest.completed ? 'text-slate-500' : 'text-yellow-300 animate-glow-pulse'}`} />
                    <span className={`font-bold text-sm ${quest.completed ? 'text-slate-500' : 'text-yellow-300'}`}>
                      {quest.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="ml-4 flex-shrink-0">
                {quest.completed ? (
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/20 border-2 border-green-400/60 shadow-neon-cyan animate-scale-bounce">
                    <CheckCircle className="w-8 h-8 text-green-300" />
                  </div>
                ) : (
                  <button
                    onClick={() => onQuestComplete(quest.id)}
                    className="group/btn relative px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-neon-cyan hover:shadow-neon-purple transform hover:scale-110 active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer opacity-0 group-hover/btn:opacity-100"></div>
                    <span className="relative z-10 uppercase tracking-wide text-sm flex items-center space-x-2">
                      <Circle className="w-4 h-4" />
                      <span>Complete</span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuestBoard
