import { useEffect, useMemo, useRef, useState } from 'react'
import { Row, Col, Card, Badge, Button, ButtonGroup, ListGroup } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import FESTIVALS, { POI_TYPES, getFestival } from '../data/festivals.js'
import { usePlans } from '../context/PlanContext.jsx'
import PlanRouteMap from '../components/PlanRouteMap.jsx'
import {
  countdownLabel,
  daysUntil,
  dateForDay,
  formatDateRange,
  formatLongDate,
  formatTime,
  minutesOf,
  overlapsWith,
  routeForDay,
  setKey,
  setsFromKeys,
} from '../lib/festivalUtils.js'

/**
 * Every plan the user has, across all festivals, on one screen.
 *
 * Read-only by design: this is the "what am I committed to" view. Editing still
 * happens on the festival's own Schedule / Map / My Plan tabs, which each card
 * links straight into.
 *
 * Arriving from a festival's save button carries `focusFestivalId` in router
 * state, and that festival's card scrolls itself into view and takes focus —
 * otherwise saving a plan can drop you at the top of a page of other festivals
 * with no sign of the one you just finished.
 */
function MyPlans() {
  const { plans } = usePlans()
  const { state } = useLocation()
  const focusFestivalId = state?.focusFestivalId ?? null

  // Turn the raw { festivalId: plan } map into something renderable: resolve the
  // festival, drop anything empty, and order by whichever happens soonest.
  const planned = useMemo(() => {
    return Object.entries(plans)
      .map(([festivalId, plan]) => {
        const festival = getFestival(festivalId)
        // A plan can outlive its festival if the data changes underneath it.
        if (!festival) return null

        const savedSets = setsFromKeys(festival, plan.artists ?? [])
        const savedPois = festival.pois.filter((p) => (plan.pois ?? []).includes(p.id))
        const pins = plan.pins ?? []
        const notes = plan.notes ?? ''
        const total = savedSets.length + savedPois.length + pins.length
        if (total === 0 && !notes) return null

        return {
          festival,
          savedSets,
          savedPois,
          pins,
          notes,
          total,
          isOver: daysUntil(festival.endDate) < 0,
          // Every festival day, so the map's day picker can show a quiet day too.
          byDay: Array.from({ length: festival.days }, (_, i) => ({
            day: i + 1,
            date: dateForDay(festival, i + 1),
            sets: savedSets.filter((s) => s.day === i + 1),
          })),
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Finished festivals sink to the bottom; the rest go soonest-first.
        if (a.isOver !== b.isOver) return a.isOver ? 1 : -1
        return a.festival.startDate.localeCompare(b.festival.startDate)
      })
  }, [plans])

  const totals = planned.reduce(
    (acc, p) => ({
      sets: acc.sets + p.savedSets.length,
      spots: acc.spots + p.savedPois.length + p.pins.length,
    }),
    { sets: 0, spots: 0 },
  )

  if (planned.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <div className="display-6 mb-2">⭐</div>
          <h1 className="h4">You haven&rsquo;t planned anything yet</h1>
          <p className="text-muted">
            Pick a festival, star the sets you refuse to miss, and mark the spots you
            need to find on the grounds. Everything you save shows up here.
          </p>
          <Button as={Link} to="/festivals" variant="primary">
            Browse {FESTIVALS.length} upcoming festivals
          </Button>
        </Card.Body>
      </Card>
    )
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-1">
        <h1 className="h3 mb-0">My plans</h1>
        <Button as={Link} to="/festivals" size="sm" variant="outline-primary">
          + Plan another festival
        </Button>
      </div>
      <p className="text-muted">
        {planned.length} festival{planned.length === 1 ? '' : 's'} &middot; {totals.sets} set
        {totals.sets === 1 ? '' : 's'} &middot; {totals.spots} spot
        {totals.spots === 1 ? '' : 's'} on the maps
      </p>

      {/* Saved a festival you had put nothing into: there is no card to scroll
          to, so say so rather than leaving the arrival looking broken. */}
      {focusFestivalId && !planned.some((p) => p.festival.id === focusFestivalId) && (
        <p className="text-muted small">
          Nothing is saved for {getFestival(focusFestivalId)?.name ?? 'that festival'} yet, so it
          has no card here.{' '}
          <Link to={`/festivals/${focusFestivalId}/schedule`}>Pick some sets</Link>.
        </p>
      )}

      {planned.map((entry) => (
        <PlanCard
          key={entry.festival.id}
          entry={entry}
          justSaved={entry.festival.id === focusFestivalId}
        />
      ))}
    </>
  )
}

/**
 * One festival's plan: the day's route drawn on the grounds map, the same day's
 * saved sets numbered to match it, then the spots and notes.
 *
 * Each card keeps its own selected day, which is why this is a component rather
 * than inline JSX — the state has to be per festival.
 *
 * `justSaved` marks the card the user arrived here to see: it scrolls itself in,
 * takes focus, and holds a green ring for a couple of seconds.
 */
function PlanCard({ entry, justSaved = false }) {
  const { festival, savedPois, pins, notes, total, isOver, byDay } = entry

  // Open on the first day that has something saved; failing that, day 1.
  const [day, setDay] = useState(() => (byDay.find((d) => d.sets.length > 0) ?? byDay[0]).day)
  const active = byDay.find((d) => d.day === day) ?? byDay[0]

  const stops = useMemo(() => routeForDay(festival, active.sets), [festival, active.sets])

  // How much of each set is double-booked against the rest of the day, keyed by
  // set. This is the one place the app still works overlaps out: reviewing the
  // route is when the minutes matter, because that is when you decide what to
  // cut short.
  const overlaps = useMemo(() => {
    const bySet = new Map()
    for (const set of active.sets) {
      const against = overlapsWith(set, active.sets)
      if (against.length > 0) bySet.set(setKey(set), against)
    }
    return bySet
  }, [active.sets])

  const cardRef = useRef(null)
  const [highlighted, setHighlighted] = useState(false)

  // Scroll to and focus the card the save button sent us to. Focus, not just
  // scroll, so this reads the same to a screen reader as it looks on screen.
  useEffect(() => {
    const card = cardRef.current
    if (!justSaved || !card) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    // preventScroll, or focus would jump the page and cut short the scroll it
    // just started.
    card.focus({ preventScroll: true })

    // The ring is a "here it is" nudge, not a state — it fades on its own so it
    // never looks like a warning about this plan.
    setHighlighted(true)
    const timer = window.setTimeout(() => setHighlighted(false), 2500)
    return () => window.clearTimeout(timer)
  }, [justSaved])

  return (
    <Card
      ref={cardRef}
      tabIndex={-1}
      className={`shadow-sm mb-4 plan-card ${highlighted ? 'plan-card--just-saved' : ''}`}
    >
      <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <Link to={`/festivals/${festival.id}/plan`} className="fw-semibold text-decoration-none">
            {festival.name}
          </Link>
          <div className="text-muted small">
            📅 {formatDateRange(festival.startDate, festival.endDate)} &middot; 📍 {festival.location}
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg={isOver ? 'secondary' : 'dark'}>
            {isOver ? 'Finished' : countdownLabel(festival.startDate)}
          </Badge>
          <Badge bg="success" pill>
            {total} saved
          </Badge>
        </div>
      </Card.Header>

      <Card.Body>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 className="h6 text-uppercase text-muted mb-0">
            Where to be &middot; {formatLongDate(active.date)}
          </h2>
          {byDay.length > 1 && (
            <ButtonGroup size="sm" aria-label={`Pick a day of ${festival.name}`}>
              {byDay.map((d) => (
                <Button
                  key={d.day}
                  variant={d.day === day ? 'primary' : 'outline-secondary'}
                  onClick={() => setDay(d.day)}
                  aria-pressed={d.day === day}
                >
                  Day {d.day}
                  {d.sets.length > 0 && (
                    <Badge bg={d.day === day ? 'light' : 'secondary'} text={d.day === day ? 'dark' : undefined} className="ms-2">
                      {d.sets.length}
                    </Badge>
                  )}
                </Button>
              ))}
            </ButtonGroup>
          )}
        </div>

        <Row className="g-4">
          <Col lg={7}>
            <PlanRouteMap
              festival={festival}
              stops={stops}
              pois={savedPois}
              pins={pins}
            />
          </Col>

          <Col lg={5}>
            {stops.length === 0 ? (
              <p className="text-muted small">
                Nothing saved for day {active.day} yet — the map shows your other saved
                spots. <Link to={`/festivals/${festival.id}/schedule`}>Pick some sets</Link>.
              </p>
            ) : (
              <ol className="plan-route list-unstyled mb-0">
                {stops.map((stop, i) => {
                  const first = stop.sets[0]
                  const previous = stops[i - 1]
                  // Time between leaving the last set and the next one starting.
                  // A negative gap means the two sets run into each other, and
                  // the per-set warning below already names both and says by how
                  // many minutes — so only real travel time is shown here.
                  const gap = previous
                    ? minutesOf(first.start) -
                      minutesOf(previous.sets[previous.sets.length - 1].end)
                    : null

                  return (
                    <li key={stop.stop}>
                      {gap !== null && gap >= 0 && (
                        <div className="plan-route__gap small">
                          {gap} min to get across the grounds
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        <span className="plan-route__num" aria-hidden="true">
                          {stop.stop}
                        </span>
                        <div className="flex-grow-1">
                          <div className="small fw-semibold">
                            {POI_TYPES.stage.icon} {stop.stage}
                            {!stop.poi && (
                              <span className="text-muted fw-normal"> · not on the map</span>
                            )}
                          </div>
                          {stop.sets.map((set) => {
                            const against = overlaps.get(setKey(set)) ?? []
                            return (
                              <div key={setKey(set)} className="small">
                                <span className="text-muted me-1">
                                  {formatTime(set.start)}–{formatTime(set.end)}
                                </span>
                                {set.name}
                                {against.map(({ set: other, minutes }) => (
                                  <div
                                    key={setKey(other)}
                                    className="text-warning-emphasis small"
                                  >
                                    Overlaps {other.name} by {minutes} min
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </Col>
        </Row>

        <hr className="my-4" />

        <Row className="g-4">
          <Col md={6}>
            <h2 className="h6 text-uppercase text-muted">On the grounds</h2>
            {savedPois.length + pins.length === 0 ? (
              <p className="text-muted small mb-0">
                Nothing marked. <Link to={`/festivals/${festival.id}/map`}>Open the map</Link>.
              </p>
            ) : (
              <ListGroup variant="flush">
                {savedPois.map((poi) => (
                  <ListGroup.Item key={poi.id} className="px-0 py-1 border-0 small">
                    {POI_TYPES[poi.type].icon} {poi.name}
                  </ListGroup.Item>
                ))}
                {pins.map((pin) => (
                  <ListGroup.Item key={pin.id} className="px-0 py-1 border-0 small">
                    📌 {pin.label}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>

          <Col md={6}>
            {notes && (
              <>
                <h2 className="h6 text-uppercase text-muted">Notes</h2>
                {/* white-space: pre-wrap keeps the user's own line breaks. */}
                <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                  {notes}
                </p>
              </>
            )}
          </Col>
        </Row>
      </Card.Body>

      <Card.Footer className="bg-white d-flex flex-wrap gap-2">
        <Button as={Link} to={`/festivals/${festival.id}/plan`} size="sm" variant="primary">
          Edit this plan
        </Button>
        <Button
          as={Link}
          to={`/festivals/${festival.id}/schedule`}
          size="sm"
          variant="outline-secondary"
        >
          Timetable
        </Button>
        <Button as={Link} to={`/festivals/${festival.id}/map`} size="sm" variant="outline-secondary">
          Map
        </Button>
      </Card.Footer>
    </Card>
  )
}

export default MyPlans
