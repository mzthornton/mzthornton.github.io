import { Routes, Route, Navigate } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import NavBar from './components/NavBar.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Landing from './pages/Landing.jsx'
import Festivals from './pages/Festivals.jsx'
import MyPlans from './pages/MyPlans.jsx'
import FestivalDetail from './pages/FestivalDetail.jsx'
import FestivalAbout from './pages/festival/FestivalAbout.jsx'
import FestivalMap from './pages/festival/FestivalMap.jsx'
import FestivalSchedule from './pages/festival/FestivalSchedule.jsx'
import FestivalPlan from './pages/festival/FestivalPlan.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <>
      <NavBar />

      <Container as="main" className="py-4">
        {/*
          Declarative routing: <Routes> renders the first <Route> whose `path`
          matches the current URL. The "*" route is the catch-all 404.

          Screens behind <RequireAuth> redirect to the landing page when nobody
          is logged in, and remember where the visitor was headed.
        */}
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/festivals"
            element={
              <RequireAuth>
                <Festivals />
              </RequireAuth>
            }
          />

          <Route
            path="/my-plans"
            element={
              <RequireAuth>
                <MyPlans />
              </RequireAuth>
            }
          />

          {/*
            Nested routes: <FestivalDetail> renders the festival header plus the
            four-tab nav, and whichever child matches renders into its <Outlet>.
            Visiting /festivals/:id with no tab lands on About.
          */}
          <Route
            path="/festivals/:festivalId"
            element={
              <RequireAuth>
                <FestivalDetail />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="about" replace />} />
            <Route path="about" element={<FestivalAbout />} />
            <Route path="map" element={<FestivalMap />} />
            <Route path="schedule" element={<FestivalSchedule />} />
            <Route path="plan" element={<FestivalPlan />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>

      <footer className="text-center text-muted py-4 border-top">
        <small>🎵 Music Festival Planner</small>
      </footer>
    </>
  )
}

export default App
