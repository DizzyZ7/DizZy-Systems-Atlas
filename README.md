# DizZy Systems Atlas

Bilingual interactive engineering atlas for systems by Dimash Janibekov (`DizzyZ7`).

**RU / EN · static GitHub Pages · no framework runtime**

Atlas is not a second resume and not a technology badge wall. It is a technical navigation layer across backend platforms, automation, AI/RAG, security, data/CV, mobile products, quality engineering and digital experiences. Each indexed system exposes the problem, architecture flow, stack and concrete engineering signals.

## Atlas v4

The signature Canvas map is now a semantic engineering graph rather than a decorative node field.

- RU / EN interface with persisted language choice
- bilingual project descriptions, search and detail drawer
- Sentinel promoted into the flagship layer alongside StormRelay and SignalBox
- category-colored topology with an explicit legend
- relationships derived from shared stack and architecture-pattern metadata
- selecting a node highlights related systems and dims unrelated nodes
- inline project inspector before opening the full detail drawer
- touch hit zones, tap selection, drag-to-pan and mobile-first interaction
- wheel / +/- zoom and fit/reset controls
- keyboard navigation on the Canvas: arrows, Enter, +, -, 0
- search and category filters rebuild the graph and relation field
- graph and list modes share the same project data source
- evidence-first flagship cards and complete repository index
- engineering coverage section becomes stacked readable cards on narrow screens
- deliberate high-contrast dark palette instead of browser-controlled automatic dark mode
- `prefers-reduced-motion`, semantic controls, focus states and ARIA live feedback
- system fonts only; no external font or framework runtime
- SEO metadata, canonical URL, Open Graph and JSON-LD CollectionPage
- safe external links with `noopener noreferrer`

## Reading paths

Atlas supports two complementary paths.

1. **Recruiter / manager** — positioning → flagship systems → engineering coverage → main portfolio.
2. **Engineer / CTO** — search/filter → semantic graph → related systems → project architecture → source repository / live demo.

The main portfolio explains the candidate. Atlas exposes the engineering evidence behind that profile.

## Map relationship model

Graph edges are derived only from project metadata already stored in Atlas. The current relationship score considers:

- exact shared stack entries;
- recurring engineering patterns such as event-driven processing, security controls, observability, persistence, AI/decision systems, product interfaces and delivery/integration;
- category proximity as a weak secondary signal.

The graph does **not** invent runtime dependencies between repositories. An edge means the systems share engineering characteristics, not that one system calls another.

## Structure

- `index.html` — semantic public shell, map controls and SEO metadata
- `styles-v4.css` — current responsive high-contrast UI
- `scripts/projects.js` — core project index
- `scripts/i18n.js` — RU/EN interface and project-localization layer
- `scripts/latest-projects.js` — high-signal additions promoted without rewriting the historical index
- `scripts/app-v4.js` — localization, semantic graph, filtering, zoom/pan, inspector, drawer and keyboard/touch interaction
- `scripts/verify-site.mjs` — zero-dependency integrity check used before deployment
- `assets/favicon.svg` — project icon
- `docs/ADDING_PROJECTS.md` — project update notes

Older `styles.css` / `scripts/app.js` files are retained as historical implementation artifacts but are not loaded by the current public page.

## Local run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

Run the integrity check:

```bash
node scripts/verify-site.mjs
```

The check validates required files and public-shell contracts, RU/EN presence, graph interaction hooks, responsive coverage behavior, unique project IDs/titles, repository URL shape and the flagship index.

## Updating projects

Core entries live in `scripts/projects.js`. New high-signal systems can be appended through `scripts/latest-projects.js`; localized copy belongs in `scripts/i18n.js` or the corresponding safe append layer.

Every public claim should be traceable to repository evidence. Do not invent usage, traffic, uptime, revenue, user count, customer count or production scale.

## Deployment

The site is static and GitHub Pages compatible. The canonical public path is:

`https://dizzyz7.github.io/DizZy-Systems-Atlas/`

The Pages workflow runs `node scripts/verify-site.mjs` before uploading the static artifact. No server runtime, build step or external JavaScript dependency is required.
