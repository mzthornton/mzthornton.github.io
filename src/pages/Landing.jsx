import { useState } from 'react'
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const EMPTY = { name: '', email: '', password: '', confirm: '' }

/**
 * Landing page: the gate in front of the rest of the app.
 *
 * One screen, two modes (log in / sign up). The only way between them is the
 * line under the form — "New here? / Already have an account?" — which is how
 * people read a login card anyway, so tabs above it would just say the same
 * thing twice.
 *
 * On success we send them wherever they were originally headed — RequireAuth
 * stashes that in router state — or to the festival list.
 */
function Landing() {
  const { isLoggedIn, login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already signed in? Don't show the form again.
  const destination = location.state?.from ?? '/festivals'
  if (isLoggedIn) return <Navigate to={destination} replace />

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  function switchMode(next) {
    setMode(next)
    setForm(EMPTY)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (form.password.length < 8) {
        setError('Choose a password of at least 8 characters.')
        return
      }
      if (form.password !== form.confirm) {
        setError('Those passwords do not match.')
        return
      }
    }

    // Hashing is async, so guard against a double submit while it runs.
    setBusy(true)
    const result =
      mode === 'signup'
        ? await signup({ name: form.name, email: form.email, password: form.password })
        : await login({ email: form.email, password: form.password })
    setBusy(false)

    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(destination, { replace: true })
  }

  // align-items-start, not center: centred columns made the pitch on the left
  // slide up and down every time the form grew or shrank a field. Top-aligned, it
  // holds its position whichever mode the card is in.
  return (
    <Row className="justify-content-center align-items-start g-5">
      <Col lg={6}>
        <h1 className="display-5 fw-bold">Plan your festival, set by set.</h1>
        <p className="lead text-muted">
          Browse what is coming up, find the artists you actually
          care about, and build a personal plan for each festival!
        </p>

        <ul className="list-unstyled text-muted mb-0">
          <li className="mb-2">🗓️ Discover upcoming festivals!</li>
          <li className="mb-2">🗺️ Save stages, food, and your own pins on the grounds map!</li>
          <li className="mb-2">⭐ Plan where you need to be to catch your favorite artists!</li>
        </ul>
      </Col>

      <Col lg={5} xl={4}>
        <Card className="shadow">
          <Card.Body className="p-4">
            <h2 className="h4 mb-1">{mode === 'signup' ? 'Create your account' : 'Log in'}</h2>

            {error && (
              <Alert variant="danger" className="py-2 small">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <Form.Group className="mb-3" controlId="signupName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                    required
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="authEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ada@example.com"
                  autoComplete="email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="authPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                />
                {mode === 'signup' && (
                  <Form.Text className="text-muted">At least 8 characters.</Form.Text>
                )}
              </Form.Group>

              {mode === 'signup' && (
                <Form.Group className="mb-3" controlId="authConfirm">
                  <Form.Label>Confirm password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </Form.Group>
              )}

              <Button type="submit" variant="primary" className="w-100" disabled={busy}>
                {busy && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                {mode === 'signup' ? 'Create account & start planning' : 'Log in'}
              </Button>
            </Form>

            <div className="text-center mt-3 small text-muted">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <Button variant="link" size="sm" className="p-0" onClick={() => switchMode('login')}>
                    Log in
                  </Button>
                </>
              ) : (
                <>
                  New here?{' '}
                  <Button variant="link" size="sm" className="p-0" onClick={() => switchMode('signup')}>
                    Create an account
                  </Button>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default Landing
