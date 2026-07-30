import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  clearSession,
  hashPassword,
  loadAccounts,
  loadSession,
  makeSalt,
  saveAccounts,
  saveSession,
} from '../lib/storage.js'

/**
 * Authentication state for the whole app.
 *
 * Accounts persist in localStorage; the *logged-in session* lives in
 * sessionStorage, so it survives refreshes and deep links within a tab but ends
 * when the tab closes.
 */
const AuthContext = createContext(null)

const normalizeEmail = (email) => email.trim().toLowerCase()

export function AuthProvider({ children }) {
  // Seed straight from sessionStorage so a refresh does not bounce the user
  // back to the landing page mid-session.
  const [user, setUser] = useState(() => loadSession())

  const signup = useCallback(async ({ name, email, password }) => {
    const key = normalizeEmail(email)
    const accounts = loadAccounts()

    if (accounts[key]) {
      return { ok: false, error: 'An account already exists for that email. Try logging in.' }
    }

    const salt = makeSalt()
    const passwordHash = await hashPassword(password, salt)
    accounts[key] = { name: name.trim(), email: key, salt, passwordHash }
    saveAccounts(accounts)

    const session = { name: accounts[key].name, email: key }
    saveSession(session)
    setUser(session)
    return { ok: true }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const key = normalizeEmail(email)
    const account = loadAccounts()[key]

    // Same message for "no such account" and "wrong password" — no point
    // telling a stranger which emails are registered.
    const failure = { ok: false, error: 'Email or password is incorrect.' }
    if (!account) return failure

    const attempt = await hashPassword(password, account.salt)
    if (attempt !== account.passwordHash) return failure

    const session = { name: account.name, email: key }
    saveSession(session)
    setUser(session)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoggedIn: Boolean(user), signup, login, logout }),
    [user, signup, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an <AuthProvider>')
  return context
}
