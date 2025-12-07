// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const API_BASE = `${API_BASE_URL}/api`
export const API_AUTH = `${API_BASE_URL}/api/auth`

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'HealthQuest'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
