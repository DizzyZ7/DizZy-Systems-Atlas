import fs from 'node:fs';
import vm from 'node:vm';

const fail = (message) => {
  console.error(`\n[atlas-check] ${message}`);
  process.exitCode = 1;
};

const requiredFiles = [
  'index.html',
  'styles-v4.css',
  'scripts/app-v4.js',
  'scripts/projects.js',
  'scripts/i18n.js',
  'scripts/latest-projects.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
}

if (process.exitCode) process.exit(process.exitCode);

const index = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('scripts/app-v4.js', 'utf8');
const css = fs.readFileSync('styles-v4.css', 'utf8');
const i18nSource = fs.readFileSync('scripts/i18n.js', 'utf8');

const requiredMarkup = [
  'id="atlas-canvas"',
  'id="atlas-inspector"',
  'id="category-strip"',
  'data-lang="ru"',
  'data-lang="en"',
  'styles-v4.css',
  'scripts/app-v4.js'
];
for (const token of requiredMarkup) if (!index.includes(token)) fail(`index.html is missing ${token}`);

if (index.includes('color-scheme" content="light dark"')) fail('Automatic light/dark color-scheme reintroduced; Atlas is intentionally dark.');

const requiredInteractions = ['pointerdown', 'pointerup', "addEventListener('wheel'", 'relationsFor', 'data-map-action', "addEventListener('keydown'"];
for (const token of requiredInteractions) if (!app.includes(token)) fail(`Graph interaction missing: ${token}`);

if (!css.includes('@media(max-width:720px)')) fail('Mobile breakpoint is missing.');
if (!css.includes('.coverage-row>span::before')) fail('Mobile engineering coverage labels are missing.');
if (!css.includes('.atlas-inspector')) fail('Map inspector styles are missing.');

if (!i18nSource.includes('ru:') || !i18nSource.includes('en:')) fail('RU/EN localization blocks are missing.');

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ['scripts/projects.js', 'scripts/i18n.js', 'scripts/latest-projects.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const projects = sandbox.window.ATLAS_PROJECTS || [];
if (projects.length < 20) fail(`Unexpectedly small Atlas index: ${projects.length} projects.`);

const ids = new Set();
const titles = new Set();
for (const project of projects) {
  if (!project.id || !project.title || !project.category) fail(`Incomplete project entry: ${JSON.stringify(project)}`);
  if (ids.has(project.id)) fail(`Duplicate project id: ${project.id}`);
  if (titles.has(project.title)) fail(`Duplicate project title: ${project.title}`);
  ids.add(project.id);
  titles.add(project.title);
  if (!project.private && project.repo && !project.repo.startsWith('https://github.com/DizzyZ7/')) {
    fail(`Unexpected public repository URL for ${project.title}: ${project.repo}`);
  }
}

if (!ids.has('sentinel')) fail('Sentinel must remain indexed as a flagship security system.');
if (projects.filter(project => project.featured).length < 5) fail('Atlas should keep at least five flagship systems.');

const ui = sandbox.window.ATLAS_I18N?.ui || {};
for (const locale of ['ru', 'en']) {
  if (!ui[locale]) fail(`Missing UI locale: ${locale}`);
  for (const key of ['heroTitle', 'mapTitle', 'coverageTitle', 'drawerProblem']) {
    if (!ui[locale]?.[key]) fail(`Missing ${locale} UI key: ${key}`);
  }
}

if (!process.exitCode) {
  console.log(`[atlas-check] OK — ${projects.length} projects, ${projects.filter(p => p.featured).length} flagship systems, RU/EN UI, interactive graph contract present.`);
}
