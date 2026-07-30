import { Alert } from 'react-bootstrap'
import GroundsMap from '../../components/GroundsMap.jsx'
import { useFestival } from '../FestivalDetail.jsx'

/** Map tab. All the interaction lives in <GroundsMap>; this is just framing. */
function FestivalMap() {
  const { festival, plan, togglePoi, addPin, removePin } = useFestival()

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2">
        <h2 className="h4 mb-0">Festival grounds</h2>
        <span className="text-muted small">
          {festival.pois.length} marked spots &middot; {plan.pins.length} of your own pins
        </span>
      </div>
      <Alert variant="light" className="border small mt-2">
        Tap a pin to read about it and save it to your plan, or use{' '}
        <strong>Drop my own pin</strong> to mark anywhere on the grounds — where you
        parked, where to meet, whichever food cart was worth it.
      </Alert>

      <GroundsMap
        festival={festival}
        plan={plan}
        onTogglePoi={togglePoi}
        onAddPin={addPin}
        onRemovePin={removePin}
      />
    </>
  )
}

export default FestivalMap
