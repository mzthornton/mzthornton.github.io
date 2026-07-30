import { useRef, useState } from 'react'
import { Row, Col, Card, Button, Badge, Form, Modal, ListGroup, Alert } from 'react-bootstrap'
import { POI_TYPES } from '../data/festivals.js'

/**
 * Interactive festival grounds map.
 *
 * There is no mapping library here on purpose: the "map" is a styled <div> and
 * every point of interest is a percentage-positioned <button> inside it. That
 * keeps the app dependency-free and means the layout scales with the container
 * instead of needing tiles or a projection.
 *
 * Two ways to add to a plan from this screen:
 *   1. click an official point of interest and save it
 *   2. switch on pin-drop mode and click anywhere to save your own spot
 *      ("meet at this tree", "where we parked")
 */
function GroundsMap({ festival, plan, onTogglePoi, onAddPin, onRemovePin }) {
  const mapRef = useRef(null)
  const [selectedId, setSelectedId] = useState(null)
  const [pinMode, setPinMode] = useState(false)
  const [draftPin, setDraftPin] = useState(null) // { x, y } awaiting a label
  const [pinLabel, setPinLabel] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const savedPois = new Set(plan.pois)
  const selected = festival.pois.find((p) => p.id === selectedId) ?? null

  const visiblePois =
    typeFilter === 'all' ? festival.pois : festival.pois.filter((p) => p.type === typeFilter)

  /** Turn a click anywhere on the map into percentage coordinates. */
  function handleMapClick(event) {
    if (!pinMode) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setDraftPin({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
    setPinLabel('')
  }

  function confirmPin(event) {
    event.preventDefault()
    onAddPin({ label: pinLabel.trim() || 'My spot', x: draftPin.x, y: draftPin.y })
    setDraftPin(null)
    setPinMode(false)
  }

  return (
    <>
      <Row className="g-4">
        <Col lg={8}>
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            <Form.Select
              size="sm"
              style={{ maxWidth: 190 }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter map by type"
            >
              <option value="all">Show everything</option>
              {Object.entries(POI_TYPES)
                .filter(([key]) => key !== 'custom')
                .map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.icon} {meta.label}
                  </option>
                ))}
            </Form.Select>

            <Button
              size="sm"
              variant={pinMode ? 'warning' : 'outline-secondary'}
              onClick={() => setPinMode((on) => !on)}
              aria-pressed={pinMode}
            >
              📌 {pinMode ? 'Click the map to drop a pin…' : 'Drop my own pin'}
            </Button>
          </div>

          <div
            ref={mapRef}
            className={`grounds-map ${pinMode ? 'grounds-map--dropping' : ''}`}
            onClick={handleMapClick}
            role="presentation"
          >
            <span className="grounds-map__label grounds-map__label--gate">Main Gate</span>

            {visiblePois.map((poi) => {
              const meta = POI_TYPES[poi.type]
              const saved = savedPois.has(poi.id)
              return (
                <button
                  key={poi.id}
                  type="button"
                  className={`map-pin ${saved ? 'map-pin--saved' : ''} ${
                    selectedId === poi.id ? 'map-pin--active' : ''
                  }`}
                  style={{ left: `${poi.x}%`, top: `${poi.y}%`, '--pin-color': meta.color }}
                  onClick={(e) => {
                    // Don't let the click fall through to the pin-drop handler.
                    e.stopPropagation()
                    setSelectedId(poi.id)
                  }}
                  aria-label={`${meta.label}: ${poi.name}${saved ? ' (saved to plan)' : ''}`}
                >
                  <span className="map-pin__icon">{meta.icon}</span>
                  <span className="map-pin__name">
                    {saved && '★ '}
                    {poi.name}
                  </span>
                </button>
              )
            })}

            {plan.pins.map((pin) => (
              <button
                key={pin.id}
                type="button"
                className="map-pin map-pin--saved map-pin--custom"
                style={{ left: `${pin.x}%`, top: `${pin.y}%`, '--pin-color': POI_TYPES.custom.color }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedId(null)
                }}
                aria-label={`Your pin: ${pin.label}`}
              >
                <span className="map-pin__icon">📌</span>
                <span className="map-pin__name">{pin.label}</span>
              </button>
            ))}
          </div>

          <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
            {Object.entries(POI_TYPES).map(([key, meta]) => (
              <span key={key}>
                <span aria-hidden="true">{meta.icon}</span> {meta.label}
              </span>
            ))}
          </div>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-semibold">
              {selected ? selected.name : 'Points of interest'}
            </Card.Header>
            <Card.Body>
              {selected ? (
                <>
                  <Badge bg="secondary" className="mb-2">
                    {POI_TYPES[selected.type].icon} {POI_TYPES[selected.type].label}
                  </Badge>
                  <p className="mb-3">{selected.note}</p>
                  <Button
                    variant={savedPois.has(selected.id) ? 'outline-danger' : 'success'}
                    size="sm"
                    onClick={() => onTogglePoi(selected.id)}
                  >
                    {savedPois.has(selected.id) ? 'Remove from my plan' : '★ Save to my plan'}
                  </Button>
                </>
              ) : (
                <p className="text-muted mb-0">
                  Click any pin on the map to read about it and save it to your plan.
                </p>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="fw-semibold">
              Saved from this map{' '}
              <Badge bg="light" text="dark">
                {plan.pois.length + plan.pins.length}
              </Badge>
            </Card.Header>
            {plan.pois.length + plan.pins.length === 0 ? (
              <Card.Body className="text-muted small">
                Nothing saved yet. Stages, food, and your own pins all end up here.
              </Card.Body>
            ) : (
              <ListGroup variant="flush">
                {festival.pois
                  .filter((p) => savedPois.has(p.id))
                  .map((poi) => (
                    <ListGroup.Item
                      key={poi.id}
                      className="d-flex justify-content-between align-items-center gap-2"
                    >
                      <button
                        type="button"
                        className="btn btn-link p-0 text-start text-decoration-none"
                        onClick={() => setSelectedId(poi.id)}
                      >
                        {POI_TYPES[poi.type].icon} {poi.name}
                      </button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => onTogglePoi(poi.id)}
                        aria-label={`Remove ${poi.name}`}
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
                    <span>
                      📌 {pin.label}{' '}
                      <span className="text-muted small">
                        ({pin.x}%, {pin.y}%)
                      </span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => onRemovePin(pin.id)}
                      aria-label={`Remove ${pin.label}`}
                    >
                      ×
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>
      </Row>

      {/* Naming a dropped pin. Bootstrap's modal keeps focus trapped for us. */}
      <Modal show={Boolean(draftPin)} onHide={() => setDraftPin(null)} centered>
        <Form onSubmit={confirmPin}>
          <Modal.Header closeButton>
            <Modal.Title className="h5">Name your pin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="light" className="small mb-3">
              Dropped at {draftPin?.x}% across, {draftPin?.y}% down the grounds.
            </Alert>
            <Form.Group controlId="pinLabel">
              <Form.Label>What is here?</Form.Label>
              <Form.Control
                autoFocus
                value={pinLabel}
                onChange={(e) => setPinLabel(e.target.value)}
                placeholder="Meet by the big oak"
                maxLength={40}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setDraftPin(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save pin
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default GroundsMap
