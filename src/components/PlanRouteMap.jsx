import { POI_TYPES } from '../data/festivals.js'
import { formatTime } from '../lib/festivalUtils.js'

/**
 * Read-only version of the grounds map showing one day's saved plan as a route.
 *
 * <GroundsMap> is for *building* a plan, so it owns selection, pin-drop mode and
 * the save buttons. This one answers a different question — "where do I need to
 * be, and in what order?" — so it draws the same grounds with the day's saved
 * sets numbered in the order they happen, joined by a dashed line, and the rest
 * of the saved spots faded behind them.
 *
 * Nothing here is clickable: the whole map is one `role="img"` and the itinerary
 * list beside it (in MyPlans) is the accessible equivalent, which is why the pin
 * labels can stay decorative.
 *
 * Props:
 *   stops — routeForDay() output: [{ stop, stage, poi, sets }]
 *   pois  — saved points of interest for this festival
 *   pins  — the user's own dropped pins
 *
 * The map stays neutral about double-booked sets: the itinerary beside it is
 * where an overlap is called out, and it says which set and by how long.
 */
function PlanRouteMap({ festival, stops, pois = [], pins = [] }) {
  // Two stops can share one stage (leave and come back later), which would stack
  // two markers on the same coordinate. Group by position and let one marker
  // carry every stop number that happens there: "1, 4".
  const markers = []
  for (const stop of stops) {
    if (!stop.poi) continue // stage with no matching map point — nothing to place
    const existing = markers.find((m) => m.poi.id === stop.poi.id)
    if (existing) existing.stops.push(stop)
    else markers.push({ poi: stop.poi, stops: [stop] })
  }

  // A stage already numbered as a route stop shouldn't also appear as a plain
  // saved pin underneath it.
  const routePoiIds = new Set(markers.map((m) => m.poi.id))
  const otherPois = pois.filter((p) => !routePoiIds.has(p.id))

  const line = stops.filter((s) => s.poi).map((s) => `${s.poi.x},${s.poi.y}`)

  const label = stops.length
    ? `Grounds map: ${stops.length} stop${stops.length === 1 ? '' : 's'} in order — ${stops
        .map((s) => `${s.stop}. ${s.stage}`)
        .join(', ')}.`
    : 'Grounds map with your saved spots.'

  return (
    <>
      <div className="grounds-map grounds-map--static" role="img" aria-label={label}>
        <span className="grounds-map__label grounds-map__label--gate">Main Gate</span>

        {/*
          The route line. viewBox 0 0 100 100 with preserveAspectRatio="none"
          makes the POI percentages usable as SVG coordinates directly;
          non-scaling-stroke stops that squash from distorting the line width.
        */}
        {line.length > 1 && (
          <svg
            className="map-route"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline points={line.join(' ')} vectorEffect="non-scaling-stroke" />
          </svg>
        )}

        {otherPois.map((poi) => {
          const meta = POI_TYPES[poi.type]
          return (
            <div
              key={poi.id}
              className="map-pin map-pin--static map-pin--saved map-pin--muted"
              style={{ left: `${poi.x}%`, top: `${poi.y}%`, '--pin-color': meta.color }}
              aria-hidden="true"
            >
              <span className="map-pin__icon">{meta.icon}</span>
              <span className="map-pin__name">{poi.name}</span>
            </div>
          )
        })}

        {pins.map((pin) => (
          <div
            key={pin.id}
            className="map-pin map-pin--static map-pin--saved map-pin--muted map-pin--custom"
            style={{ left: `${pin.x}%`, top: `${pin.y}%`, '--pin-color': POI_TYPES.custom.color }}
            aria-hidden="true"
          >
            <span className="map-pin__icon">📌</span>
            <span className="map-pin__name">{pin.label}</span>
          </div>
        ))}

        {markers.map(({ poi, stops: here }) => {
          // One entry per visit, so leaving and coming back later reads as two
          // times rather than one long stretch you were never there for.
          const times = here.map(({ sets }) =>
            sets.length > 1
              ? `${formatTime(sets[0].start)}–${formatTime(sets[sets.length - 1].end)}`
              : formatTime(sets[0].start),
          )
          return (
            <div
              key={poi.id}
              className="map-pin map-pin--static map-pin--stop"
              style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
              aria-hidden="true"
            >
              <span className="map-pin__icon">{here.map((s) => s.stop).join(',')}</span>
              <span className="map-pin__name">{poi.name}</span>
              <span className="map-pin__meta">{times.join(' · ')}</span>
            </div>
          )
        })}
      </div>

      <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
        <span>
          <span className="map-legend-dot" aria-hidden="true">
            1
          </span>{' '}
          Where to be, in order
        </span>
        {otherPois.length + pins.length > 0 && <span>★ Other spots you saved</span>}
      </div>
    </>
  )
}

export default PlanRouteMap
