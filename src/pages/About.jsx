import { Row, Col, ListGroup, Alert } from 'react-bootstrap'

function About() {
  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <h1 className="mb-3">About the Festival Planner</h1>
        <p>
          Music Festival Planner is a dummy project scaffolded to demonstrate a
          client-side-only React application. It has no backend: everything runs
          in the browser, which is exactly what GitHub Pages can host. Picture a
          tool for organizing stages, lineups, and ticketing — this is the shell
          such an app could grow into.
        </p>

        <Alert variant="info">
          Try refreshing this page. Because the app uses a{' '}
          <strong>HashRouter</strong>, the route survives a reload even on a
          static host like GitHub Pages.
        </Alert>

        <h2 className="h5 mt-4">Tech stack</h2>
        <ListGroup>
          <ListGroup.Item>React 18 (JavaScript / JSX)</ListGroup.Item>
          <ListGroup.Item>Vite (build tool &amp; dev server)</ListGroup.Item>
          <ListGroup.Item>React Bootstrap + Bootstrap 5</ListGroup.Item>
          <ListGroup.Item>React Router v6 (declarative)</ListGroup.Item>
        </ListGroup>
      </Col>
    </Row>
  )
}

export default About
