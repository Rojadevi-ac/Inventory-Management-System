import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const navigate = useNavigate()

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('ims_user') || 'null')
    } catch {
      return null
    }
  }

  const [user, setUser] = useState(getUser)

  const login = useCallback((token, userData) => {
    localStorage.setItem('ims_token', token)
    localStorage.setItem('ims_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ims_token')
    localStorage.removeItem('ims_user')
    setUser(null)
    navigate('/login')
  }, [navigate])

  const isAuthenticated = () => !!localStorage.getItem('ims_token')

  return { user, login, logout, isAuthenticated }
}
