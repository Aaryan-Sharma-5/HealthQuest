import { User, Zap, Heart, Shield, Sword } from 'lucide-react'
import HerAvatarF from '../assests/Her_Avatar_F.jpg'
import HimAvatarM from '../assests/Him_Avatar_M.jpg'

function HUD({ user }) {
  if (!user) {
    return (
      <div className="glass-card p-6">
        <div className="text-center text-slate-400 py-8">Loading hero data...</div>
      </div>
    )
  }

  const xpPercentage = (user.currentXP / user.nextLevelXP) * 100
  const healthPercentage = (user.health / user.maxHealth) * 100

  return (
    <div className="glass-card p-8 relative overflow-hidden group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 group-hover:opacity-50 transition-opacity duration-500"></div>
      </div>

      {/* Subtle animated pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle, #06B6D4 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Hero Avatar & Info - Prominent Left Section */}
        <div className="lg:col-span-4">
          <div className="flex items-center space-x-6">
            {/* Large Glowing Avatar with Enhanced Effects */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-neon-cyan ring-4 ring-cyan-400/40 relative overflow-hidden border-4 border-cyan-400">
                <img 
                  src={user.gender === 'male' ? HimAvatarM : HerAvatarF}
                  alt={`${user.username}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Enhanced rotating rings */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-300/70 animate-spin" style={{ animationDuration: '12s' }}></div>
              <div className="absolute inset-[-12px] rounded-full border-2 border-cyan-400/30 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
            </div>
            
            {/* Hero Name & Level */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Sword className="w-5 h-5 text-cyan-400 animate-glow-pulse" />
                <h2 className="text-2xl font-bold gradient-text tracking-wide uppercase">{user.username}</h2>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 px-4 py-2 rounded-full border border-cyan-400/50 shadow-neon-cyan">
                <Shield className="w-5 h-5 text-cyan-300" />
                <p className="text-cyan-300 font-bold text-xl tracking-wider">LEVEL {user.level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* XP Bar - Middle Section */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-bold text-white tracking-wide uppercase">Experience</span>
            </div>
            <span className="text-sm text-cyan-400 font-bold">
              {user.currentXP} / {user.nextLevelXP} XP
            </span>
          </div>
          <div className="relative h-6 bg-slate-800/80 rounded-full overflow-hidden border border-cyan-500/30 shadow-inner">
            <div
              style={{ width: `${xpPercentage}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 shadow-neon-cyan"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">{Math.round(xpPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* Vitality/Health Bar - Right Section */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-bold text-white tracking-wide uppercase">Vitality</span>
            </div>
            <span className="text-sm text-pink-400 font-bold">
              {user.health} / {user.maxHealth} HP
            </span>
          </div>
          <div className="relative h-6 bg-slate-800/80 rounded-full overflow-hidden border border-pink-500/30 shadow-inner">
            <div
              style={{ width: `${healthPercentage}%` }}
              className="h-full bg-gradient-to-r from-pink-500 via-red-500 to-red-600 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">{Math.round(healthPercentage)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HUD
