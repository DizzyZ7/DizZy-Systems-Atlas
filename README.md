# DizZy Systems Atlas

Interactive engineering atlas for projects by Dimash Janibekov (`DizzyZ7`).

The site organizes backend platforms, automation tools, AI systems, product MVPs, mobile applications, edge/voice projects and digital experiences into one searchable topology.

## Features

- Interactive Canvas project graph
- Category filters and full-text search
- Graph and list display modes
- Featured deep-build section
- Complete sortable project index
- Project detail drawer with problem, architecture, stack and engineering signals
- Dedicated digital-experience collection
- Keyboard navigation: `/` focuses search, `Esc` closes overlays
- Touch-first responsive behavior
- `prefers-reduced-motion` support
- No framework or external runtime dependency
- GitHub Pages workflow

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

Windows users can also run:

```text
START_WINDOWS.bat
```

## Structure

- `index.html` — public interface
- `styles.css` — complete visual and responsive system
- `scripts/projects.js` — project data source
- `scripts/app.js` — graph, filters, search, drawer and motion
- `assets/favicon.svg` — project icon
- `docs/ADDING_PROJECTS.md` — how to update the atlas
- `ART_DIRECTION.md` — visual concept
- `CASE_STUDY_RU.md` — Russian case description
- `.github/workflows/pages.yml` — GitHub Pages deployment

## Updating the project index

Edit `scripts/projects.js`. Each project contains identity, category, domain, status, summary, problem statement, architecture stages, stack, engineering signals, accent color and visibility state.

See `docs/ADDING_PROJECTS.md` for the full schema.

## Deployment

Push to `main`. The included GitHub Actions workflow publishes the static site to GitHub Pages after Pages is enabled in repository settings with **Source: GitHub Actions**.
