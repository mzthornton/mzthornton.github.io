import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'

function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="display-1 fw-bold">404</h1>
      <p className="lead">Looks like this stage is empty — that page isn&rsquo;t on the lineup.</p>
      {/* <Link> renders an <a> but navigates client-side, no page reload. */}
      <Button as={Link} to="/" variant="outline-primary">
        Back to Home
      </Button>
    </div>
  )
}

export default NotFound
