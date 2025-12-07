import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sword, Shield, Sparkles, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Auth({ type = 'login' }) {
  const { login, register } = useAuth()
  const [authMode, setAuthMode] = useState(type)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'M'
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (authMode === 'signup') {
      if (!formData.username.trim()) {
        newErrors.username = 'Hero name is required'
      } else if (formData.username.length < 3) {
        newErrors.username = 'Hero name must be at least 3 characters'
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (authMode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let result
      
      if (authMode === 'login') {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData.username, formData.email, formData.password, formData.gender)
      }

      if (result.success) {
        console.log('Authentication successful!', result.user)
      } else {
        setServerError(result.error)
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.')
      console.error('Auth error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login')
    setErrors({})
    setServerError('')
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'M'
    })
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-1/2 rounded-full -top-1/4 -left-1/4 h-1/2 bg-gradient-to-br from-cyber-cyan to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-1/2 rounded-full -bottom-1/4 -right-1/4 h-1/2 bg-gradient-to-tl from-magic-purple to-transparent blur-3xl"
        />
      </div>

      {/* Main Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          <div className="inline-block mb-4 text-7xl">
          </div>
          <h1 className="mb-2 text-5xl font-bold text-transparent bg-cyber-cyan bg-clip-text">
            HealthQuest
          </h1>
          <p className="flex items-center justify-center space-x-2 text-lg text-slate-400">
            <Sparkles className="w-5 h-5" />
            <span>Begin Your Epic Journey</span>
            <Sparkles className="w-5 h-5" />
          </p>
        </motion.div>

        {/* Auth Form Card */}
        <div className="p-8 glass-panel glow-cyan">
          {/* Tab Switcher */}
          <div className="flex p-1 mb-6 rounded-lg bg-slate-900">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                authMode === 'login'
                  ? 'bg-cyber-cyan text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                authMode === 'signup'
                  ? 'bg-magic-purple text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sword className="w-5 h-5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className="p-3 mb-4 text-sm text-red-400 border border-red-500 rounded-lg bg-red-500/20">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-300">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className={`w-full pl-11 pr-4 py-3 bg-slate-900 border ${
                        errors.username ? 'border-red-500' : 'border-slate-700'
                      } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all`}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Gender Selection */}
                <div>
                  <label className="block mb-3 text-sm font-semibold text-slate-300">
                    Choose Your Hero Class
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center px-4 py-3 cursor-pointer border-2 rounded-lg transition-all bg-slate-900 border-slate-700 hover:border-cyan-500">
                      <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={formData.gender === 'M'}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 font-semibold text-slate-300">⚔️ Male Warrior</span>
                    </label>
                    <label className="flex items-center px-4 py-3 cursor-pointer border-2 rounded-lg transition-all bg-slate-900 border-slate-700 hover:border-purple-500">
                      <input
                        type="radio"
                        name="gender"
                        value="F"
                        checked={formData.gender === 'F'}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 font-semibold text-slate-300">🗡️ Female Warrior</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hero@healthquest.com"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-900 border ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-11 pr-12 py-3 bg-slate-900 border ${
                    errors.password ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Signup Only) */}
            {authMode === 'signup' && (
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-900 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
                    } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 ${
                authMode === 'login' ? 'btn-primary' : 'btn-secondary'
              } font-bold text-lg shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{authMode === 'login' ? 'Entering...' : 'Creating Hero...'}</span>
                </>
              ) : (
                <span>{authMode === 'login' ? 'Enter the Realm' : 'Start Your Quest'}</span>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            {authMode === 'login' ? (
              <p className="text-slate-400">
                New Hero?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-semibold transition-colors text-cyber-cyan hover:text-cyan-400"
                >
                  Create an Account
                </button>
              </p>
            ) : (
              <p className="text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-semibold transition-colors text-magic-purple hover:text-purple-400"
                >
                  Login Here
                </button>
              </p>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm italic text-slate-500">
            "Every hero's journey begins with a single step..."
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Auth
