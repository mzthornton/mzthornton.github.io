import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { usePlans } from '../context/PlanContext.jsx'

/**
 * App-wide navigation bar.
 *
 * React Bootstrap's <Nav.Link> renders as an <a> by default. We swap in
 * React Router's <NavLink> via the `as` prop so navigation happens
 * client-side (no full page reload) AND we get the automatic "active" class
 * on whichever link matches the current route.
 *
 * The nav stays sparse until you log in — there is nothing to navigate to from
 * the landing page.
 */
function NavBar() {
  const { user, isLoggedIn, logout } = useAuth()
  const { plannedFestivalIds } = usePlans()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to={isLoggedIn ? '/festivals' : '/'}>
          🎵 Festival Planner
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto align-items-lg-center">
            {isLoggedIn && (
              <>
                <Nav.Link as={NavLink} to="/festivals">
                  Festivals
                </Nav.Link>
                <Nav.Link as={NavLink} to="/my-plans">
                  My Plans
                  {plannedFestivalIds.length > 0 && (
                    <Badge bg="success" pill className="ms-2">
                      {plannedFestivalIds.length}
                    </Badge>
                  )}
                </Nav.Link>
              </>
            )}

            {isLoggedIn ? (
              <NavDropdown
                align="end"
                id="account-dropdown"
                title={
                  <span>
                    <Badge bg="primary" pill className="me-2">
                      {user.name.charAt(0).toUpperCase()}
                    </Badge>
                    {user.name}
                  </span>
                }
              >
                <NavDropdown.Header className="text-truncate">{user.email}</NavDropdown.Header>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Log out</NavDropdown.Item>
              </NavDropdown>
            ) : (
              /* `end` makes "/" active only on an exact match, not every route. */
              <Nav.Link as={NavLink} to="/" end>
                Log in
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
