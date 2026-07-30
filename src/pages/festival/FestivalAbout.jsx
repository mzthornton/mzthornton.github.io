import { Row, Col, Card, ListGroup } from 'react-bootstrap'
import { useFestival } from '../FestivalDetail.jsx'
import { dateForDay, formatLongDate, formatDateRange } from '../../lib/festivalUtils.js'

/** About tab: the festival's write-up plus the at-a-glance facts. */
function FestivalAbout() {
  const { festival } = useFestival()

  return (
    <Row className="g-4">
      <Col lg={7}>
        <h2 className="h4">About {festival.name}</h2>
        {festival.about.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </Col>

      <Col lg={5}>
        <Card className="shadow-sm mb-3">
          <Card.Header className="fw-semibold">At a glance</Card.Header>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <span className="text-muted small d-block">Dates</span>
              {formatDateRange(festival.startDate, festival.endDate)}
            </ListGroup.Item>
            <ListGroup.Item>
              <span className="text-muted small d-block">Venue</span>
              {festival.venue}, {festival.location}
            </ListGroup.Item>
            <ListGroup.Item>
              <span className="text-muted small d-block">Stages</span>
              {festival.stages.join(' · ')}
            </ListGroup.Item>
            <ListGroup.Item>
              <span className="text-muted small d-block">Artists announced</span>
              {festival.lineup.length}
            </ListGroup.Item>
            <ListGroup.Item>
              <span className="text-muted small d-block">Capacity</span>
              {festival.capacity.toLocaleString()}
            </ListGroup.Item>
            <ListGroup.Item>
              <span className="text-muted small d-block">Tickets from</span>${festival.priceFrom}
            </ListGroup.Item>
          </ListGroup>
        </Card>

        <Card className="shadow-sm">
          <Card.Header className="fw-semibold">Running order</Card.Header>
          <ListGroup variant="flush">
            {Array.from({ length: festival.days }, (_, i) => {
              const day = i + 1
              const date = dateForDay(festival, day)
              const count = festival.lineup.filter((s) => s.day === day).length
              return (
                <ListGroup.Item key={day} className="d-flex justify-content-between">
                  <span>
                    <strong>Day {day}</strong>
                    <span className="text-muted small"> · {formatLongDate(date)}</span>
                  </span>
                  <span className="text-muted small">{count} sets</span>
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        </Card>
      </Col>
    </Row>
  )
}

export default FestivalAbout
