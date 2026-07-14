import { Navbar, Nav, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

/**
 * Top navigation bar.
 *
 * React Bootstrap's <Nav.Link> renders as an <a> by default. We swap in
 * React Router's <NavLink> via the `as` prop so navigation happens
 * client-side (no full page reload) AND we get the automatic "active" class
 * on whichever link matches the current route.
 */
function NavBar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          🎵 Festival Planner
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto">
            {/* `end` makes "/" active only on an exact match, not for every route. */}
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about">
              About
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact">
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
