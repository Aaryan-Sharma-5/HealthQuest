import { Skull, Flame, Swords, Trophy, AlertTriangle } from 'lucide-react'
import BossAvatar from '../assests/Boss_Avatar.jpg'

function BossBattle({ boss }) {
  if (!boss || !boss.currentHP || !boss.maxHP) {
    return (
      <div className="glass-card p-6 border-2 border-red-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/50">
            <Skull className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Boss Battle</h2>
        </div>
        <div className="text-center text-slate-400 py-8">Loading boss...</div>
      </div>
    )
  }

  const hpPercentage = (boss.currentHP / boss.maxHP) * 100
  const isLowHealth = hpPercentage < 30
  const isCritical = hpPercentage < 15

  return (
    <div className="glass-card p-6 border-2 border-red-500/30 shadow-neon-red relative overflow-hidden">
      {/* Danger pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'repeating-linear-gradient(45deg, #EF4444 0px, #EF4444 10px, transparent 10px, transparent 20px)',
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Header with Danger Theme */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/50">
              <Skull className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-400 tracking-wide uppercase">Boss Battle</h2>
          </div>
          {isCritical && (
            <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/50 animate-pulse">
              <Swords className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400 uppercase">Critical!</span>
            </div>
          )}
        </div>

        {/* Boss Visual - Epic Fire Demon Avatar */}
        <div className="mb-5 flex justify-center">
          <div className={`w-64 bg-gradient-to-b from-slate-900 to-slate-800/80 rounded-2xl flex items-center justify-center border-2 ${isCritical ? 'border-yellow-500/70 shadow-lg shadow-yellow-500/50 animate-pulse' : 'border-red-500/50 shadow-lg shadow-red-500/30'} relative overflow-hidden`} style={{ aspectRatio: '3/4' }}>
            {/* Animated fire background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-orange-500/20 to-red-500/0 animate-pulse"></div>
            
            {/* Fire demon avatar */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img 
                src={BossAvatar}
                alt="Fire Demon Boss" 
                className="h-full w-auto object-cover drop-shadow-2xl rounded-lg" 
                style={{ filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.8))' }}
              />
            </div>
          </div>
        </div>

        {/* Boss Info */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/40 rounded-xl p-4 relative overflow-hidden">
            {/* Animated fire effect background */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent animate-pulse"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-red-300 mb-2 tracking-wide uppercase drop-shadow-lg" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.6)' }}>
                {boss.name}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed italic">{boss.description}</p>
            </div>
          </div>

          {/* Boss HP Bar - Thick and Intimidating */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-red-400" />
                <span className="text-sm font-bold text-red-300 tracking-wide uppercase">Boss HP</span>
              </div>
              <span className="text-sm text-red-400 font-bold">
                {boss.currentHP.toLocaleString()} / {boss.maxHP.toLocaleString()}
              </span>
            </div>
            <div className="relative h-8 bg-slate-900/80 rounded-full overflow-hidden border-2 border-red-500/50 shadow-inner">
              <div
                style={{ width: `${hpPercentage}%` }}
                className={`h-full transition-all duration-500 relative ${
                  isCritical ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500' :
                  isLowHealth ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-red-600 via-red-500 to-red-400'
                }`}
              >
                {/* Percentage overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm font-bold drop-shadow-lg">{Math.round(hpPercentage)}%</span>
                </div>
                {/* Animated pulse shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Status Message with Danger Theme */}
          <div
            className={`flex items-center justify-center gap-2 text-sm text-center font-bold py-3 px-4 rounded-xl uppercase tracking-wide transition-all ${
              boss.currentHP === 0 
                ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50 shadow-lg shadow-green-500/20' 
                : isCritical
                  ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20 animate-pulse' 
                  : isLowHealth 
                    ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20' 
                    : 'bg-red-500/20 text-red-400 border-2 border-red-500/50 shadow-neon-red'
            }`}
          >
            {boss.currentHP === 0 ? (
              <><Trophy className="w-5 h-5" /> Boss Defeated! Victory Achieved!</>
            ) : isCritical ? (
              <><AlertTriangle className="w-5 h-5" /> Critical HP! One More Push!</>
            ) : isLowHealth ? (
              <><Flame className="w-5 h-5" /> Boss is Weakening!</>
            ) : (
              <><Skull className="w-5 h-5" /> Boss is at Full Strength!</>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BossBattle
