import { Nav, Badge, Button, Card } from 'react-bootstrap'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useOutletContext,
  useParams,
} from 'react-router-dom'
import FESTIVALS, { getFestival } from '../data/festivals.js'
import { usePlans } from '../context/PlanContext.jsx'
import { countdownLabel, formatDateRange } from '../lib/festivalUtils.js'

const TABS = [
  { to: 'about', label: 'About', icon: 'ℹ️' },
  { to: 'map', label: 'Map', icon: '🗺️' },
  { to: 'schedule', label: 'Schedule', icon: '🗓️' },
  { to: 'plan', label: 'My Plan', icon: '⭐' },
]

/**
 * Festival detail shell: header, the four-tab sub-navigation, and an <Outlet>
 * for whichever tab is showing.
 *
 * The tabs are nested routes, not local state, so every tab is a real URL you
 * can bookmark, share, or reload (e.g. /#/festivals/solstice-sound/schedule).
 * The festival and the user's plan are handed down through the outlet context
 * so the tab components stay thin.
 *
 * Under the tab content sits a pager: back / forward arrows through the same
 * four tabs in the order they appear above, and a save button that returns to
 * the festival list.
 */
function FestivalDetail() {
  const { festivalId } = useParams()
  const { pathname } = useLocation()
  const festival = getFestival(festivalId)
  const { getPlan, planSize, toggleArtist, togglePoi, addPin, removePin, setNotes, clearPlan } =
    usePlans()

  if (!festival) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <h1 className="h4">That festival isn&rsquo;t on the lineup</h1>
          <p className="text-muted">
            No festival with the id &ldquo;{festivalId}&rdquo;. It may have been renamed.
          </p>
          <Button as={Link} to="/festivals" variant="outline-primary">
            Back to all festivals
          </Button>
        </Card.Body>
      </Card>
    )
  }

  const plan = getPlan(festival.id)

  // Bound to this festival so the tab components never pass an id around.
  const context = {
    festival,
    plan,
    planCount: planSize(festival.id),
    toggleArtist: (setId) => toggleArtist(festival.id, setId),
    togglePoi: (poiId) => togglePoi(festival.id, poiId),
    addPin: (pin) => addPin(festival.id, pin),
    removePin: (pinId) => removePin(festival.id, pinId),
    setNotes: (notes) => setNotes(festival.id, notes),
    clearPlan: () => clearPlan(festival.id),
  }

  const index = FESTIVALS.findIndex((f) => f.id === festival.id)

  // Which tab is showing, from the URL rather than state, so the arrows stay
  // right after a reload or a back-button press. The bare /festivals/:id URL
  // redirects to About, so an unmatched segment means "the first tab".
  const segment = pathname.split('/').filter(Boolean).pop()
  const tabIndex = Math.max(
    0,
    TABS.findIndex((t) => t.to === segment),
  )
  const previous = TABS[tabIndex - 1]
  const next = TABS[tabIndex + 1]

  return (
    <>
      <Link to="/festivals" className="small text-decoration-none">
        ← All festivals
      </Link>

      <div className="festival-hero p-4 rounded-3 mt-2 mb-3" data-hero={index % 4}>
        <Badge bg="light" text="dark" className="mb-2">
          {countdownLabel(festival.startDate)}
        </Badge>
        <h1 className="h2 mb-1">{festival.name}</h1>
        <p className="mb-1">{festival.tagline}</p>
        <div className="small">
          📅 {formatDateRange(festival.startDate, festival.endDate)} &middot; 📍 {festival.venue},{' '}
          {festival.location} &middot; 🎫 from ${festival.priceFrom}
        </div>
      </div>

      {/*
        One toolbar: an arrow on either side of the tabs to step through them,
        and the save button pushed to the far right, opposite the tabs.

        The underline belongs to the toolbar rather than to <Nav> itself (see
        .festival-toolbar), so it runs the full width behind the arrows and the
        save button instead of stopping at the last tab.
      */}
      <div className="festival-toolbar mb-4">
        <TabArrow tab={previous} direction="back" />

        {/* `end` is unnecessary here because each tab is a distinct leaf path. */}
        <Nav variant="tabs" className="festival-tabs">
          {TABS.map((tab) => (
            <Nav.Item key={tab.to}>
              <Nav.Link as={NavLink} to={tab.to}>
                <span aria-hidden="true">{tab.icon}</span> {tab.label}
                {tab.to === 'plan' && context.planCount > 0 && (
                  <Badge bg="success" pill className="ms-2">
                    {context.planCount}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <TabArrow tab={next} direction="forward" />

        {/*
          Nothing is written here: every star, pin and keystroke already goes to
          localStorage as it happens. This is the "I'm done with this festival"
          exit, and it lands on this festival's card in My Plans — the id travels
          in router state so the page can scroll to it and focus it.
        */}
        <Button
          as={Link}
          to="/my-plans"
          state={{ focusFestivalId: festival.id }}
          variant="success"
          size="sm"
          className="ms-auto festival-toolbar__save"
          title="Your plan saves itself as you go — this opens it in My Plans"
        >
          💾 Save &amp; view plan
        </Button>
      </div>

      <Outlet context={context} />
    </>
  )
}

/**
 * One step arrow beside the tab bar.
 *
 * At either end of the four tabs there is nowhere to go, and the arrow renders
 * disabled rather than vanishing — the tabs would otherwise shift sideways as
 * you moved through them.
 */
function TabArrow({ tab, direction }) {
  const back = direction === 'back'
  const glyph = back ? '‹' : '›'

  if (!tab) {
    return (
      <Button
        variant="outline-secondary"
        size="sm"
        className="festival-toolbar__arrow"
        disabled
        aria-hidden="true"
      >
        {glyph}
      </Button>
    )
  }

  const label = `${back ? 'Back to' : 'On to'} ${tab.label}`
  return (
    <Button
      as={Link}
      to={tab.to}
      variant="outline-secondary"
      size="sm"
      className="festival-toolbar__arrow"
      title={label}
      aria-label={label}
    >
      {glyph}
    </Button>
  )
}

/** Typed-ish accessor so each tab component reads the same context shape. */
export function useFestival() {
  return useOutletContext()
}

export default FestivalDetail
