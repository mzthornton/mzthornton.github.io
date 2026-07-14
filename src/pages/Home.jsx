import { Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    title: '🎪 Plan the Lineup',
    text: 'Imagine sketching out stages, set times, and headliners — all from your browser.',
  },
  {
    title: '🎟️ Track Tickets',
    text: 'A place to picture ticket tiers, capacity, and who is coming to the show.',
  },
  {
    title: '📍 Map the Grounds',
    text: 'Envision food stalls, camping zones, and stages laid out across the festival site.',
  },
]

function Home() {
  // useNavigate lets us navigate programmatically (e.g. from a button click).
  const navigate = useNavigate()

  return (
    <>
      <div className="text-center mb-5">
        <Badge bg="secondary" className="mb-2">
          Client-side only &middot; GitHub Pages
        </Badge>
        <h1 className="display-5 fw-bold">Music Festival Planner</h1>
        <p className="lead text-muted">
          Your all-in-one spot to dream up the perfect festival — lineups,
          tickets, and grounds, all in one place.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
          Get in touch
        </Button>
      </div>

      <Row xs={1} md={3} className="g-4">
        {features.map((f) => (
          <Col key={f.title}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{f.title}</Card.Title>
                <Card.Text>{f.text}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default Home
