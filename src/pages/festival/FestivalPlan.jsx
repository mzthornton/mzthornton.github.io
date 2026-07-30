import { useMemo } from 'react'
import { Row, Col, Card, ListGroup, Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { POI_TYPES } from '../../data/festivals.js'
import { useFestival } from '../FestivalDetail.jsx'
import {
  dateForDay,
  formatLongDate,
  formatTime,
  setKey,
  setsFromKeys,
} from '../../lib/festivalUtils.js'

/**
 * My Plan tab: everything the user saved for this festival, in one place.
 *
 * Nothing new is stored here — this screen is a read-and-remove view over the
 * same plan the Schedule and Map tabs write to, plus a free-text notes field.
 */
function FestivalPlan() {
  const { festival, plan, planCount, toggleArtist, togglePoi, removePin, setNotes, clearPlan } =
    useFestival()

  const savedSets = useMemo(() => setsFromKeys(festival, plan.artists), [festival, plan.artists])
  const savedPois = festival.pois.filter((p) => plan.pois.includes(p.id))

  const byDay = Array.from({ length: festival.days }, (_, i) => ({
    day: i + 1,
    date: dateForDay(festival, i + 1),
    sets: savedSets.filter((s) => s.day === i + 1),
  })).filter((d) => d.sets.length > 0)

  if (planCount === 0 && !plan.notes) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <div className="display-6 mb-2">⭐</div>
          <h2 className="h5">Your plan for {festival.name} is empty</h2>
          <p className="text-muted">
            Save the sets you cannot miss from the schedule, and mark the spots you
            need to find on the map.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button as={Link} to="../schedule" variant="primary" size="sm">
              Browse the schedule
            </Button>
            <Button as={Link} to="../map" variant="outline-primary" size="sm">
              Open the map
            </Button>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <h2 className="h4 mb-0">My plan</h2>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">
            {plan.artists.length} sets &middot; {savedPois.length} spots &middot; {plan.pins.length} pins
          </span>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => {
              // Confirm before throwing away a plan the user built by hand.
              if (window.confirm(`Clear your whole plan for ${festival.name}?`)) clearPlan()
            }}
          >
            Clear plan
          </Button>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <h3 className="h6 text-uppercase text-muted">Sets I am catching</h3>
          {byDay.length === 0 ? (
            <Card body className="text-muted mb-3">
              No sets saved yet.{' '}
              <Link to="../schedule">Pick some from the schedule</Link>.
            </Card>
          ) : (
            byDay.map((d) => (
              <Card key={d.day} className="shadow-sm mb-3">
                <Card.Header className="fw-semibold">
                  Day {d.day}{' '}
                  <span className="text-muted small fw-normal">· {formatLongDate(d.date)}</span>
                </Card.Header>
                <ListGroup variant="flush">
                  {d.sets.map((set) => (
                    <ListGroup.Item
                      key={setKey(set)}
                      className="d-flex gap-3 align-items-center flex-wrap"
                    >
                      <div className="set-row__time text-nowrap small">
                        <div className="fw-semibold">{formatTime(set.start)}</div>
                        <div className="text-muted">{formatTime(set.end)}</div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{set.name}</div>
                        <div className="text-muted small">{set.stage}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => toggleArtist(setKey(set))}
                        aria-label={`Remove ${set.name} from my plan`}
                      >
                        ×
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            ))
          )}
        </Col>

        <Col lg={5}>
          <h3 className="h6 text-uppercase text-muted">Spots on the grounds</h3>
          <Card className="shadow-sm mb-4">
            {savedPois.length + plan.pins.length === 0 ? (
              <Card.Body className="text-muted">
                Nothing marked yet. <Link to="../map">Open the map</Link> and save a few
                spots.
              </Card.Body>
            ) : (
              <ListGroup variant="flush">
                {savedPois.map((poi) => (
                  <ListGroup.Item
                    key={poi.id}
                    className="d-flex justify-content-between align-items-start gap-2"
                  >
                    <div>
                      <div>
                        {POI_TYPES[poi.type].icon} <strong>{poi.name}</strong>
                      </div>
                      <div className="text-muted small">{poi.note}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => togglePoi(poi.id)}
                      aria-label={`Remove ${poi.name} from my plan`}
                    >
                      ×
                    </Button>
                  </ListGroup.Item>
                ))}

                {plan.pins.map((pin) => (
                  <ListGroup.Item
                    key={pin.id}
                    className="d-flex justify-content-between align-items-center gap-2"
                  >
                    <div>
                      📌 <strong>{pin.label}</strong>
                      <div className="text-muted small">
                        Your pin at {pin.x}% across, {pin.y}% down
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => removePin(pin.id)}
                      aria-label={`Remove ${pin.label} from my plan`}
                    >
                      ×
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>

          <h3 className="h6 text-uppercase text-muted">Notes</h3>
          <Form.Control
            as="textarea"
            rows={5}
            value={plan.notes}
            placeholder="Ride share at 3, tent stakes, whose turn it is to buy the first round…"
            onChange={(e) => setNotes(e.target.value)}
          />
          <Form.Text className="text-muted">Saved automatically as you type.</Form.Text>
        </Col>
      </Row>
    </>
  )
}

export default FestivalPlan
