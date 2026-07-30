import { Card, Badge, Button, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { countdownLabel, formatDateRange } from '../lib/festivalUtils.js'

/** Up to `limit` headliners, for the "featuring" line on the card. */
function topBilling(festival, limit = 4) {
  return festival.lineup.slice(0, limit).map((a) => a.name)
}

/**
 * One festival in the list. The whole card is a link to the festival's detail
 * screen; the button is there for keyboard and screen-reader clarity.
 *
 * `matches` is the list of lineup entries that matched the artist search, so a
 * search can show *why* this festival came back.
 */
function FestivalCard({ festival, matches = [], savedCount = 0 }) {
  return (
    <Card className="h-100 shadow-sm festival-card">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <Badge bg="dark" className="text-uppercase">
            {countdownLabel(festival.startDate)}
          </Badge>
          {savedCount > 0 && (
            <Badge bg="success" pill title="Items saved to your plan">
              ★ {savedCount} planned
            </Badge>
          )}
        </div>

        <Card.Title className="mb-1">
          <Link to={`/festivals/${festival.id}`} className="text-decoration-none">
            {festival.name}
          </Link>
        </Card.Title>

        <div className="text-muted small mb-2">
          📅 {formatDateRange(festival.startDate, festival.endDate)} &middot; {festival.days} day
          {festival.days === 1 ? '' : 's'}
          <br />
          📍 {festival.venue}, {festival.location}
        </div>

        <Card.Text className="mb-3">{festival.tagline}</Card.Text>

        {matches.length > 0 ? (
          <div className="mb-3">
            <div className="small fw-semibold text-success mb-1">
              Matching {matches.length === 1 ? 'artist' : 'artists'}:
            </div>
            <Stack direction="horizontal" gap={1} className="flex-wrap">
              {matches.map((m) => (
                <Badge key={`${m.name}-${m.day}-${m.start}`} bg="success" className="fw-normal">
                  {m.name}
                </Badge>
              ))}
            </Stack>
          </div>
        ) : (
          <div className="small text-muted mb-3">
            <span className="fw-semibold">Featuring:</span> {topBilling(festival).join(' · ')}
          </div>
        )}

        {/* mt-auto pins the footer to the bottom so cards in a row line up. */}
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="small text-muted">From ${festival.priceFrom}</span>
          <Button as={Link} to={`/festivals/${festival.id}`} size="sm" variant="primary">
            View festival
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default FestivalCard
