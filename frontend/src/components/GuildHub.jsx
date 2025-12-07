import { useState, useEffect } from 'react'
import axiosInstance from '../api/axios'
import { Users, Crown, Trophy, Target, Plus, LogOut, Sword, Castle, Lightbulb } from 'lucide-react'
import { API_BASE } from '../config'


export default function GuildHub() {
  const [view, setView] = useState('discover') // discover, myGuild, create
  const [guilds, setGuilds] = useState([])
  const [myGuild, setMyGuild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })

  const fetchGuilds = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axiosInstance.get(`${API_BASE}/guild/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGuilds(response.data.guilds || [])
    } catch (error) {
      console.error('Failed to fetch guilds:', error)
    }
  }

  const fetchMyGuild = async () => {
    try {
      const token = localStorage.getItem('token')
      const userResponse = await axiosInstance.get(`${API_BASE}/user/hero_001`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (userResponse.data.guild_id) {
        const guildResponse = await axiosInstance.get(
          `${API_BASE}/guild/${userResponse.data.guild_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setMyGuild(guildResponse.data)
        setView('myGuild')
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch my guild:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuilds()
    fetchMyGuild()
  }, [])

  const handleCreateGuild = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axiosInstance.post(
        `${API_BASE}/guild/create`,
        createForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        alert(`Guild "${createForm.name}" created successfully!`)
        setCreateForm({ name: '', description: '' })
        fetchMyGuild()
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create guild')
    }
  }

  const handleJoinGuild = async (guildId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axiosInstance.post(
        `${API_BASE}/guild/${guildId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        alert(response.data.message)
        fetchMyGuild()
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to join guild')
    }
  }

  const handleLeaveGuild = async () => {
    if (!confirm('Are you sure you want to leave your guild?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await axiosInstance.post(
        `${API_BASE}/guild/${myGuild._id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        alert(response.data.message)
        setMyGuild(null)
        setView('discover')
        fetchGuilds()
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to leave guild')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚔️</div>
          <p className="text-slate-400">Loading guilds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Castle className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Guild Hub</h1>
          </div>
          <p className="text-slate-400">Join forces with other heroes and conquer challenges together!</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('discover')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              view === 'discover'
                ? 'bg-cyan-500 text-black'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Users className="inline w-4 h-4 mr-2" />
            Discover Guilds
          </button>
          
          {myGuild && (
            <button
              onClick={() => setView('myGuild')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === 'myGuild'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Crown className="inline w-4 h-4 mr-2" />
              My Guild
            </button>
          )}
          
          {!myGuild && (
            <button
              onClick={() => setView('create')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === 'create'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Plus className="inline w-4 h-4 mr-2" />
              Create Guild
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          {/* Discover Guilds */}
          {view === 'discover' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Available Guilds</h2>
              
              {guilds.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No guilds available yet. Be the first to create one!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guilds.map(guild => (
                    <div
                      key={guild._id}
                      className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-cyan-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {guild.name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            Led by {guild.leader_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Level</div>
                          <div className="text-2xl font-bold text-cyan-400">
                            {guild.level}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-4">
                        {guild.description || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>{guild.members_count} members</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Trophy className="w-4 h-4" />
                            <span>{guild.total_xp.toLocaleString()} XP</span>
                          </div>
                        </div>
                        
                        {!myGuild && (
                          <button
                            onClick={() => handleJoinGuild(guild._id)}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded transition-colors"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Guild */}
          {view === 'myGuild' && myGuild && (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {myGuild.name}
                  </h2>
                  <p className="text-slate-400">{myGuild.description}</p>
                </div>
                <button
                  onClick={handleLeaveGuild}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500 rounded transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Guild
                </button>
              </div>

              {/* Guild Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-cyan-400">
                    {myGuild.level}
                  </div>
                  <div className="text-sm text-slate-400">Guild Level</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {myGuild.members.length}
                  </div>
                  <div className="text-sm text-slate-400">Members</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {myGuild.total_xp.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Total XP</div>
                </div>
              </div>

              {/* Current Challenge */}
              {myGuild.current_challenge && myGuild.current_challenge.active && (
                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-bold text-white">
                      Active Challenge: {myGuild.current_challenge.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    {myGuild.current_challenge.description}
                  </p>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-semibold">
                        {myGuild.current_challenge.progress} / {myGuild.current_challenge.goal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (myGuild.current_challenge.progress / myGuild.current_challenge.goal) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Reward: {myGuild.current_challenge.rewards?.xp} XP + {myGuild.current_challenge.rewards?.badge} Badge
                  </div>
                </div>
              )}

              {/* Members List */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Guild Members</h3>
                <div className="space-y-2">
                  {myGuild.members.map(member => (
                    <div
                      key={member.user_id}
                      className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">
                          ⚔️
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {member.username}
                            </span>
                            {member.role === 'leader' && (
                              <Crown className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            Level {member.level}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Create Guild */}
          {view === 'create' && !myGuild && (
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Create Your Guild
              </h2>
              
              <form onSubmit={handleCreateGuild} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Guild Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter guild name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
                    rows="4"
                    placeholder="Describe your guild's purpose and goals"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors"
                >
                  Create Guild
                </button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div><strong>Tip:</strong> As guild leader, you can start challenges and invite other heroes to join your quest!</div>
                </div>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
