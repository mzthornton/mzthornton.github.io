import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadAllPlans, saveAllPlans } from '../lib/storage.js'
import { useAuth } from './AuthContext.jsx'

/**
 * The logged-in user's festival plans.
 *
 * Shape stored under localStorage["mfp.plans"]:
 *
 *   { "ada@example.com": {
 *       "solstice-sound": {
 *         artists: ["Atlas Wilder|1|21:00", ...],   // setKey() values
 *         pois:    ["meadow-main", ...],            // ids from festival.pois
 *         pins:    [{ id, label, x, y }],           // pins the user dropped
 *         notes:   "free text"
 *       } } }
 *
 * Plans are keyed by email rather than kept in sessionStorage so they survive
 * logging out and back in — a plan you built last week should still be there.
 */
const PlanContext = createContext(null)

const EMPTY_PLAN = { artists: [], pois: [], pins: [], notes: '' }

/** Fill in any missing keys so callers never have to null-check a plan. */
const normalizePlan = (plan) => ({ ...EMPTY_PLAN, ...(plan || {}) })

const toggleIn = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

export function PlanProvider({ children }) {
  const { user } = useAuth()
  const email = user?.email ?? null

  // Only this user's slice of the plans object lives in React state.
  const [plans, setPlans] = useState(() => (email ? loadAllPlans()[email] ?? {} : {}))

  // Swap in the right slice whenever the signed-in user changes (login/logout).
  useEffect(() => {
    setPlans(email ? loadAllPlans()[email] ?? {} : {})
  }, [email])

  /**
   * Apply `updater` to one festival's plan, then write the whole plans object
   * back to localStorage.
   *
   * We re-read localStorage inside the updater rather than trusting a captured
   * copy, so a second tab's plans are never clobbered.
   */
  const updatePlan = useCallback(
    (festivalId, updater) => {
      if (!email) return
      setPlans((prev) => {
        const next = {
          ...prev,
          [festivalId]: normalizePlan(updater(normalizePlan(prev[festivalId]))),
        }
        const all = loadAllPlans()
        saveAllPlans({ ...all, [email]: next })
        return next
      })
    },
    [email],
  )

  const getPlan = useCallback(
    (festivalId) => normalizePlan(plans[festivalId]),
    [plans],
  )

  const toggleArtist = useCallback(
    (festivalId, setId) =>
      updatePlan(festivalId, (plan) => ({ ...plan, artists: toggleIn(plan.artists, setId) })),
    [updatePlan],
  )

  const togglePoi = useCallback(
    (festivalId, poiId) =>
      updatePlan(festivalId, (plan) => ({ ...plan, pois: toggleIn(plan.pois, poiId) })),
    [updatePlan],
  )

  const addPin = useCallback(
    (festivalId, { label, x, y }) =>
      updatePlan(festivalId, (plan) => ({
        ...plan,
        // Counter-based id: unique within a plan without needing a uuid library.
        pins: [...plan.pins, { id: `pin-${plan.pins.length + 1}-${label.slice(0, 12)}`, label, x, y }],
      })),
    [updatePlan],
  )

  const removePin = useCallback(
    (festivalId, pinId) =>
      updatePlan(festivalId, (plan) => ({
        ...plan,
        pins: plan.pins.filter((p) => p.id !== pinId),
      })),
    [updatePlan],
  )

  const setNotes = useCallback(
    (festivalId, notes) => updatePlan(festivalId, (plan) => ({ ...plan, notes })),
    [updatePlan],
  )

  const clearPlan = useCallback(
    (festivalId) => updatePlan(festivalId, () => ({ ...EMPTY_PLAN })),
    [updatePlan],
  )

  /** How many things the user has saved for a festival — drives the nav badge. */
  const planSize = useCallback(
    (festivalId) => {
      const plan = normalizePlan(plans[festivalId])
      return plan.artists.length + plan.pois.length + plan.pins.length
    },
    [plans],
  )

  /**
   * Festival ids the user has actually put something into — drives the "My
   * Plans" nav badge and page. Notes count: a plan that is only a note is still
   * a plan the user wrote.
   */
  const plannedFestivalIds = useMemo(
    () =>
      Object.entries(plans)
        .filter(([, raw]) => {
          const plan = normalizePlan(raw)
          return plan.artists.length + plan.pois.length + plan.pins.length > 0 || plan.notes
        })
        .map(([festivalId]) => festivalId),
    [plans],
  )

  const value = useMemo(
    () => ({
      plans,
      plannedFestivalIds,
      getPlan,
      planSize,
      toggleArtist,
      togglePoi,
      addPin,
      removePin,
      setNotes,
      clearPlan,
    }),
    [
      plans,
      plannedFestivalIds,
      getPlan,
      planSize,
      toggleArtist,
      togglePoi,
      addPin,
      removePin,
      setNotes,
      clearPlan,
    ],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlans() {
  const context = useContext(PlanContext)
  if (!context) throw new Error('usePlans must be used inside a <PlanProvider>')
  return context
}
