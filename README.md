# Music Festival Planner (CS 571 Web Project)

A **client-side-only** React single-page application (SPA) built to be hosted on
**GitHub Pages**. It's themed as a "Music Festival Planner," but it's a **dummy
demo** — the festival theming is just copy and styling; there are no real
planning features. There is no server / backend and no Next.js — everything runs
in the browser.

## Tech stack

| Concern            | Choice                          | Why                                                             |
| ------------------ | ------------------------------- | --------------------------------------------------------------- |
| UI library         | **React 18** (JavaScript / JSX) | Component-based UI. No TypeScript.                              |
| Build tool         | **Vite**                        | Fast dev server; outputs plain static HTML/CSS/JS.             |
| Styling / UI kit   | **React Bootstrap + Bootstrap 5** | Bootstrap components as React components (no jQuery).         |
| Routing            | **React Router v6 (declarative)** | `<Routes>` / `<Route>` client-side routing.                  |
| Hosting            | **GitHub Pages** (`/docs` folder) | Free static hosting straight from the repo.                   |

Everything the site needs is compiled to static files, which is exactly what
GitHub Pages serves.

## Project structure

```
.
├── index.html              # Vite entry HTML (loads src/main.jsx)
├── vite.config.js          # Vite config (builds to /docs, relative base path)
├── package.json            # Dependencies + scripts
├── public/
│   └── .nojekyll           # Tells GitHub Pages not to run Jekyll on the output
├── docs/                   # Build output (committed & served by GitHub Pages)
└── src/
    ├── main.jsx            # App entry: mounts React, wraps app in <HashRouter>
    ├── App.jsx             # Route table + page layout (NavBar / footer)
    ├── index.css           # Project styles (on top of Bootstrap)
    ├── components/
    │   └── NavBar.jsx      # Top nav bar (React Bootstrap Navbar + React Router links)
    └── pages/
        ├── Home.jsx        # Landing page (Cards, Button, programmatic nav)
        ├── About.jsx       # Static info page (ListGroup, Alert)
        ├── Contact.jsx     # Controlled React Bootstrap form
        └── NotFound.jsx    # Catch-all 404 page
```

## Prerequisites

- **Node.js 18+** and **npm** (developed with Node 24 / npm 11).

## Getting started

Install dependencies (needs network access to the npm registry):

```bash
npm install
```

Run the local dev server (hot-reloads on save):

```bash
npm run dev
```

Vite prints a local URL (default <http://localhost:5173>). Open it in a browser.

> **Note on the registry:** this machine's npm is pointed at Epic's internal
> mirror (`artifactory.epic.com`), which only resolves on Epic's network/VPN. If
> `npm install` fails with `ENOTFOUND artifactory.epic.com`, connect to the VPN,
> or temporarily point npm at the public registry:
> `npm install --registry=https://registry.npmjs.org`.

## Building for production

```bash
npm run build
```

This compiles the app into the **`docs/`** folder (configured in
`vite.config.js` via `build.outDir`). To preview the production build locally:

```bash
npm run preview
```

## Deploying to GitHub Pages (manual)

This project is set up so **you build locally and push the `docs/` folder** —
no CI/CD, no GitHub Actions.

1. Build the site:

   ```bash
   npm run build
   ```

2. Commit and push (the `docs/` folder is intentionally **not** git-ignored):

   ```bash
   git add docs
   git commit -m "Build site"
   git push
   ```

3. In your GitHub repo, go to **Settings → Pages** and set:
   - **Source:** *Deploy from a branch*
   - **Branch:** `main` and folder **`/docs`**

4. GitHub publishes the site at
   `https://<your-username>.github.io/<your-repo-name>/`.

Repeat steps 1–2 whenever you want to update the live site.

## How the key pieces fit together

### Routing (client-side, GitHub-Pages-safe)

- `src/main.jsx` wraps the app in **`<HashRouter>`**. Routes look like
  `/#/about`. GitHub Pages is a static host with no server-side routing, so a
  plain `BrowserRouter` would return a 404 when you refresh a deep link.
  HashRouter avoids that because everything after the `#` never hits the server.
- `src/App.jsx` declares the routes with `<Routes>` / `<Route>` (React Router's
  **declarative** mode). The `path="*"` route is the 404 catch-all.
- Navigation uses React Router's `<NavLink>` / `<Link>` (client-side, no page
  reload) and `useNavigate()` for programmatic navigation (see the button on
  the Home page).

### Relative asset paths

`vite.config.js` sets `base: './'` so all built asset URLs are relative. This
lets the site work under a project subpath like
`https://<user>.github.io/<repo>/` without hardcoding the repo name.

### Bootstrap styling

`src/main.jsx` imports `bootstrap/dist/css/bootstrap.min.css` once, before the
project's own `index.css`. React Bootstrap components (`Navbar`, `Card`,
`Form`, `Button`, `Alert`, …) render the corresponding Bootstrap markup and pick
up that stylesheet.

## Available scripts

| Script            | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload.        |
| `npm run build`   | Build the production site into `docs/`.           |
| `npm run preview` | Serve the built `docs/` locally to verify it.     |

## Constraints (by design)

- **Client-side only** — no backend, no API server, no database.
- **No Next.js** — plain React + Vite.
- **Pure React + JavaScript** — no TypeScript.
