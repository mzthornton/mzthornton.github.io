import { formatTime, minutesOf, setKey } from '../lib/festivalUtils.js'

/**
 * One day of a festival laid out as a timetable: stages across the top, time
 * running down the side, every set placed in its stage's column at its real
 * start time.
 *
 * Two sets at the same time sit side by side on the same rows, so overlaps are
 * something you *see* rather than something the app has to tell you about.
 *
 * Colour carries one meaning only: green means "this is in my plan".
 *
 * Built on CSS Grid: the day is divided into 15-minute rows (every set time in
 * the data lands on a quarter hour) and each set spans however many rows its
 * length covers.
 */

const SLOT_MINUTES = 15
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES

/**
 * Clock label for a "minutes past midnight" value that may have been pushed
 * past 24h by minutesOf() — a 1 AM set belongs to the previous night here.
 */
function clockLabel(minutes) {
  const wrapped = minutes % (24 * 60)
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  return formatTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
}

function ScheduleGrid({ sets, stages, savedKeys, onToggle }) {
  if (sets.length === 0) return null

  // Bound the grid to the hours this day actually uses, rounded out to whole
  // hours so the time labels stay tidy.
  const starts = sets.map((s) => minutesOf(s.start))
  const ends = sets.map((s) => minutesOf(s.end))
  const gridStart = Math.floor(Math.min(...starts) / 60) * 60
  const gridEnd = Math.ceil(Math.max(...ends) / 60) * 60
  const totalSlots = (gridEnd - gridStart) / SLOT_MINUTES

  // Row 1 is the stage header, so set rows begin at row 2.
  const rowFor = (minutes) => (minutes - gridStart) / SLOT_MINUTES + 2

  const hourMarks = []
  for (let m = gridStart; m < gridEnd; m += 60) hourMarks.push(m)

  return (
    <div className="schedule-grid-scroll">
      <div
        className="schedule-grid"
        style={{
          gridTemplateColumns: `4.75rem repeat(${stages.length}, minmax(8.5rem, 1fr))`,
          gridTemplateRows: `auto repeat(${totalSlots}, 0.95rem)`,
        }}
      >
        {/* Stage headers */}
        <div className="schedule-grid__corner" />
        {stages.map((stage, i) => (
          <div key={stage} className="schedule-grid__head" style={{ gridColumn: i + 2, gridRow: 1 }}>
            {stage}
          </div>
        ))}

        {/* Hour rules and labels, drawn behind the set blocks. */}
        {hourMarks.map((m) => (
          <div key={`rule-${m}`} className="schedule-grid__rule" style={{ gridRow: rowFor(m) }} />
        ))}
        {hourMarks.map((m) => (
          <div
            key={`label-${m}`}
            className="schedule-grid__time"
            style={{ gridColumn: 1, gridRow: `${rowFor(m)} / span ${SLOTS_PER_HOUR}` }}
          >
            {clockLabel(m)}
          </div>
        ))}

        {/* The sets themselves. */}
        {sets.map((set) => {
          const key = setKey(set)
          const saved = savedKeys.has(key)
          const column = stages.indexOf(set.stage) + 2
          const span = (minutesOf(set.end) - minutesOf(set.start)) / SLOT_MINUTES

          return (
            <button
              key={key}
              type="button"
              className={['schedule-block', saved && 'schedule-block--saved']
                .filter(Boolean)
                .join(' ')}
              style={{ gridColumn: column, gridRow: `${rowFor(minutesOf(set.start))} / span ${span}` }}
              onClick={() => onToggle(key)}
              aria-pressed={saved}
              title={`${set.name} · ${formatTime(set.start)}–${formatTime(set.end)} · ${set.stage}\n${
                set.bio
              }`}
              aria-label={`${set.name}, ${formatTime(set.start)} to ${formatTime(set.end)}, ${
                set.stage
              }. ${saved ? 'Saved to your plan.' : 'Not saved.'}`}
            >
              <span className="schedule-block__name">
                {saved ? '★ ' : ''}
                {set.name}
              </span>
              <span className="schedule-block__meta">
                {formatTime(set.start)} – {formatTime(set.end)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ScheduleGrid
