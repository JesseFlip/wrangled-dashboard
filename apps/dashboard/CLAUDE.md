# apps/dashboard — Command Center UI

## Purpose
Vite/React dashboard showing the PyTexas WrangLED build log, hardware tracking, architecture, boot order, team. Deployed standalone to GitHub Pages (public log) and also served as static assets by `apps/api/` in the live control context.

## Run locally

    cd apps/dashboard
    npm install
    npm run dev   # Vite on http://localhost:8510 (see vite.config.js when updated)

## Build

    npm run build   # produces apps/dashboard/dist/

## Key files
- `src/App.jsx` — single-file React dashboard
- `vite.config.js` — Vite config (dev port + proxy to api at :8500 added in a later milestone)
- `index.html` — Vite entry

## Gotchas
- The GitHub Pages deploy in `.github/workflows/deploy.yml` cds into this directory. Keep the `package.json` build script named `build`.
