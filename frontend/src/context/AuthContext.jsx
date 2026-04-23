import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { authAPI } from '../api/client.js'

const AuthContext = createContext(null)

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (verifiedRef.current) return
    verifiedRef.current = true

    const token = localStorage.getItem('access_token')
    if (!token) return

    const silentVerify = async () => {
      try {
        const response = await authAPI.me()
        const freshUser = response.data
        const cachedUser = getStoredUser()

        // Only update state if something actually changed
        // This prevents unnecessary re-renders
        if (JSON.stringify(freshUser) !== JSON.stringify(cachedUser)) {
          setUser(freshUser)
          localStorage.setItem('user', JSON.stringify(freshUser))
        }
      } catch {
        try {
          const refreshResponse = await authAPI.refresh()
          const { access_token, user: userData } = refreshResponse.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
    }

    silentVerify()
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password })
    const { access_token, user: userData } = response.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (name, email, password) => {
    const response = await authAPI.register({ name, email, password })
    const { access_token, user: userData } = response.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // continue regardless
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setUser(null)
      verifiedRef.current = false
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}