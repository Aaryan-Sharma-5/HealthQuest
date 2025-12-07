import { useState, useEffect } from 'react'
import { Zap, Shield, Heart, Brain, Wind, Flame, Sparkles, Lock } from 'lucide-react'

const ABILITIES = [
  // Tier 1 - Level 5
  {
    id: 'iron_will',
    name: 'Iron Will',
    icon: Shield,
    tier: 1,
    unlockLevel: 5,
    description: '+10% XP from meditation activities',
    stat: 'wisdom',
    color: 'blue'
  },
  {
    id: 'vitality_boost',
    name: 'Vitality Boost',
    icon: Heart,
    tier: 1,
    unlockLevel: 5,
    description: '+15 Max Health',
    stat: 'vitality',
    color: 'red'
  },
  {
    id: 'swift_steps',
    name: 'Swift Steps',
    icon: Wind,
    tier: 1,
    unlockLevel: 5,
    description: '+10% XP from movement activities',
    stat: 'strength',
    color: 'green'
  },
  
  // Tier 2 - Level 10
  {
    id: 'mental_fortress',
    name: 'Mental Fortress',
    icon: Brain,
    tier: 2,
    unlockLevel: 10,
    requires: ['iron_will'],
    description: 'Double XP when maintaining 3+ day streak',
    stat: 'wisdom',
    color: 'purple'
  },
  {
    id: 'warriors_endurance',
    name: "Warrior's Endurance",
    icon: Flame,
    tier: 2,
    unlockLevel: 10,
    requires: ['swift_steps', 'vitality_boost'],
    description: '+20% XP from all physical activities',
    stat: 'strength',
    color: 'orange'
  },
  
  // Tier 3 - Level 15
  {
    id: 'zen_master',
    name: 'Zen Master',
    icon: Sparkles,
    tier: 3,
    unlockLevel: 15,
    requires: ['mental_fortress'],
    description: 'Meditation activities restore 10 HP',
    stat: 'wisdom',
    color: 'cyan'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    icon: Zap,
    tier: 3,
    unlockLevel: 15,
    requires: ['warriors_endurance'],
    description: 'Complete 3 quests in one day for bonus 100 XP',
    stat: 'strength',
    color: 'yellow'
  }
]

export default function AbilityTree({ userLevel = 1, unlockedAbilities = [] }) {
  const [selectedAbility, setSelectedAbility] = useState(null)
  const [hoveredAbility, setHoveredAbility] = useState(null)

  const isUnlocked = (ability) => {
    return unlockedAbilities.includes(ability.id)
  }

  const canUnlock = (ability) => {
    // Check level requirement
    if (userLevel < ability.unlockLevel) return false
    
    // Check if already unlocked
    if (isUnlocked(ability)) return false
    
    // Check prerequisites
    if (ability.requires) {
      return ability.requires.every(req => unlockedAbilities.includes(req))
    }
    
    return true
  }

  const getAbilityStatus = (ability) => {
    if (isUnlocked(ability)) return 'unlocked'
    if (canUnlock(ability)) return 'available'
    return 'locked'
  }

  const getColorClasses = (color, status) => {
    const colors = {
      blue: {
        unlocked: 'bg-blue-500/20 border-blue-500 text-blue-300',
        available: 'bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20',
        locked: 'bg-slate-800 border-slate-700 text-slate-600'
      },
      red: {
        unlocked: 'bg-red-500/20 border-red-500 text-red-300',
        available: 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20',
        locked: 'bg-slate-800 border-slate-700 text-slate-600'
      },
      green: {
        unlocked: 'bg-green-500/20 border-green-500 text-green-300',
        available: 'bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20',
        locked: 'bg-slate-800 border-slate-700 text-slate-600'
      },
      purple: {
        unlocked: 'bg-purple-500/20 border-purple-500 text-purple-300',
        available: 'bg-purple-500/10 border-purple-500/50 text-purple-400 hover:bg-purple-500/20',
        locked: 'bg-slate-800 border-slate-700 text-slate-600'
      },
      orange: {
        unlocked: 'bg-orange-500/20 border-orange-500 text-orange-300',
        available: 'bg-orange-500/10 border-orange-500/50 text-orange-400 hover:bg-orange-500/20',
        locked: 'bg-slate-800 border-slate-700 text-slate-600'
      },
      cyan: {
        unlocked: 'bg-cyan-500/20 border-cyan-500 text-cyan-300',
        available: 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20',
        locked: 'bg-slate-800 border-slate-700 text-slate-600'
      },
      yellow: {
        unlocked: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
        available: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20',
        locked: 'bg-slate-800 border-slate-700 text-slate-600'
      }
    }
    
    return colors[color]?.[status] || colors.blue[status]
  }

  const groupedByTier = ABILITIES.reduce((acc, ability) => {
    if (!acc[ability.tier]) acc[ability.tier] = []
    acc[ability.tier].push(ability)
    return acc
  }, {})

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-white">Ability Tree</h2>
        <p className="text-slate-400">Unlock powerful abilities as you level up</p>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-500 rounded bg-green-500/20"></div>
            <span className="text-slate-300">Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 rounded border-cyan-500 bg-cyan-500/10"></div>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 rounded border-slate-700 bg-slate-800"></div>
            <span className="text-slate-300">Locked</span>
          </div>
        </div>
      </div>

      {/* Ability Tree Grid */}
      <div className="space-y-8">
        {Object.keys(groupedByTier).sort().map(tier => (
          <div key={tier}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-slate-300">
                Tier {tier}
              </h3>
              <span className="text-xs text-slate-500">
                (Level {ABILITIES.find(a => a.tier === parseInt(tier))?.unlockLevel}+)
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {groupedByTier[tier].map(ability => {
                const status = getAbilityStatus(ability)
                const Icon = ability.icon
                
                return (
                  <div
                    key={ability.id}
                    className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${getColorClasses(ability.color, status)}`}
                    onClick={() => setSelectedAbility(ability)}
                    onMouseEnter={() => setHoveredAbility(ability.id)}
                    onMouseLeave={() => setHoveredAbility(null)}
                  >
                    {/* Lock Icon for locked abilities */}
                    {status === 'locked' && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                    
                    {/* Unlocked Badge */}
                    {status === 'unlocked' && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                          <span className="text-xs">✓</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${
                        status === 'locked' 
                          ? 'bg-slate-700/50' 
                          : `bg-${ability.color}-500/20`
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="mb-1 font-bold">{ability.name}</h4>
                        <p className="mb-2 text-xs opacity-80">
                          {ability.description}
                        </p>
                        
                        {/* Requirements */}
                        {ability.requires && status === 'locked' && (
                          <div className="mt-2 text-xs opacity-60">
                            <span className="font-semibold">Requires:</span>
                            <div className="mt-1">
                              {ability.requires.map(reqId => {
                                const reqAbility = ABILITIES.find(a => a.id === reqId)
                                return (
                                  <div key={reqId} className="flex items-center gap-1">
                                    <span>•</span>
                                    <span>{reqAbility?.name}</span>
                                    {unlockedAbilities.includes(reqId) && (
                                      <span className="text-green-500">✓</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        
                        {status === 'locked' && !ability.requires && (
                          <div className="mt-2 text-xs opacity-60">
                            Unlock at level {ability.unlockLevel}
                          </div>
                        )}
                        
                        {status === 'available' && (
                          <button className="px-3 py-1 mt-2 text-xs font-bold text-black transition-colors rounded bg-cyan-500 hover:bg-cyan-400">
                            Unlock Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Ability Detail Modal */}
      {selectedAbility && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setSelectedAbility(null)}
        >
          <div 
            className="w-full max-w-md p-6 border-2 rounded-lg bg-slate-800 border-cyan-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-4 rounded-lg bg-${selectedAbility.color}-500/20`}>
                <selectedAbility.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-xl font-bold text-white">
                  {selectedAbility.name}
                </h3>
                <p className="text-sm text-slate-400">
                  Tier {selectedAbility.tier} • {selectedAbility.stat}
                </p>
              </div>
            </div>
            
            <p className="mb-4 text-slate-300">
              {selectedAbility.description}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Unlock Level:</span>
                <span className="font-semibold text-white">
                  {selectedAbility.unlockLevel}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`font-semibold ${
                  getAbilityStatus(selectedAbility) === 'unlocked' 
                    ? 'text-green-400' 
                    : getAbilityStatus(selectedAbility) === 'available'
                    ? 'text-cyan-400'
                    : 'text-slate-500'
                }`}>
                  {getAbilityStatus(selectedAbility).toUpperCase()}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedAbility(null)}
              className="w-full py-2 mt-6 text-white transition-colors rounded bg-slate-700 hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
