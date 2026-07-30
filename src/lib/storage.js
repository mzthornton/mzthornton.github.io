/**
 * Browser-storage helpers.
 *
 * There is no server, so this is where "the database" lives:
 *
 *   sessionStorage  mfp.session   who is logged in *right now* (per browser tab,
 *                                 cleared when the tab closes)
 *   localStorage    mfp.accounts  registered accounts, so a signup survives a
 *                                 tab close
 *   localStorage    mfp.plans     each user's saved artists / map pins per festival
 *
 * The session deliberately lives in sessionStorage: closing the tab logs you
 * out, but the account you created is still there to log back into.
 */

export const SESSION_KEY = 'mfp.session'
export const ACCOUNTS_KEY = 'mfp.accounts'
export const PLANS_KEY = 'mfp.plans'

/** JSON.parse a storage value, falling back if it is missing or corrupt. */
function read(storage, key, fallback) {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    // Storage can throw in private-browsing modes, and a half-written value
    // would throw on parse. Either way, behave like a first-time visitor.
    return fallback
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or a blocked storage API. Nothing useful to do in a demo app; the
    // in-memory React state stays correct for this session either way.
  }
}

export const loadSession = () => read(sessionStorage, SESSION_KEY, null)
export const saveSession = (session) => write(sessionStorage, SESSION_KEY, session)
export const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export const loadAccounts = () => read(localStorage, ACCOUNTS_KEY, {})
export const saveAccounts = (accounts) => write(localStorage, ACCOUNTS_KEY, accounts)

export const loadAllPlans = () => read(localStorage, PLANS_KEY, {})
export const saveAllPlans = (plans) => write(localStorage, PLANS_KEY, plans)

// ---------------------------------------------------------------------------
// Password handling
// ---------------------------------------------------------------------------

const toHex = (buffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')

/** A random hex salt so two users with the same password get different digests. */
export function makeSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

/**
 * Salted SHA-256 digest of a password.
 *
 * We never keep the password itself — only this digest goes into localStorage.
 * To be clear about what this is: a client-side digest is *not* real
 * authentication. Anyone with devtools can edit localStorage. It is here so the
 * demo does not model the genuinely bad habit of storing raw passwords, not
 * because it secures anything. Real auth needs a server.
 */
export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)

  if (crypto.subtle) {
    return toHex(await crypto.subtle.digest('SHA-256', data))
  }

  // crypto.subtle is only exposed in secure contexts (https / localhost). On a
  // plain-http LAN dev server, fall back to a simple non-cryptographic digest
  // so signup still works.
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (const byte of data) {
    h1 = Math.imul(h1 ^ byte, 2654435761) >>> 0
    h2 = Math.imul(h2 ^ byte, 1597334677) >>> 0
  }
  return `fallback-${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`
}
