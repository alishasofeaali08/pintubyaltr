import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchCurrentUser as apiFetchCurrentUser,
  signIn as authSignIn,
  signOut as authSignOut,
  updateProfile as authUpdateProfile,
} from '../lib/auth'
import { clearSession, getCachedUser, getToken } from '../lib/session'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getCachedUser() : null))
  const [initializing, setInitializing] = useState(true)

  // Check the saved token against MongoDB once on startup.
  useEffect(() => {
    let active = true
    apiFetchCurrentUser()
      .then((nextUser) => { if (active) setUser(nextUser) })
      .catch(() => {
        clearSession()
        if (active) setUser(null)
      })
      .finally(() => { if (active) setInitializing(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const sync = () => setUser(getCachedUser())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const refresh = useCallback(async () => {
    const nextUser = await apiFetchCurrentUser()
    setUser(nextUser)
    return nextUser
  }, [])

  const signIn = useCallback(async (identifier, password) => {
    const nextUser = await authSignIn(identifier, password)
    setUser(nextUser)
    return nextUser
  }, [])

  const signOut = useCallback(async () => {
    await authSignOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (profile) => {
    const nextUser = await authUpdateProfile(profile)
    setUser(nextUser)
    return nextUser
  }, [])

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'Admin',
      signIn,
      signOut,
      updateProfile,
      refresh,
    }),
    [user, initializing, signIn, signOut, updateProfile, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
