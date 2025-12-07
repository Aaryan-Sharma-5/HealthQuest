import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE = 'http://localhost:5000/api/auth'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE}/verify`)
          setUser(response.data.user)
        } catch (error) {
          console.error('Token verification failed:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    verifyToken()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        username: email, 
        password
      })

      const { access_token, user } = response.data
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(user)

      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      return { success: false, error: message }
    }
  }

  const register = async (username, email, password, gender = 'M') => {
    try {
      const response = await axios.post(`${API_BASE}/register`, {
        username,
        email,
        password,
        gender
      })

      const { access_token, user } = response.data
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(user)

      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
