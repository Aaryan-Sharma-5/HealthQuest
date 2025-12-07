import { useEffect, useState } from 'react'
import FemaleWarrior from '../assests/Her_Avatar_F.jpg'
import MaleWarrior from '../assests/Him_Avatar_M.jpg'

function HeroAvatar({ user, gender = 'M' }) {
  // Use user.gender if available, otherwise use the gender prop
  const userGender = user?.gender || gender
  const avatarImage = userGender === 'F' ? FemaleWarrior : MaleWarrior

  if (!user) {
    return (
      <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-2 border-cyan-500/30">
        <div className="text-xs text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Circular Avatar Container */}
      <div className="w-32 h-32 bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/30 overflow-hidden relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 animate-pulse"></div>

        {/* Avatar image */}
        <img
          src={avatarImage}
          alt={`${user.username} Avatar`}
          className="w-full h-full object-cover drop-shadow-lg relative z-10"
          style={{ filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.5))' }}
        />
      </div>
      
    </div>
  )
}

export default HeroAvatar
