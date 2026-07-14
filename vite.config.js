import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: './' makes all asset URLs relative. That way the built site works
  // no matter what subpath GitHub Pages serves it from
  // (e.g. https://<username>.github.io/<repo-name>/).
  base: './',
  build: {
    // `npm run build` writes the production site here. GitHub Pages can be
    // configured to serve directly from the /docs folder on the main branch,
    // so we commit this folder and push it.
    outDir: 'docs',
    emptyOutDir: true,
  },
})
