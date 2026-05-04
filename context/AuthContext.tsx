import React, { createContext, useContext, useEffect, useState } from 'react'
import { clearSession, getMe, getSession, saveSession } from '../lib/api'

interface User {
  id: string
  username: string
  display_name: string
  profile_picture_url: string | null
  is_verified: boolean
  role: string
}

interface Session {
  accessToken: string
  userSub: string
  user?: User
}

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (session: Session) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSession()
  }, [])

  async function loadSession() {
    try {
      const s = await getSession()
      if (s?.accessToken) {
        setSession(s)
        // Try to get user profile — but don't block if it fails
        try {
          const res = await getMe()
          if (res?.user) setUser(res.user)
        } catch {
          // Token might be expired — clear it
          await clearSession()
          setSession(null)
        }
      }
    } catch {
      // SecureStore failure — just proceed as logged out
    } finally {
      // Always finish loading regardless of what happened
      setLoading(false)
    }
  }

  async function signIn(s: Session) {
    await saveSession(s)
    setSession(s)
    try {
      const res = await getMe()
      if (res?.user) setUser(res.user)
    } catch {}
  }

  async function signOut() {
    await clearSession()
    setSession(null)
    setUser(null)
  }

  async function refreshUser() {
    try {
      const res = await getMe()
      if (res?.user) setUser(res.user)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
