import { Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <>
      <NavBar />

      <Container as="main" className="py-4">
        {/*
          Declarative routing: <Routes> renders the first <Route> whose `path`
          matches the current URL. The "*" route is the catch-all 404.
        */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>

      <footer className="text-center text-muted py-4 border-top">
        <small>Music Festival Planner &middot; A CS 571 demo built with React, React Bootstrap &amp; React Router</small>
      </footer>
    </>
  )
}

export default App
