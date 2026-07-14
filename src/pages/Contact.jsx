import { useState } from 'react'
import { Row, Col, Form, Button, Alert } from 'react-bootstrap'

const EMPTY_FORM = { name: '', email: '', message: '' }

function Contact() {
  // Controlled form: React state is the single source of truth for the inputs.
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    // No backend to POST to — this is a client-side demo, so we just show a
    // confirmation and reset the form.
    setSubmitted(true)
    setForm(EMPTY_FORM)
  }

  return (
    <Row className="justify-content-center">
      <Col md={7}>
        <h1 className="mb-3">Get in Touch</h1>
        <p className="text-muted">
          Questions about the festival? Drop us a note below.
        </p>

        {submitted && (
          <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
            Thanks! Your message was &ldquo;sent&rdquo; (client-side demo only).
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="contactName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ada Lovelace"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="contactEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ada@example.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="contactMessage">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your message..."
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary">
            Send
          </Button>
        </Form>
      </Col>
    </Row>
  )
}

export default Contact
