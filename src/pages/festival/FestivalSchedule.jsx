import { useMemo, useState } from 'react'
import { Nav, Card, Badge, Button, Form, ListGroup, Row, Col, ButtonGroup } from 'react-bootstrap'
import ScheduleGrid from '../../components/ScheduleGrid.jsx'
import { useFestival } from '../FestivalDetail.jsx'
import {
  formatLongDate,
  formatTime,
  scheduleByDay,
  setKey,
} from '../../lib/festivalUtils.js'

/**
 * Schedule tab: day-by-day set times, in either of two layouts.
 *
 *   Timetable — stages as columns, time down the side, so sets running at the
 *               same time line up beside each other and you can compare them.
 *   List      — one set per row, with the full blurb. Better on a phone.
 *
 * Either way, clicking a set toggles it in the user's plan.
 */
function FestivalSchedule() {
  const { festival, plan, toggleArtist } = useFestival()
  const [day, setDay] = useState(1)
  const [stage, setStage] = useState('all')
  const [savedOnly, setSavedOnly] = useState(false)
  const [view, setView] = useState('grid')

  const days = useMemo(() => scheduleByDay(festival), [festival])
  const savedKeys = new Set(plan.artists)

  const current = days.find((d) => d.day === day) ?? days[0]
  const sets = current.sets
    .filter((s) => stage === 'all' || s.stage === stage)
    .filter((s) => !savedOnly || savedKeys.has(setKey(s)))

  // Only show columns for stages that have something to show after filtering —
  // an empty column is just wasted width.
  const visibleStages = festival.stages.filter((s) => sets.some((set) => set.stage === s))

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <h2 className="h4 mb-0">Schedule</h2>
        <span className="text-muted small">
          {plan.artists.length} of {festival.lineup.length} sets saved to your plan
        </span>
      </div>

      <Nav variant="pills" className="mb-3 gap-2">
        {days.map((d) => {
          const savedThisDay = d.sets.filter((s) => savedKeys.has(setKey(s))).length
          return (
            <Nav.Item key={d.day}>
              <Nav.Link active={d.day === current.day} onClick={() => setDay(d.day)}>
                Day {d.day}
                <span className="d-none d-sm-inline"> · {formatLongDate(d.date).split(',')[0]}</span>
                {savedThisDay > 0 && (
                  <Badge bg="success" pill className="ms-2">
                    {savedThisDay}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
          )
        })}
      </Nav>

      <Row className="g-2 align-items-center mb-3">
        <Col xs="auto">
          <ButtonGroup size="sm">
            <Button
              variant={view === 'grid' ? 'primary' : 'outline-primary'}
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
            >
              ▦ Timetable
            </Button>
            <Button
              variant={view === 'list' ? 'primary' : 'outline-primary'}
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
            >
              ☰ List
            </Button>
          </ButtonGroup>
        </Col>
        <Col xs={12} sm={5} md={4}>
          <Form.Select
            size="sm"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            aria-label="Filter by stage"
          >
            <option value="all">All stages</option>
            {festival.stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col>
          <Form.Check
            type="switch"
            id="savedOnlySwitch"
            label="Only sets I saved"
            checked={savedOnly}
            onChange={(e) => setSavedOnly(e.target.checked)}
          />
        </Col>
      </Row>

      <div className="text-muted small mb-2">
        {formatLongDate(current.date)}
        {view === 'grid' && sets.length > 0 && (
          <span className="d-none d-md-inline"> · click a set to add it to your plan</span>
        )}
      </div>

      {sets.length === 0 ? (
        <Card body className="text-muted">
          Nothing to show for this day with the current filters.
        </Card>
      ) : view === 'grid' ? (
        <ScheduleGrid
          sets={sets}
          stages={visibleStages}
          savedKeys={savedKeys}
          onToggle={toggleArtist}
        />
      ) : (
        <ListGroup>
          {sets.map((set) => {
            const key = setKey(set)
            const saved = savedKeys.has(key)

            return (
              <ListGroup.Item
                key={key}
                className={`d-flex flex-wrap gap-3 align-items-start ${saved ? 'set-row--saved' : ''}`}
              >
                <div className="set-row__time text-nowrap">
                  <div className="fw-semibold">{formatTime(set.start)}</div>
                  <div className="text-muted small">to {formatTime(set.end)}</div>
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span className="fw-semibold">{set.name}</span>
                    <span className="text-muted small">{set.stage}</span>
                  </div>
                  <div className="text-muted small mt-1">{set.bio}</div>
                </div>

                <Button
                  size="sm"
                  variant={saved ? 'success' : 'outline-success'}
                  onClick={() => toggleArtist(key)}
                  aria-pressed={saved}
                  aria-label={`${saved ? 'Remove' : 'Save'} ${set.name} ${
                    saved ? 'from' : 'to'
                  } my plan`}
                >
                  {saved ? '★ Saved' : '☆ Save'}
                </Button>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      )}
    </>
  )
}

export default FestivalSchedule
