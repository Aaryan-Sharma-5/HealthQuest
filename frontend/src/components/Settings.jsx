import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Info, Save } from 'lucide-react'
import axios from 'axios'
import { API_BASE } from '../config'


function Settings() {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('healthquest_settings')
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings)
      } catch {
        // fallback to defaults if parsing fails
      }
    }
    return {
      notifications: true,
      darkMode: true,
      autoSave: true,
      difficulty: 'normal',
      privacy: 'private',
    }
  })
  const [saved, setSaved] = useState(false)

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE}/user/hero_001`)
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }
  
  useEffect(() => {
    fetchUser()
  }, [])

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem('healthquest_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-3xl font-bold text-white">Settings</h2>
          <p className="text-slate-400">Customize your experience</p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="p-6 border rounded-lg bg-slate-800 border-slate-700">
        <div className="flex items-center mb-4 space-x-2">
          <User className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Account</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-slate-400">Username</label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full px-4 py-2 text-white border rounded-lg bg-slate-900 border-slate-700"
            />
            <p className="mt-1 text-xs text-slate-500">Username cannot be changed</p>
          </div>
          <div>
            <label className="block mb-2 text-sm text-slate-400">Hero Level</label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={`Level ${user?.level || 1}`}
                disabled
                className="flex-1 px-4 py-2 text-white border rounded-lg bg-slate-900 border-slate-700"
              />
              <span className="text-sm text-slate-400">
                {user?.currentXP || 0} / {user?.nextLevelXP || 100} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gameplay Settings */}
      <div className="p-6 border rounded-lg bg-slate-800 border-slate-700">
        <div className="flex items-center mb-4 space-x-2">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Gameplay</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Auto-Save Progress</p>
              <p className="text-sm text-slate-400">Automatically save game state</p>
            </div>
            <button
              onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.autoSave ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block mb-2 font-medium text-white">Difficulty Level</label>
            <select
              value={settings.difficulty}
              onChange={(e) => handleSettingChange('difficulty', e.target.value)}
              className="w-full px-4 py-2 text-white border rounded-lg bg-slate-900 border-slate-700"
            >
              <option value="easy">Easy - More forgiving XP requirements</option>
              <option value="normal">Normal - Balanced challenge</option>
              <option value="hard">Hard - Increased XP goals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="p-6 border rounded-lg bg-slate-800 border-slate-700">
        <div className="flex items-center mb-4 space-x-2">
          <Shield className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-bold text-white">Privacy</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-white">Profile Visibility</label>
            <select
              value={settings.privacy}
              onChange={(e) => handleSettingChange('privacy', e.target.value)}
              className="w-full px-4 py-2 text-white border rounded-lg bg-slate-900 border-slate-700"
            >
              <option value="public">Public - Everyone can see your profile</option>
              <option value="private">Private - Only you can see</option>
            </select>
          </div>

          <div className="p-4 border rounded-lg bg-slate-900 border-slate-700">
            <p className="mb-2 text-sm text-slate-300">
              ℹ️ Your health reflections are always private and never shared.
            </p>
            <p className="text-xs text-slate-400">
              We take your privacy seriously. Your personal data is encrypted and secure.
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="p-6 border rounded-lg bg-slate-800 border-slate-700">
        <div className="flex items-center mb-4 space-x-2">
          <Info className="w-5 h-5 text-slate-400" />
          <h3 className="text-xl font-bold text-white">About</h3>
        </div>

        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>HealthQuest</strong> - Gamified Health Motivation Platform</p>
          <p>Version: 1.0.0</p>
          <p>Built for Digital Healthcare Hackathon 2025</p>
          <p className="pt-2 text-xs text-slate-400">
            Transform your health journey into an epic adventure. Complete quests, earn XP, and level up your well-being.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center px-6 py-3 space-x-2 font-bold transition-colors rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900"
        >
          <Save className="w-5 h-5" />
          <span>{saved ? '✓ Settings Saved!' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  )
}

export default Settings
