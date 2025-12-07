import React from 'react'
import { Award, Flame, Star, Zap } from 'lucide-react'

function Badge({ badge }) {
  const Icon = badge.icon || Award
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${badge.earned ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-900 border border-slate-700'}`}>
      <div className={`p-2 rounded-md ${badge.earned ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
        <Icon className={`w-6 h-6 ${badge.earned ? 'text-amber-400' : 'text-slate-400'}`} />
      </div>
      <div>
        <div className={`text-sm font-semibold ${badge.earned ? 'text-amber-300' : 'text-slate-200'}`}>{badge.title}</div>
        <div className="text-xs text-slate-400">{badge.description}</div>
      </div>
      <div className="ml-auto">
        {badge.earned ? (
          <span className="text-xs text-amber-300 px-2 py-1 rounded bg-amber-900/10">Earned</span>
        ) : (
          <span className="text-xs text-slate-500 px-2 py-1 rounded bg-transparent">Locked</span>
        )}
      </div>
    </div>
  )
}

export default Badge
