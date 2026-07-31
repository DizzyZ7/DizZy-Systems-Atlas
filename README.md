# DizZy Systems Atlas

Bilingual interactive engineering atlas for systems by Dimash Janibekov (`DizzyZ7`).

**RU / EN · static GitHub Pages · no framework runtime**

Atlas is not a second resume and not a wall of technology badges. It is a technical navigation layer across backend platforms, automation, AI/RAG, security, data/CV, mobile and digital experiences. Each indexed system exposes the engineering problem, architecture flow, stack and concrete engineering signals.

## What changed

- Russian and English interface with persisted language choice
- Russian and English project descriptions inside cards, search and detail drawer
- Evidence-first information architecture instead of visual-effects-first presentation
- Sentinel promoted into flagship systems alongside StormRelay and SignalBox
- Search works across both RU and EN project vocabulary
- Interactive Canvas topology retained as the signature Atlas feature
- List view is the default on small screens to avoid unnecessary Canvas work
- No loader, scanline/noise layer, custom cursor or magnetic-pointer runtime
- Lightweight system-font visual stack with no external font requests
- Responsive cards, graph, project drawer and capability matrix
- `prefers-reduced-motion` support
- Light/dark adaptation through `prefers-color-scheme`
- SEO metadata, canonical URL, Open Graph and JSON-LD CollectionPage
- Safe external links with `noopener noreferrer`

## Structure

- `index.html` — semantic public shell and SEO metadata
- `styles.css` — responsive editorial engineering UI
- `scripts/projects.js` — core project index
- `scripts/i18n.js` — RU/EN interface and project-localization layer
- `scripts/latest-projects.js` — latest high-signal additions that should be promoted without rewriting the historical index
- `scripts/app.js` — localization, filtering, graph, drawer and interaction logic
- `assets/favicon.svg` — project icon
- `docs/ADDING_PROJECTS.md` — project update notes

## Local run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## UX model

The Atlas supports two reading paths:

1. **Recruiter / manager** — hero → flagship systems → engineering coverage → main portfolio.
2. **Engineer** — search/filter → graph/list → project drawer → repository or live demo.

The graph communicates breadth; the cards and drawer provide evidence. Mobile prioritizes the evidence path and makes the graph optional.

## Updating projects

Core historical entries live in `scripts/projects.js`. New high-signal projects can be added to `scripts/latest-projects.js`, while localized copy belongs in `scripts/i18n.js` or alongside the latest-project append logic.

Every public claim should be traceable to repository evidence. Do not invent usage, traffic, uptime, revenue, user count or production scale.

## Deployment

The site is static and GitHub Pages compatible. The canonical public path is:

`https://dizzyz7.github.io/DizZy-Systems-Atlas/`

No server runtime, build step or external JavaScript dependency is required.