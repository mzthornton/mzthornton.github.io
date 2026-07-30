import { Card, Row, Col, Form, Button, InputGroup } from 'react-bootstrap'

/**
 * The two filters over the festival list: a date window and an artist search.
 *
 * Controlled entirely by the parent — this component owns no state, it just
 * renders `filters` and reports edits through `onChange`. That keeps the
 * filtering logic (and the URL, later, if it ever moves there) in one place.
 */
function FestivalFilters({ filters, onChange, onReset, resultCount }) {
  const update = (patch) => onChange({ ...filters, ...patch })

  const isFiltered = Boolean(filters.from || filters.to || filters.artist)

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Group controlId="filterFrom">
              <Form.Label className="fw-semibold small text-uppercase text-muted">
                From date
              </Form.Label>
              <Form.Control
                type="date"
                value={filters.from}
                // A festival that ends before "from" or starts after "to" is
                // filtered out; leaving a bound empty means "unbounded".
                onChange={(e) => update({ from: e.target.value })}
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="filterTo">
              <Form.Label className="fw-semibold small text-uppercase text-muted">
                To date
              </Form.Label>
              <Form.Control
                type="date"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(e) => update({ to: e.target.value })}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="filterArtist">
              <Form.Label className="fw-semibold small text-uppercase text-muted">
                Search by artist
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="e.g. Wildwater"
                  value={filters.artist}
                  onChange={(e) => update({ artist: e.target.value })}
                />
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex flex-wrap justify-content-end align-items-center gap-3 mt-3">
          <span className="small text-muted">
            {resultCount} festival{resultCount === 1 ? '' : 's'} match
          </span>
          <Button size="sm" variant="link" onClick={onReset} disabled={!isFiltered}>
            Clear filters
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default FestivalFilters
