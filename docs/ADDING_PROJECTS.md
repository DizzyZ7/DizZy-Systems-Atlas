# Adding projects

Open `scripts/projects.js` and add a new object to `window.ATLAS_PROJECTS`.

```js
{
  id: 'unique-slug',
  title: 'Project name',
  repo: 'https://github.com/DizzyZ7/repository',
  category: 'backend',
  domain: 'Short domain label',
  status: 'Production-oriented',
  year: '2026',
  featured: false,
  private: false,
  accent: '#7cf7c4',
  summary: 'One clear sentence describing the system.',
  problem: 'The operational or product problem being solved.',
  architecture: ['Input', 'Processing', 'State', 'Delivery'],
  stack: ['Python', 'FastAPI', 'PostgreSQL'],
  signals: ['Audit trail', 'Retries', 'Metrics', 'CI']
}
```

## Category IDs

- `platform`
- `backend`
- `ai`
- `product`
- `automation`
- `data`
- `mobile`
- `edge`
- `quality`
- `visual`

Set `private: true` when a case should remain visible in the atlas but its source repository is not public. The drawer will replace the repository button with a private-source notice.

Set `featured: true` for the strongest production-oriented systems. The first six featured entries appear in the Deep Builds section.
