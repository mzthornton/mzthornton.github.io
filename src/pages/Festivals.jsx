import { useMemo, useState } from 'react'
import { Row, Col, Alert, Badge } from 'react-bootstrap'
import FESTIVALS from '../data/festivals.js'
import FestivalCard from '../components/FestivalCard.jsx'
import FestivalFilters from '../components/FestivalFilters.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { usePlans } from '../context/PlanContext.jsx'
import { countdownLabel, filterFestivals, formatDateRange, matchingArtists } from '../lib/festivalUtils.js'

const NO_FILTERS = { from: '', to: '', artist: '' }

/**
 * Main screen after login: upcoming festivals, nearest date first, with the two
 * filters (date window + artist search) sitting above the list.
 *
 * Filter state lives here and the derived list is computed with useMemo, so
 * typing in the search box re-filters without re-sorting the world on every
 * keystroke.
 */
function Festivals() {
  const { user } = useAuth()
  const { planSize } = usePlans()
  const [filters, setFilters] = useState(NO_FILTERS)

  const visible = useMemo(() => filterFestivals(FESTIVALS, filters), [filters])
  const next = visible[0]

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-1">
        <h1 className="h3 mb-0">Upcoming festivals</h1>
      </div>

      <FestivalFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(NO_FILTERS)}
        resultCount={visible.length}
      />

      {visible.length === 0 ? (
        <Alert variant="warning">
          <Alert.Heading className="h6">No festivals match those filters</Alert.Heading>
          <p className="mb-0 small">
            Try widening the date window, or searching for a different artist
          </p>
        </Alert>
      ) : (
        <Row xs={1} md={2} xl={3} className="g-4">
          {visible.map((festival) => (
            <Col key={festival.id}>
              <FestivalCard
                festival={festival}
                matches={matchingArtists(festival, filters.artist)}
                savedCount={planSize(festival.id)}
              />
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}

export default Festivals
