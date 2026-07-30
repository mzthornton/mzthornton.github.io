import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { PlanProvider } from './context/PlanContext.jsx'

// Bootstrap's compiled CSS must be imported once, before our own styles,
// for React Bootstrap components to look correct.
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      HashRouter puts the route after a "#" (e.g. /#/festivals). GitHub Pages is a
      static host with no server-side routing, so a plain BrowserRouter would
      404 on a page refresh or a deep link. HashRouter sidesteps that entirely
      because everything after the "#" never reaches the server.
    */}
    <HashRouter>
      {/*
        AuthProvider owns the sessionStorage-backed login state; PlanProvider
        sits inside it because a user's saved plans depend on who is logged in.
      */}
      <AuthProvider>
        <PlanProvider>
          <App />
        </PlanProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)
