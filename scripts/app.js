(() => {
  'use strict';

  const projects = window.ATLAS_PROJECTS || [];
  const sourceCategories = window.ATLAS_CATEGORIES || [];
  const i18n = window.ATLAS_I18N || { ui: {}, projects: {} };
  const q = (selector, context = document) => context.querySelector(selector);
  const qa = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let language = localStorage.getItem('atlas-language') || 'ru';
  if (!i18n.ui[language]) language = 'ru';
  let activeCategory = 'all';
  let searchTerm = '';
  let sortMode = 'featured';
  let activeView = 'graph';
  let filteredProjects = [...projects];
  let activeProjectId = null;

  const ui = () => i18n.ui[language] || i18n.ui.en || {};
  const categoryLabel = id => ui().categories?.[id] || sourceCategories.find(item => item.id === id)?.label || id;
  const translation = project => language === 'ru' ? (i18n.projects?.[project.id]?.ru || {}) : {};
  const localized = (project, field) => translation(project)[field] ?? project[field];
  const initials = title => title.split(/\s+/).map(part => part[0]).join('').replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase();
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  const meta = {
    ru: { title: 'DizZy Systems Atlas — инженерная карта систем', description: 'Интерактивный инженерный Atlas Димаша Джанибекова: backend, automation, AI/RAG, security, data, observability и digital experiences.' },
    en: { title: 'DizZy Systems Atlas — engineering systems map', description: 'Interactive engineering atlas by Dimash Janibekov: backend, automation, AI/RAG, security, data, observability and digital experiences.' }
  };

  function renderStaticArrays() {
    const tags = q('#principle-tags');
    const core = q('#core-lines');
    const speciality = q('#speciality-lines');
    if (tags) tags.innerHTML = (ui().principleTags || []).map(item => `<span>${esc(item)}</span>`).join('');
    if (core) core.innerHTML = (ui().coreLines || []).map(item => `<span>${esc(item)}</span>`).join('');
    if (speciality) speciality.innerHTML = (ui().specialityLines || []).map(item => `<span>${esc(item)}</span>`).join('');
    const rows = ui().coverageRows || [];
    const table = q('#coverage-table');
    if (table) table.innerHTML = `
      <div class="coverage-row coverage-row-head" role="row"><span>${esc(ui().layer)}</span><span>${esc(ui().typicalTools)}</span><span>${esc(ui().proof)}</span></div>
      ${rows.map(row => `<div class="coverage-row" role="row"><strong>${esc(row[0])}</strong><span data-mobile-label="${esc(ui().typicalTools)}">${esc(row[1])}</span><span data-mobile-label="${esc(ui().proof)}">${esc(row[2])}</span></div>`).join('')}`;
  }

  function projectSearchText(project) {
    const ru = i18n.projects?.[project.id]?.ru || {};
    return [project.title, project.domain, project.status, project.summary, project.problem, ...(project.architecture || []), ...(project.stack || []), ...(project.signals || []), ru.domain, ru.status, ru.summary, ru.problem, ...(ru.architecture || []), ...(ru.signals || [])].filter(Boolean).join(' ').toLowerCase();
  }

  function matchesProject(project) {
    const categoryMatch = activeCategory === 'all' || project.category === activeCategory;
    return categoryMatch && (!searchTerm || projectSearchText(project).includes(searchTerm));
  }

  function sortedProjects() {
    const list = [...filteredProjects];
    if (sortMode === 'alpha') list.sort((a,b) => a.title.localeCompare(b.title, language));
    if (sortMode === 'category') list.sort((a,b) => categoryLabel(a.category).localeCompare(categoryLabel(b.category), language) || a.title.localeCompare(b.title, language));
    if (sortMode === 'featured') list.sort((a,b) => Number(b.featured) - Number(a.featured) || projects.indexOf(a) - projects.indexOf(b));
    return list;
  }

  function renderCategories() {
    const strip = q('#category-strip');
    if (!strip) return;
    const ids = ['all', ...new Set(projects.map(item => item.category))];
    strip.innerHTML = ids.map(id => `<button class="category-button${id === activeCategory ? ' is-active' : ''}" type="button" data-category="${esc(id)}">${esc(categoryLabel(id))}</button>`).join('');
  }

  function renderAtlasList() {
    const list = q('#atlas-list');
    if (!list) return;
    list.innerHTML = filteredProjects.map(project => `
      <button class="atlas-list-item" type="button" data-id="${esc(project.id)}">
        <span class="atlas-list-mark">${esc(initials(project.title))}</span>
        <span><small>${esc(localized(project,'domain'))}</small><strong>${esc(project.title)}</strong></span><b>↗</b>
      </button>`).join('');
  }

  function renderProjectGrid() {
    const list = sortedProjects();
    const grid = q('#project-grid');
    if (!grid) return;
    grid.innerHTML = list.map(project => `
      <article class="project-card" tabindex="0" role="button" data-id="${esc(project.id)}" style="--card-accent:${esc(project.accent || '#8ed7c7')}">
        <div class="project-meta"><span>${esc(categoryLabel(project.category))}</span><b>${esc(localized(project,'status'))}</b></div>
        <h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p>
        <div class="project-bottom"><div class="project-stack">${(project.stack || []).slice(0,4).map(item => `<span>${esc(item)}</span>`).join('')}</div><span class="project-arrow">↗</span></div>
      </article>`).join('');
    const empty = q('#empty-state');
    if (empty) empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;
  }

  function renderFeatured() {
    const grid = q('#featured-grid');
    if (!grid) return;
    const list = projects.filter(item => item.featured).slice(0, 7);
    grid.innerHTML = list.map((project,index) => `
      <article class="feature-card" tabindex="0" role="button" data-id="${esc(project.id)}" style="--card-accent:${esc(project.accent || '#8ed7c7')}">
        <div class="feature-top"><span>${esc(ui().deepBuild)} / ${String(index + 1).padStart(2,'0')}</span><b>${esc(localized(project,'domain'))}</b></div>
        <h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p>
        <div class="feature-flow">${(localized(project,'architecture') || []).slice(0,6).map((item,i) => `${i ? '<i></i>' : ''}<span>${esc(item)}</span>`).join('')}</div>
      </article>`).join('');
  }

  function renderExperiences() {
    const grid = q('#experience-grid');
    if (!grid) return;
    const visual = projects.filter(item => item.category === 'visual');
    grid.innerHTML = visual.map(project => `
      <article class="experience-card" tabindex="0" role="button" data-id="${esc(project.id)}">
        <small>${esc(localized(project,'domain'))}</small><h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p><span>${esc(project.year)} ↗</span>
      </article>`).join('');
  }

  const drawer = q('.detail-drawer');
  const backdrop = q('.drawer-backdrop');

  function openProject(projectOrId, focusDrawer = true) {
    const project = typeof projectOrId === 'string' ? projects.find(item => item.id === projectOrId) : projectOrId;
    if (!project || !drawer || !backdrop) return;
    activeProjectId = project.id;
    q('.drawer-index').textContent = `SYS / ${String(projects.indexOf(project)+1).padStart(2,'0')}`;
    q('.drawer-status').textContent = localized(project,'status');
    q('.drawer-domain').textContent = localized(project,'domain');
    q('.drawer-title').textContent = project.title;
    q('.drawer-summary').textContent = localized(project,'summary');
    q('.drawer-problem').textContent = localized(project,'problem');
    q('#drawer-architecture').innerHTML = (localized(project,'architecture') || []).map(item => `<span>${esc(item)}</span>`).join('');
    q('#drawer-stack').innerHTML = (project.stack || []).map(item => `<span>${esc(item)}</span>`).join('');
    q('#drawer-signals').innerHTML = (localized(project,'signals') || []).map(item => `<li>${esc(item)}</li>`).join('');
    const repo = q('.drawer-link');
    const live = q('.drawer-live');
    const privateNote = q('.drawer-private');
    if (repo) { repo.hidden = Boolean(project.private || !project.repo); if (project.repo) repo.href = project.repo; }
    if (privateNote) privateNote.hidden = !project.private;
    if (live) { live.hidden = !project.live; if (project.live) live.href = project.live; }
    drawer.classList.add('is-open'); backdrop.classList.add('is-open'); drawer.setAttribute('aria-hidden','false'); document.body.classList.add('drawer-open');
    if (focusDrawer) q('.drawer-close')?.focus({preventScroll:true});
  }

  function closeDrawer() {
    activeProjectId = null;
    drawer?.classList.remove('is-open'); backdrop?.classList.remove('is-open'); drawer?.setAttribute('aria-hidden','true'); document.body.classList.remove('drawer-open');
  }

  function createGraph() {
    const canvas = q('#atlas-canvas');
    if (!canvas) return { resize(){}, setProjects(){}, reset(){} };
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, dpr = 1;
    let nodes = [], hovered = null;
    let scale = 1, offsetX = 0, offsetY = 0;
    let dragging = false, moved = false, startX = 0, startY = 0, baseOffsetX = 0, baseOffsetY = 0;
    let pointerId = null;

    const getCss = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    function build(list) {
      const categoryIds = [...new Set(projects.map(p => p.category))];
      const groups = new Map();
      list.forEach(p => { if (!groups.has(p.category)) groups.set(p.category, []); groups.get(p.category).push(p); });
      const minSide = Math.min(width, height);
      nodes = list.map((project,index) => {
        const group = groups.get(project.category) || [project];
        const gi = group.indexOf(project);
        const ci = Math.max(0, categoryIds.indexOf(project.category));
        const base = (Math.PI * 2 * ci / Math.max(1, categoryIds.length)) - Math.PI/2;
        const spread = (gi - (group.length - 1)/2) * (group.length > 5 ? .13 : .19);
        const ring = 0.27 + (gi % 3) * .085;
        const radius = minSide * ring;
        const jitter = ((index * 37) % 17 - 8) * 2;
        return {
          project,
          x: Math.cos(base + spread) * radius + jitter,
          y: Math.sin(base + spread) * radius - jitter,
          r: project.featured ? 9 : 6,
          categoryIndex: ci
        };
      });
    }

    function screen(node) {
      return { x: width/2 + offsetX + node.x * scale, y: height/2 + offsetY + node.y * scale, r: node.r * Math.max(.85, Math.min(scale,1.5)) };
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width; height = rect.height; dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      build(filteredProjects); draw();
    }

    function connect(a,b,alpha=.18) {
      const A = screen(a), B = screen(b);
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y);
      ctx.strokeStyle = `rgba(142,215,199,${alpha})`; ctx.lineWidth = 1; ctx.stroke();
    }

    function drawLabel(node, p, isHover) {
      const featured = node.project.featured;
      if (!featured && !isHover && width < 700) return;
      if (!featured && !isHover) return;
      const title = node.project.title;
      ctx.font = `${featured ? 700 : 650} ${width < 520 ? 10 : 11}px ${getCss('--mono') || 'monospace'}`;
      const tw = ctx.measureText(title).width;
      const padX = 7, boxH = 23;
      let bx = p.x + 13, by = p.y - 27;
      if (bx + tw + padX*2 > width - 8) bx = p.x - tw - padX*2 - 13;
      if (by < 8) by = p.y + 12;
      ctx.fillStyle = 'rgba(11,17,18,.94)'; ctx.strokeStyle = 'rgba(142,215,199,.28)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bx,by,tw+padX*2,boxH,6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = isHover ? '#ffffff' : '#cbd8d4'; ctx.fillText(title,bx+padX,by+15.5);
    }

    function draw() {
      ctx.clearRect(0,0,width,height);
      ctx.save();
      const cx = width/2 + offsetX, cy = height/2 + offsetY;
      [0.18,0.31,0.43].forEach((factor,i) => { ctx.beginPath(); ctx.arc(cx,cy,Math.min(width,height)*factor*scale,0,Math.PI*2); ctx.strokeStyle=`rgba(142,215,199,${.075-i*.012})`; ctx.lineWidth=1; ctx.stroke(); });
      const grouped = new Map(); nodes.forEach(n => { if (!grouped.has(n.project.category)) grouped.set(n.project.category,[]); grouped.get(n.project.category).push(n); });
      grouped.forEach(group => { for (let i=1;i<group.length;i++) connect(group[i-1],group[i],.19); });
      const featured = nodes.filter(n => n.project.featured); for (let i=1;i<featured.length;i++) connect(featured[i-1],featured[i],.13);
      nodes.forEach(node => {
        const p = screen(node), isHover = node === hovered;
        if (node.project.featured || isHover) { ctx.beginPath(); ctx.arc(p.x,p.y,p.r + (isHover?10:7),0,Math.PI*2); ctx.fillStyle = isHover ? 'rgba(255,255,255,.08)' : 'rgba(142,215,199,.05)'; ctx.fill(); ctx.strokeStyle='rgba(142,215,199,.32)'; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r + (isHover?2:0),0,Math.PI*2); ctx.fillStyle=node.project.accent || '#8ed7c7'; ctx.fill();
        drawLabel(node,p,isHover);
      });
      ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fillStyle='#f3f7f5'; ctx.fill();
      ctx.restore();
    }

    function hit(x,y) {
      let best = null, bestDistance = Infinity;
      for (const node of nodes) {
        const p = screen(node); const d = Math.hypot(p.x-x,p.y-y); const zone = node.project.featured ? 27 : 23;
        if (d <= zone && d < bestDistance) { best = node; bestDistance = d; }
      }
      return best;
    }

    function pointFromEvent(e) { const r = canvas.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; }

    canvas.addEventListener('pointerdown', e => {
      const p = pointFromEvent(e); pointerId = e.pointerId; dragging = true; moved = false; startX = p.x; startY = p.y; baseOffsetX = offsetX; baseOffsetY = offsetY;
      canvas.setPointerCapture?.(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      const p = pointFromEvent(e);
      if (dragging && e.pointerId === pointerId) {
        const dx = p.x-startX, dy = p.y-startY;
        if (Math.hypot(dx,dy) > 5) moved = true;
        if (moved) { offsetX = baseOffsetX + dx; offsetY = baseOffsetY + dy; hovered = null; canvas.style.cursor='grabbing'; draw(); return; }
      }
      hovered = hit(p.x,p.y); canvas.style.cursor = hovered ? 'pointer' : 'grab'; draw();
    });
    canvas.addEventListener('pointerup', e => {
      const p = pointFromEvent(e); const target = hit(p.x,p.y);
      if (!moved && target) openProject(target.project);
      dragging=false; moved=false; pointerId=null; canvas.style.cursor = target ? 'pointer' : 'grab';
      canvas.releasePointerCapture?.(e.pointerId); draw();
    });
    canvas.addEventListener('pointercancel', () => { dragging=false; moved=false; pointerId=null; canvas.style.cursor='grab'; });
    canvas.addEventListener('pointerleave', () => { if (!dragging) { hovered=null; canvas.style.cursor='grab'; draw(); } });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const p = pointFromEvent(e); const old = scale; const next = Math.max(.65,Math.min(1.8,scale * (e.deltaY < 0 ? 1.1 : .9)));
      const worldX = (p.x-width/2-offsetX)/old, worldY=(p.y-height/2-offsetY)/old;
      scale=next; offsetX=p.x-width/2-worldX*scale; offsetY=p.y-height/2-worldY*scale; draw();
    }, {passive:false});
    canvas.addEventListener('dblclick', e => { const p=pointFromEvent(e); const target=hit(p.x,p.y); if(target) openProject(target.project); else reset(); });
    canvas.style.cursor='grab';
    addEventListener('resize', () => requestAnimationFrame(resize), {passive:true});

    function reset(){ scale=1;offsetX=0;offsetY=0;hovered=null;build(filteredProjects);draw(); }
    return { resize, reset, setProjects(list){ filteredProjects=list; build(list); hovered=null; draw(); } };
  }

  const graph = createGraph();

  function applyFilters() {
    filteredProjects = projects.filter(matchesProject);
    const filterLabel = q('#active-filter-label'); if (filterLabel) filterLabel.textContent = activeCategory === 'all' ? ui().allSystems : categoryLabel(activeCategory).toUpperCase();
    const visible = q('#visible-count'); if (visible) visible.textContent = filteredProjects.length;
    renderAtlasList(); renderProjectGrid(); graph.setProjects(filteredProjects);
  }

  function setView(view) {
    activeView = view === 'list' ? 'list' : 'graph';
    qa('.view-button').forEach(button => button.classList.toggle('is-active', button.dataset.view === activeView));
    const stage = q('.atlas-stage'), list = q('#atlas-list');
    if (stage) stage.hidden = activeView !== 'graph';
    if (list) list.hidden = activeView !== 'list';
    if (activeView === 'graph') requestAnimationFrame(() => graph.resize());
  }

  function setLanguage(nextLanguage, persist = true) {
    language = i18n.ui[nextLanguage] ? nextLanguage : 'ru';
    if (persist) localStorage.setItem('atlas-language', language);
    document.documentElement.lang = language;
    document.title = meta[language].title;
    q('meta[name="description"]')?.setAttribute('content', meta[language].description);
    q('meta[property="og:title"]')?.setAttribute('content', meta[language].title);
    q('meta[property="og:description"]')?.setAttribute('content', meta[language].description);
    qa('[data-lang]').forEach(button => { const active = button.dataset.lang === language; button.classList.toggle('is-active',active); button.setAttribute('aria-pressed',String(active)); });
    qa('[data-ui]').forEach(element => { const value=ui()[element.dataset.ui]; if(typeof value==='string') element.textContent=value; });
    const search=q('#project-search'); if(search) search.placeholder=ui().searchPlaceholder||'';
    renderStaticArrays(); renderCategories(); applyFilters(); renderFeatured(); renderExperiences(); if(activeProjectId) openProject(activeProjectId,false);
  }

  function drawHeroMap() {
    const canvas=q('#hero-canvas'); if(!canvas) return; const ctx=canvas.getContext('2d');
    function draw(){
      const rect=canvas.parentElement.getBoundingClientRect(), w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2); canvas.width=Math.max(1,w*dpr); canvas.height=Math.max(1,h*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      const c={x:w/2,y:h/2}; const pts=[[.16,.25],[.78,.29],[.21,.78],[.8,.76],[.34,.13],[.64,.88],[.1,.54],[.9,.48]].map(([x,y])=>({x:w*x,y:h*y}));
      ctx.lineWidth=1; pts.forEach((p,i)=>{ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle='rgba(142,215,199,.14)';ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,i<4?4:3,0,Math.PI*2);ctx.fillStyle=i<4?'#8ed7c7':'#3e756c';ctx.fill()});
      [0.19,0.31].forEach(r=>{ctx.beginPath();ctx.arc(c.x,c.y,Math.min(w,h)*r,0,Math.PI*2);ctx.strokeStyle='rgba(142,215,199,.09)';ctx.stroke()});
    }
    draw(); addEventListener('resize',()=>requestAnimationFrame(draw),{passive:true});
  }

  function setMenu(open){ const menu=q('.mobile-menu'),button=q('.menu-toggle'); if(!menu||!button)return; menu.classList.toggle('is-open',open);menu.setAttribute('aria-hidden',String(!open));button.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open); }

  function bindEvents() {
    qa('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
    q('#category-strip')?.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;renderCategories();applyFilters()});
    const search=q('#project-search'); search?.addEventListener('input',event=>{searchTerm=event.target.value.trim().toLowerCase();applyFilters()});
    qa('.view-button').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    qa('.sort-button').forEach(button=>button.addEventListener('click',()=>{sortMode=button.dataset.sort;qa('.sort-button').forEach(item=>item.classList.toggle('is-active',item===button));renderProjectGrid()}));
    q('#clear-filters')?.addEventListener('click',()=>{activeCategory='all';searchTerm='';if(search)search.value='';renderCategories();applyFilters()});
    q('.atlas-reset')?.addEventListener('click',()=>graph.reset());
    document.addEventListener('click',event=>{const target=event.target.closest('[data-id]');if(target&&target.matches('.project-card,.feature-card,.experience-card,.atlas-list-item'))openProject(target.dataset.id)});
    document.addEventListener('keydown',event=>{const target=event.target.closest?.('[data-id]');if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openProject(target.dataset.id)}if(event.key==='/'&&search&&document.activeElement!==search){event.preventDefault();search.focus()}if(event.key==='Escape'){if(drawer?.classList.contains('is-open'))closeDrawer();else setMenu(false)}});
    q('.drawer-close')?.addEventListener('click',closeDrawer); backdrop?.addEventListener('click',closeDrawer);
    const menuButton=q('.menu-toggle'); menuButton?.addEventListener('click',()=>setMenu(!q('.mobile-menu')?.classList.contains('is-open'))); qa('.mobile-menu a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  }

  const count=q('#stat-projects'); if(count) count.textContent=projects.length;
  const domains=q('#stat-domains'); if(domains) domains.textContent=new Set(projects.filter(p=>p.category!=='visual').map(p=>p.category)).size;
  const featured=q('#stat-featured'); if(featured) featured.textContent=projects.filter(p=>p.featured).length;
  bindEvents(); drawHeroMap(); setLanguage(language,false); setView('graph');
})();
