import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const MOCK_SESSION_KEY = 'dormhub.mockSession'
const MOCK_USERS_KEY = 'dormhub.mockUsers'

const MOCK_USERS = {
  'admin@dormhub.com': {
    user:    { id: 'mock-admin', email: 'admin@dormhub.com' },
    profile: { id: 'mock-admin', full_name: 'Admin User', role: 'admin' },
    password: 'admin123'
  },
  'maria@email.com': {
    user:    { id: 'mock-student-1', email: 'maria@email.com' },
    profile: { id: 'mock-student-1', full_name: 'Maria Santos', role: 'student', room: '101', tenant_id: 1 },
    password: 'student123'
  },
  'juan@email.com': {
    user:    { id: 'mock-student-2', email: 'juan@email.com' },
    profile: { id: 'mock-student-2', full_name: 'Juan dela Cruz', role: 'student', room: '103', tenant_id: 2 },
    password: 'student123'
  },
  'staff@dormhub.com': {
    user:    { id: 'mock-staff', email: 'staff@dormhub.com' },
    profile: { id: 'mock-staff', full_name: 'Pedro Staff', role: 'staff' },
    password: 'staff123'
  },
}

const normalizeEmail = email => email.trim().toLowerCase()

function getStoredMockUsers() {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '{}')
    const customUsers = Object.fromEntries(
      Object.entries(storedUsers).filter(([email]) => !MOCK_USERS[email])
    )

    return { ...MOCK_USERS, ...customUsers }
  } catch {
    return MOCK_USERS
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

function saveMockSession(session) {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
}

function clearMockSession() {
  localStorage.removeItem(MOCK_SESSION_KEY)
}

async function getSupabaseProfile(authUser) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (error && !['42P01', 'PGRST205'].includes(error.code)) throw error

  const profile = data || {
    id: authUser.id,
    full_name: authUser.user_metadata?.full_name || authUser.email,
    role: authUser.user_metadata?.role || 'student',
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, rooms(room_number)')
    .eq('user_id', authUser.id)
    .maybeSingle()

  if (tenantError && !['42P01', 'PGRST205'].includes(tenantError.code)) throw tenantError

  return {
    ...profile,
    tenant_id: tenant?.id,
    room: tenant?.rooms?.room_number,
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const savedMockSession = JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || 'null')
        if (active && savedMockSession?.user && savedMockSession?.profile) {
          setUser(savedMockSession.user)
          setProfile(savedMockSession.profile)
          setLoading(false)
          return
        }
      } catch {
        clearMockSession()
      }

      if (!isSupabaseConfigured) {
        try {
          const saved = JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || 'null')
          if (active && saved?.user && saved?.profile) {
            setUser(saved.user)
            setProfile(saved.profile)
          }
        } catch {
          clearMockSession()
        } finally {
          if (active) setLoading(false)
        }
        return
      }

      const { data } = await supabase.auth.getSession()
      const authUser = data.session?.user

      if (authUser && active) {
        try {
          setUser(authUser)
          setProfile(await getSupabaseProfile(authUser))
        } catch (err) {
          setError(err.message)
        }
      }

      if (active) setLoading(false)
    }

    loadSession()

    if (!isSupabaseConfigured) {
      return () => { active = false }
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return

      if (!session?.user) {
        setUser(null)
        setProfile(null)
        return
      }

      try {
        setUser(session.user)
        setProfile(await getSupabaseProfile(session.user))
      } catch (err) {
        setError(err.message)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const normalizedEmail = normalizeEmail(email)
    const demoUser = getStoredMockUsers()[normalizedEmail]

    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user)
      setProfile(demoUser.profile)
      saveMockSession({ user: demoUser.user, profile: demoUser.profile })
      setError(null)
      return { data: demoUser.user, error: null }
    }

    if (isSupabaseConfigured) {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return { data: null, error: signInError }
      }

      const nextProfile = await getSupabaseProfile(data.user)
      setUser(data.user)
      setProfile(nextProfile)
      setError(null)
      return { data: data.user, error: null }
    }

    if (!demoUser || demoUser.password !== password) {
      const err = { message: 'Invalid email or password.' }
      setError(err.message)
      return { data: null, error: err }
    }
  }

  async function signUp(email, password, fullName, role = 'student') {
    const normalizedEmail = normalizeEmail(email)
    const trimmedName = fullName.trim()

    if (isSupabaseConfigured) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            role,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return { data: null, error: signUpError }
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: normalizedEmail,
          full_name: trimmedName,
          role,
        })

        if (profileError && !['42P01', 'PGRST205'].includes(profileError.code)) {
          throw profileError
        }
      }

      setError(null)
      return { data, error: null }
    }

    const users = getStoredMockUsers()

    if (users[normalizedEmail]) {
      const err = { message: 'An account with this email already exists.' }
      setError(err.message)
      return { data: null, error: err }
    }

    const id = `mock-${Date.now()}`
    const newUser = {
      user: { id, email: normalizedEmail },
      profile: { id, full_name: trimmedName, role },
      password,
    }

    users[normalizedEmail] = newUser
    saveMockUsers(users)
    setError(null)
    return { data: newUser.user, error: null }
  }

  async function signOut() {
    clearMockSession()

    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }

    setUser(null)
    setProfile(null)
  }

  async function resetPassword(email) {
    const normalizedEmail = normalizeEmail(email)

    if (isSupabaseConfigured) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: window.location.origin,
      })

      if (resetError) {
        setError(resetError.message)
        return { error: resetError }
      }

      setError(null)
      return { error: null }
    }

    if (!getStoredMockUsers()[normalizedEmail]) {
      const err = { message: 'No demo account found for this email.' }
      setError(err.message)
      return { error: err }
    }

    setError(null)
    return { error: null }
  }

  const value = useMemo(
    () => ({ user, profile, loading, error, signIn, signUp, signOut, resetPassword }),
    [user, profile, loading, error]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
