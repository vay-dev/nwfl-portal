# NWFL Dev Portal

A React-based internal development portal for the Nigeria Women Football League (NWFL) platform.

This app tracks the real state of three codebases:

- `the-nwfl` — public React frontend
- `nwfl-backend` — Django REST API
- `nwfl-admin` — React admin dashboard

## Purpose

Replace scattered notes and endless rebuilds with a living project spec.

- See what features exist, what is in progress, and what is planned.
- Track bugs with severity, status, and the feature they belong to.
- Document non-obvious system logic so future work does not rediscover old gotchas.
- Maintain an ordered execution plan based on actual dependencies.

## Data Source

All content is hand-maintained in:

- `src/data/nwflData.ts`

Edit this file directly to update feature status, add bugs, or add logic entries. There is no generator.

## Sections

- **Overview** — project meta, metrics, current priorities
- **Roadmap** — layered phase cards with progress and feature lists
- **Bug Log** — flattened issue cards with severity and status
- **Logic** — expandable technical walkthroughs of system behaviour
- **Execution Plan** — recent completed features + ordered dependency list

## Commands

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Lint
npm run lint

# Build for production
npm run build
```

## Deployment

The app is a static Vite build. It can be deployed to Vercel, Netlify, or any static host.

## Notes

- Built with React 19, TypeScript, Vite, Tailwind CSS v4, and Sass.
- Based on the dev-portal pattern from the Pendu project.
