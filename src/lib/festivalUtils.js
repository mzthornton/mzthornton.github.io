/**
 * Date, filtering, and schedule helpers shared by the festival screens.
 *
 * All "YYYY-MM-DD" strings are treated as *local* dates. Passing one straight
 * to `new Date()` would parse it as UTC and shift the day for anyone west of
 * Greenwich, so we always split it apart first (see `parseISODate`).
 */

/** "YYYY-MM-DD" -> Date at local midnight. */
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Local midnight today, as a Date. */
export function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Whole days from today until `iso`. Negative once the date has passed. */
export function daysUntil(iso) {
  return Math.round((parseISODate(iso) - today()) / MS_PER_DAY)
}

/** "Aug 15" style short date. */
export function formatShortDate(iso) {
  return parseISODate(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

/** "Saturday, August 15, 2026" style long date. */
export function formatLongDate(iso) {
  return parseISODate(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** "Aug 15 – 17, 2026", collapsing the month when both dates share one. */
export function formatDateRange(startIso, endIso) {
  const start = parseISODate(startIso)
  const end = parseISODate(endIso)
  const year = end.getFullYear()

  if (startIso === endIso) return `${formatShortDate(startIso)}, ${year}`

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const endLabel = sameMonth ? end.getDate() : formatShortDate(endIso)
  return `${formatShortDate(startIso)} – ${endLabel}, ${year}`
}

/** "8:30 PM" from a 24h "HH:MM" string. */
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

/** The ISO date of day `day` (1-based) of a festival. */
export function dateForDay(festival, day) {
  const d = parseISODate(festival.startDate)
  d.setDate(d.getDate() + (day - 1))
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "in 3 days" / "Today" / "Tomorrow" — the countdown shown on festival cards. */
export function countdownLabel(iso) {
  const days = daysUntil(iso)
  if (days === 0) return 'Starts today'
  if (days === 1) return 'Starts tomorrow'
  if (days < 0) return 'Underway'
  if (days < 14) return `In ${days} days`
  if (days < 60) return `In ${Math.round(days / 7)} weeks`
  return `In ${Math.round(days / 30)} months`
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/**
 * True when the festival's run overlaps the [from, to] window. Either bound may
 * be an empty string, which means "unbounded on that side".
 */
export function overlapsDateRange(festival, from, to) {
  if (from && festival.endDate < from) return false
  if (to && festival.startDate > to) return false
  return true
}

/** Lineup entries whose artist name contains `query` (case-insensitive). */
export function matchingArtists(festival, query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return festival.lineup.filter((a) => a.name.toLowerCase().includes(q))
}

/**
 * Upcoming festivals, filtered then sorted by closest start date.
 *
 * `filters` -> { from, to, artist }
 */
export function filterFestivals(festivals, filters) {
  const { from = '', to = '', artist = '' } = filters
  return festivals
    .filter((f) => daysUntil(f.endDate) >= 0) // drop anything already over
    .filter((f) => overlapsDateRange(f, from, to))
    .filter((f) => !artist.trim() || matchingArtists(f, artist).length > 0)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

/** Minutes past midnight, treating post-midnight sets as belonging to the prior night. */
export function minutesOf(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  // A set listed at 01:00 runs *after* one listed at 23:00 on the same festival
  // day, so shift the small hours past the end of the day for sorting.
  const hour = h < 6 ? h + 24 : h
  return hour * 60 + m
}

/**
 * Lineup grouped by festival day:
 *   [{ day, date, sets: [...sorted by start time] }, ...]
 */
export function scheduleByDay(festival) {
  return Array.from({ length: festival.days }, (_, i) => {
    const day = i + 1
    return {
      day,
      date: dateForDay(festival, day),
      sets: festival.lineup
        .filter((s) => s.day === day)
        .sort((a, b) => minutesOf(a.start) - minutesOf(b.start)),
    }
  })
}

/**
 * Stable id for one performance.
 *
 * An artist can play a festival more than once (Wildwater plays two nights at
 * Ridgeline Rally), so the name alone is not unique — the saved-set id has to
 * include when the set happens.
 */
export const setKey = (set) => `${set.name}|${set.day}|${set.start}`

/** The lineup entries in `festival` matching a list of saved set keys. */
export function setsFromKeys(festival, keys) {
  const wanted = new Set(keys)
  return festival.lineup
    .filter((s) => wanted.has(setKey(s)))
    .sort((a, b) => a.day - b.day || minutesOf(a.start) - minutesOf(b.start))
}

/** Do two sets on the same day overlap in time? */
export function setsOverlap(a, b) {
  if (a.day !== b.day) return false
  return minutesOf(a.start) < minutesOf(b.end) && minutesOf(b.start) < minutesOf(a.end)
}

/** How many minutes two sets overlap by. 0 when they don't. */
export function overlapMinutes(a, b) {
  if (a.day !== b.day) return 0
  const shared =
    Math.min(minutesOf(a.end), minutesOf(b.end)) - Math.max(minutesOf(a.start), minutesOf(b.start))
  return Math.max(0, shared)
}

/**
 * The other saved sets this one runs into, with how long each collision lasts:
 *   [{ set, minutes }, ...] worst first.
 *
 * Only the route review on My Plans uses this — the point there is to say *how
 * much* time is double-booked, not merely that something is.
 */
export function overlapsWith(set, savedSets) {
  return savedSets
    .filter((other) => other !== set && setsOverlap(set, other))
    .map((other) => ({ set: other, minutes: overlapMinutes(set, other) }))
    .sort((a, b) => b.minutes - a.minutes)
}

// ---------------------------------------------------------------------------
// Route across the grounds
// ---------------------------------------------------------------------------

/**
 * The map point that *is* a stage, matched on name.
 *
 * The lineup stores a stage as a plain string while the map stores it as a POI,
 * and the two are joined by name only — every stage in the data has a matching
 * `type: 'stage'` POI. Returns null rather than throwing if one is ever missing,
 * so a data slip degrades to "this stop has no position" instead of a blank page.
 */
export function stagePoi(festival, stageName) {
  return festival.pois.find((p) => p.type === 'stage' && p.name === stageName) ?? null
}

/**
 * One day of saved sets turned into an ordered walk across the grounds:
 *
 *   [{ stop, stage, poi, sets: [...in time order] }, ...]
 *
 * Back-to-back sets on the same stage collapse into a single stop, because
 * standing still is not a leg of the walk — an evening camped at one stage is
 * one numbered marker on the map, not four stacked on the same spot.
 */
export function routeForDay(festival, sets) {
  const ordered = [...sets].sort((a, b) => minutesOf(a.start) - minutesOf(b.start))

  return ordered.reduce((stops, set) => {
    const last = stops[stops.length - 1]
    if (last && last.stage === set.stage) {
      last.sets.push(set)
      return stops
    }
    stops.push({
      stop: stops.length + 1,
      stage: set.stage,
      poi: stagePoi(festival, set.stage),
      sets: [set],
    })
    return stops
  }, [])
}
