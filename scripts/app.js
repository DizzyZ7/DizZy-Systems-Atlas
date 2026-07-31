(() => {
  'use strict';

  const projects = window.ATLAS_PROJECTS || [];
  const sourceCategories = window.ATLAS_CATEGORIES || [];
  const i18n = window.ATLAS_I18N || { ui: {}, projects: {} };
  const q = (selector, context = document) => context.querySelector(selector);
  const qa = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 720px)').matches;

  let language = localStorage.getItem('atlas-language') || 'ru';
  if (!i18n.ui[language]) language = 'ru';
  let activeCategory = 'all';
  let searchTerm = '';
  let sortMode = 'featured';
  let activeView = mobile ? 'list' : 'graph';
  let filteredProjects = [...projects];
  let activeProjectId = null;

  const ui = () => i18n.ui[language] || i18n.ui.en || {};
  const categoryLabel = id => ui().categories?.[id] || sourceCategories.find(item => item.id === id)?.label || id;
  const translation = project => language === 'ru' ? (i18n.projects?.[project.id]?.ru || {}) : {};
  const localized = (project, field) => translation(project)[field] ?? project[field];
  const initials = title => title.split(/\s+/).map(part => part[0]).join('').replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase();
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  const meta = {
    ru: {
      title: 'DizZy Systems Atlas — инженерная карта систем',
      description: 'Интерактивный инженерный Atlas Димаша Джанибекова: backend, automation, AI/RAG, security, data, observability и digital experiences.'
    },
    en: {
      title: 'DizZy Systems Atlas — engineering systems map',
      description: 'Interactive engineering atlas by Dimash Janibekov: backend, automation, AI/RAG, security, data, observability and digital experiences.'
    }
  };

  function setLanguage(nextLanguage, persist = true) {
    language = i18n.ui[nextLanguage] ? nextLanguage : 'ru';
    if (persist) localStorage.setItem('atlas-language', language);
    document.documentElement.lang = language;
    document.title = meta[language].title;
    q('meta[name="description"]')?.setAttribute('content', meta[language].description);
    q('meta[property="og:title"]')?.setAttribute('content', meta[language].title);
    q('meta[property="og:description"]')?.setAttribute('content', meta[language].description);

    qa('[data-lang]').forEach(button => {
      const active = button.dataset.lang === language;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    qa('[data-ui]').forEach(element => {
      const value = ui()[element.dataset.ui];
      if (typeof value === 'string') element.textContent = value;
    });
    const search = q('#project-search');
    if (search) search.placeholder = ui().searchPlaceholder || '';
    renderStaticArrays();
    renderCategories();
    applyFilters();
    renderFeatured();
    renderExperiences();
    if (activeProjectId) openProject(activeProjectId, false);
  }

  function renderStaticArrays() {
    q('#principle-tags').innerHTML = (ui().principleTags || []).map(item => `<span>${esc(item)}</span>`).join('');
    q('#core-lines').innerHTML = (ui().coreLines || []).map(item => `<span>${esc(item)}</span>`).join('');
    q('#speciality-lines').innerHTML = (ui().specialityLines || []).map(item => `<span>${esc(item)}</span>`).join('');
    const rows = ui().coverageRows || [];
    q('#coverage-table').innerHTML = `
      <div class="coverage-row coverage-row-head" role="row"><span>${esc(ui().layer)}</span><span>${esc(ui().typicalTools)}</span><span>${esc(ui().proof)}</span></div>
      ${rows.map(row => `<div class="coverage-row" role="row"><strong>${esc(row[0])}</strong><span>${esc(row[1])}</span><span>${esc(row[2])}</span></div>`).join('')}`;
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
    if (sortMode === 'alpha') list.sort((a, b) => a.title.localeCompare(b.title, language));
    if (sortMode === 'category') list.sort((a, b) => categoryLabel(a.category).localeCompare(categoryLabel(b.category), language) || a.title.localeCompare(b.title, language));
    if (sortMode === 'featured') list.sort((a, b) => Number(b.featured) - Number(a.featured) || projects.indexOf(a) - projects.indexOf(b));
    return list;
  }

  function renderCategories() {
    const ids = ['all', ...new Set(projects.map(item => item.category))];
    q('#category-strip').innerHTML = ids.map(id => `<button class="category-button${id === activeCategory ? ' is-active' : ''}" type="button" data-category="${esc(id)}">${esc(categoryLabel(id))}</button>`).join('');
  }

  function applyFilters() {
    filteredProjects = projects.filter(matchesProject);
    q('#active-filter-label').textContent = activeCategory === 'all' ? ui().allSystems : categoryLabel(activeCategory).toUpperCase();
    q('#visible-count').textContent = filteredProjects.length;
    renderAtlasList();
    renderProjectGrid();
    graph.setProjects(filteredProjects);
  }

  function renderAtlasList() {
    q('#atlas-list').innerHTML = filteredProjects.map(project => `
      <button class="atlas-list-item" type="button" data-id="${esc(project.id)}">
        <span class="atlas-list-mark">${esc(initials(project.title))}</span>
        <span><small>${esc(localized(project,'domain'))}</small><strong>${esc(project.title)}</strong></span><b>↗</b>
      </button>`).join('');
  }

  function renderProjectGrid() {
    const list = sortedProjects();
    const grid = q('#project-grid');
    grid.innerHTML = list.map(project => `
      <article class="project-card" tabindex="0" role="button" data-id="${esc(project.id)}" style="--card-accent:${esc(project.accent || '#245b52')}">
        <div class="project-meta"><span>${esc(categoryLabel(project.category))}</span><b>${esc(localized(project,'status'))}</b></div>
        <h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p>
        <div class="project-bottom"><div class="project-stack">${(project.stack || []).slice(0,4).map(item => `<span>${esc(item)}</span>`).join('')}</div><span class="project-arrow">↗</span></div>
      </article>`).join('');
    q('#empty-state').hidden = list.length > 0;
    grid.hidden = list.length === 0;
  }

  function renderFeatured() {
    const list = projects.filter(item => item.featured).slice(0, 6);
    q('#featured-grid').innerHTML = list.map((project,index) => `
      <article class="feature-card" tabindex="0" role="button" data-id="${esc(project.id)}" style="--card-accent:${esc(project.accent || '#245b52')}">
        <div class="feature-top"><span>${esc(ui().deepBuild)} / ${String(index + 1).padStart(2,'0')}</span><b>${esc(localized(project,'domain'))}</b></div>
        <h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p>
        <div class="feature-flow">${(localized(project,'architecture') || []).slice(0,5).map((item,flowIndex) => `${flowIndex ? '<i></i>' : ''}<span>${esc(item)}</span>`).join('')}</div>
      </article>`).join('');
  }

  function renderExperiences() {
    const visual = projects.filter(item => item.category === 'visual');
    q('#experience-grid').innerHTML = visual.map(project => `
      <article class="experience-card" tabindex="0" role="button" data-id="${esc(project.id)}">
        <small>${esc(localized(project,'domain'))}</small><h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p><span>${esc(project.year)} ↗</span>
      </article>`).join('');
  }

  const drawer = q('.detail-drawer');
  const backdrop = q('.drawer-backdrop');
  function openProject(projectOrId, focusDrawer = true) {
    const project = typeof projectOrId === 'string' ? projects.find(item => item.id === projectOrId) : projectOrId;
    if (!project) return;
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
    repo.hidden = Boolean(project.private || !project.repo);
    privateNote.hidden = !project.private;
    if (project.repo) repo.href = project.repo;
    live.hidden = !project.live;
    if (project.live) live.href = project.live;
    drawer.classList.add('is-open');backdrop.classList.add('is-open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');
    if (focusDrawer) q('.drawer-close')?.focus({preventScroll:true});
  }
  function closeDrawer() { activeProjectId = null;drawer.classList.remove('is-open');backdrop.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('drawer-open'); }

  function setView(view) {
    activeView = view === 'graph' ? 'graph' : 'list';
    qa('.view-button').forEach(button => button.classList.toggle('is-active', button.dataset.view === activeView));
    const stage = q('.atlas-stage');
    const list = q('#atlas-list');
    stage.hidden = activeView !== 'graph';
    list.hidden = activeView !== 'list';
    if (activeView === 'graph') graph.resize();
  }

  function createGraph() {
    const canvas = q('#atlas-canvas');
    const ctx = canvas.getContext('2d');
    let width=0,height=0,dpr=1,nodes=[],hovered=null,raf=0,running=!reducedMotion;
    const pointer={x:-999,y:-999};

    function build(list) {
      const categories=[...new Set(projects.map(p=>p.category))];
      const groups=new Map();list.forEach(p=>{if(!groups.has(p.category))groups.set(p.category,[]);groups.get(p.category).push(p)});
      nodes=list.map((project,index)=>{
        const group=groups.get(project.category);const gi=group.indexOf(project);const ci=Math.max(0,categories.indexOf(project.category));
        const base=(Math.PI*2*ci/Math.max(1,categories.length))-Math.PI/2;const spread=(gi-(group.length-1)/2)*.18;
        const radius=Math.min(width,height)*(project.featured?.31:.37) + (gi%3)*18;
        return {project,x:width/2+Math.cos(base+spread)*radius,y:height/2+Math.sin(base+spread)*radius,r:project.featured?7:4.5};
      });
    }
    function resize(){const rect=canvas.parentElement.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);build(filteredProjects);draw();}
    function line(a,b,alpha=.12){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(36,91,82,${alpha})`;ctx.lineWidth=1;ctx.stroke()}
    function draw(){ctx.clearRect(0,0,width,height);ctx.save();
      const sameCategory=new Map();nodes.forEach(n=>{if(!sameCategory.has(n.project.category))sameCategory.set(n.project.category,[]);sameCategory.get(n.project.category).push(n)});
      sameCategory.forEach(group=>{for(let i=1;i<group.length;i++)line(group[i-1],group[i],.16)});
      const featured=nodes.filter(n=>n.project.featured);for(let i=1;i<featured.length;i++)line(featured[i-1],featured[i],.11);
      nodes.forEach(node=>{const isHover=node===hovered;ctx.beginPath();ctx.arc(node.x,node.y,node.r+(isHover?3:0),0,Math.PI*2);ctx.fillStyle=node.project.accent||'#245b52';ctx.fill();if(node.project.featured){ctx.beginPath();ctx.arc(node.x,node.y,node.r+6,0,Math.PI*2);ctx.strokeStyle='rgba(36,91,82,.28)';ctx.stroke()}if(isHover||node.project.featured){ctx.font='600 10px ui-monospace, monospace';ctx.fillStyle=getComputedStyle(document.body).color;ctx.fillText(node.project.title,node.x+12,node.y-10)}});ctx.restore();if(running)raf=requestAnimationFrame(draw)}
    function hit(x,y){return nodes.find(n=>Math.hypot(n.x-x,n.y-y)<=Math.max(15,n.r+8))||null}
    canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();pointer.x=e.clientX-rect.left;pointer.y=e.clientY-rect.top;hovered=hit(pointer.x,pointer.y);canvas.style.cursor=hovered?'pointer':'default';if(!running)draw()});
    canvas.addEventListener('pointerleave',()=>{hovered=null;if(!running)draw()});canvas.addEventListener('click',()=>{if(hovered)openProject(hovered.project)});
    addEventListener('resize',()=>requestAnimationFrame(resize),{passive:true});
    const observer=new IntersectionObserver(entries=>{running=!reducedMotion&&entries[0]?.isIntersecting;if(running){cancelAnimationFrame(raf);draw()}else cancelAnimationFrame(raf)},{threshold:.02});observer.observe(canvas);
    return {resize,setProjects(list){build(list);hovered=null;draw()},reset(){build(filteredProjects);draw()}};
  }

  function drawHeroMap() {
    const canvas=q('#hero-canvas');const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1;
    function draw(){const rect=canvas.parentElement.getBoundingClientRect();w=rect.width;h=rect.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const center={x:w/2,y:h/2};const points=[[.16,.25],[.78,.29],[.21,.78],[.8,.76],[.34,.13],[.64,.88],[.1,.54],[.9,.48]].map(([x,y])=>({x:w*x,y:h*y}));ctx.strokeStyle='rgba(36,91,82,.18)';ctx.lineWidth=1;points.forEach(p=>{ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle='#245b52';ctx.fill()});ctx.beginPath();ctx.arc(center.x,center.y,Math.min(w,h)*.31,0,Math.PI*2);ctx.strokeStyle='rgba(36,91,82,.12)';ctx.stroke()}
    draw();addEventListener('resize',()=>requestAnimationFrame(draw),{passive:true});
  }

  const graph = createGraph();

  function bindEvents() {
    qa('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
    const categoryStrip=q('#category-strip');categoryStrip.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;renderCategories();applyFilters()});
    const search=q('#project-search');search.addEventListener('input',event=>{searchTerm=event.target.value.trim().toLowerCase();applyFilters()});
    qa('.view-button').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    qa('.sort-button').forEach(button=>button.addEventListener('click',()=>{sortMode=button.dataset.sort;qa('.sort-button').forEach(item=>item.classList.toggle('is-active',item===button));renderProjectGrid()}));
    q('#clear-filters').addEventListener('click',()=>{activeCategory='all';searchTerm='';search.value='';renderCategories();applyFilters()});q('.atlas-reset').addEventListener('click',()=>graph.reset());
    document.addEventListener('click',event=>{const target=event.target.closest('[data-id]');if(target&&(target.matches('.project-card,.feature-card,.experience-card,.atlas-list-item')))openProject(target.dataset.id)});
    document.addEventListener('keydown',event=>{const target=event.target.closest?.('[data-id]');if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openProject(target.dataset.id)}if(event.key==='/'&&document.activeElement!==search){event.preventDefault();search.focus()}if(event.key==='Escape'){if(drawer.classList.contains('is-open'))closeDrawer();else setMenu(false)}});
    q('.drawer-close').addEventListener('click',closeDrawer);backdrop.addEventListener('click',closeDrawer);
    const menuButton=q('.menu-toggle');menuButton.addEventListener('click',()=>setMenu(!q('.mobile-menu').classList.contains('is-open')));qa('.mobile-menu a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  }

  function setMenu(open){const menu=q('.mobile-menu');const button=q('.menu-toggle');menu.classList.toggle('is-open',open);menu.setAttribute('aria-hidden',String(!open));button.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)}

  q('#stat-projects').textContent=projects.length;
  q('#stat-domains').textContent=new Set(projects.filter(p=>p.category!=='visual').map(p=>p.category)).size;
  q('#stat-featured').textContent=projects.filter(p=>p.featured).length;
  bindEvents();drawHeroMap();setLanguage(language,false);setView(activeView);
})();