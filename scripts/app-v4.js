(() => {
  'use strict';

  const projects = window.ATLAS_PROJECTS || [];
  const sourceCategories = window.ATLAS_CATEGORIES || [];
  const i18n = window.ATLAS_I18N || { ui: {}, projects: {} };
  const q = (selector, context = document) => context.querySelector(selector);
  const qa = (selector, context = document) => [...context.querySelectorAll(selector)];

  const categoryColors = {
    platform:'#8ed7c7', backend:'#7db8ff', ai:'#c4a5ff', product:'#f0c674', automation:'#ff9d7c',
    data:'#72d1d5', mobile:'#86d59b', edge:'#f0a9c6', quality:'#d5e879', visual:'#b5bec4'
  };
  const extraUi = {
    ru:{ guide:'Тап/клик — выбрать систему · повторный тап или «Подробнее» — открыть · drag — перемещение · колесо / ± — масштаб', fit:'Вписать', details:'Подробнее', relations:'связей', patterns:'паттернов', selected:'Выбрана система', noRelations:'изолированный узел', relatedBy:'Общие признаки', mapReset:'Карта сброшена' },
    en:{ guide:'Tap/click — select · tap again or “Details” — open · drag — pan · wheel / ± — zoom', fit:'Fit', details:'Details', relations:'relations', patterns:'patterns', selected:'Selected system', noRelations:'isolated node', relatedBy:'Shared signals', mapReset:'Map reset' }
  };

  let language = localStorage.getItem('atlas-language') || 'ru';
  if (!i18n.ui[language]) language = 'ru';
  let activeCategory = 'all';
  let searchTerm = '';
  let sortMode = 'featured';
  let activeView = 'graph';
  let filteredProjects = [...projects];
  let activeProjectId = null;

  const ui = () => i18n.ui[language] || i18n.ui.en || {};
  const xui = key => extraUi[language]?.[key] || extraUi.en[key] || key;
  const categoryLabel = id => ui().categories?.[id] || sourceCategories.find(item => item.id === id)?.label || id;
  const translation = project => language === 'ru' ? (i18n.projects?.[project.id]?.ru || {}) : {};
  const localized = (project, field) => translation(project)[field] ?? project[field];
  const initials = title => title.split(/\s+/).map(part => part[0]).join('').replace(/[^A-Z0-9]/gi,'').slice(0,3).toUpperCase();
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9+#./-]+/g,' ').trim();

  const meta = {
    ru:{title:'DizZy Systems Atlas — инженерная карта систем',description:'Интерактивный инженерный Atlas Димаша Джанибекова: backend, automation, AI/RAG, security, data, observability и digital experiences.'},
    en:{title:'DizZy Systems Atlas — engineering systems map',description:'Interactive engineering atlas by Dimash Janibekov: backend, automation, AI/RAG, security, data, observability and digital experiences.'}
  };

  const patternDefs = [
    ['event-driven',['queue','nats','jetstream','celery','webhook','mqtt','event','delivery','worker','async']],
    ['security',['rbac','oidc','hmac','ssrf','security','fail-closed','sarif','token','auth','audit']],
    ['observability',['prometheus','grafana','opentelemetry','metrics','trace','logging','audit','sla']],
    ['data',['postgresql','redis','sqlite','qdrant','pgvector','prisma','sqlalchemy','alembic','pandas']],
    ['ai / decision',['rag','llm','openai','claude','langchain','forecast','risk','classifier','model','embedding']],
    ['product interface',['next.js','react','flutter','streamlit','telegram','pwa','html','css','javascript','typescript']],
    ['delivery / integration',['telegram','http','webhook','api','email','crm','1c','notification','routing']]
  ];

  function projectCorpus(project){ return normalize([project.domain,project.summary,project.problem,...(project.stack||[]),...(project.signals||[]),...(project.architecture||[])].join(' ')); }
  function patternsFor(project){ const corpus=projectCorpus(project); return patternDefs.filter(([,words])=>words.some(word=>corpus.includes(normalize(word)))).map(([name])=>name); }
  function stackSet(project){ return new Set((project.stack||[]).map(normalize).filter(Boolean)); }
  function relation(a,b){
    const bs=stackSet(b);
    const sharedStack=[...stackSet(a)].filter(item=>bs.has(item));
    const pa=patternsFor(a),pb=patternsFor(b),sharedPatterns=pa.filter(p=>pb.includes(p));
    const sameCategory=a.category===b.category;
    const score=sharedStack.length*2+sharedPatterns.length+(sameCategory?0.75:0);
    return {score,sharedStack,sharedPatterns,sameCategory};
  }
  function relationsFor(project,list=projects){ return list.filter(p=>p!==project).map(other=>({other,...relation(project,other)})).filter(r=>r.score>=2.75).sort((a,b)=>b.score-a.score); }

  function renderStaticArrays(){
    q('#principle-tags')?.replaceChildren(...(ui().principleTags||[]).map(item=>{const s=document.createElement('span');s.textContent=item;return s;}));
    const core=q('#core-lines'); if(core) core.innerHTML=(ui().coreLines||[]).map(item=>`<span>${esc(item)}</span>`).join('');
    const spec=q('#speciality-lines'); if(spec) spec.innerHTML=(ui().specialityLines||[]).map(item=>`<span>${esc(item)}</span>`).join('');
    const rows=ui().coverageRows||[], table=q('#coverage-table');
    if(table) table.innerHTML=`<div class="coverage-row coverage-row-head" role="row"><span>${esc(ui().layer)}</span><span>${esc(ui().typicalTools)}</span><span>${esc(ui().proof)}</span></div>${rows.map(row=>`<div class="coverage-row" role="row"><strong>${esc(row[0])}</strong><span data-mobile-label="${esc(ui().typicalTools)}">${esc(row[1])}</span><span data-mobile-label="${esc(ui().proof)}">${esc(row[2])}</span></div>`).join('')}`;
  }
  function projectSearchText(project){ const ru=i18n.projects?.[project.id]?.ru||{}; return [project.title,project.domain,project.status,project.summary,project.problem,...(project.architecture||[]),...(project.stack||[]),...(project.signals||[]),ru.domain,ru.status,ru.summary,ru.problem,...(ru.architecture||[]),...(ru.signals||[])].filter(Boolean).join(' ').toLowerCase(); }
  function matchesProject(project){ return (activeCategory==='all'||project.category===activeCategory)&&(!searchTerm||projectSearchText(project).includes(searchTerm)); }
  function sortedProjects(){ const list=[...filteredProjects]; if(sortMode==='alpha')list.sort((a,b)=>a.title.localeCompare(b.title,language)); if(sortMode==='category')list.sort((a,b)=>categoryLabel(a.category).localeCompare(categoryLabel(b.category),language)||a.title.localeCompare(b.title,language)); if(sortMode==='featured')list.sort((a,b)=>Number(b.featured)-Number(a.featured)||projects.indexOf(a)-projects.indexOf(b)); return list; }

  function renderCategories(){
    const strip=q('#category-strip'); if(!strip)return;
    const ids=['all',...new Set(projects.map(p=>p.category))];
    strip.innerHTML=ids.map(id=>`<button class="category-button${id===activeCategory?' is-active':''}" type="button" data-category="${esc(id)}">${esc(categoryLabel(id))}</button>`).join('');
    const legend=q('#atlas-legend'); if(legend) legend.innerHTML=ids.filter(id=>id!=='all').map(id=>`<span class="legend-item"><i class="legend-dot" style="--legend-color:${categoryColors[id]||'#8ed7c7'}"></i>${esc(categoryLabel(id))}</span>`).join('');
  }
  function renderAtlasList(){ const list=q('#atlas-list'); if(!list)return; list.innerHTML=filteredProjects.map(project=>`<button class="atlas-list-item" type="button" data-id="${esc(project.id)}"><span class="atlas-list-mark" style="color:${categoryColors[project.category]||'#8ed7c7'}">${esc(initials(project.title))}</span><span><small>${esc(localized(project,'domain'))}</small><strong>${esc(project.title)}</strong></span><b>↗</b></button>`).join(''); }
  function renderProjectGrid(){ const list=sortedProjects(),grid=q('#project-grid');if(!grid)return;grid.innerHTML=list.map(project=>`<article class="project-card" tabindex="0" role="button" data-id="${esc(project.id)}" style="--card-accent:${categoryColors[project.category]||project.accent||'#8ed7c7'}"><div class="project-meta"><span>${esc(categoryLabel(project.category))}</span><b>${esc(localized(project,'status'))}</b></div><h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p><div class="project-bottom"><div class="project-stack">${(project.stack||[]).slice(0,4).map(item=>`<span>${esc(item)}</span>`).join('')}</div><span class="project-arrow">↗</span></div></article>`).join(''); const empty=q('#empty-state');if(empty)empty.hidden=list.length>0;grid.hidden=list.length===0; }
  function renderFeatured(){ const grid=q('#featured-grid');if(!grid)return;const list=projects.filter(p=>p.featured).slice(0,7);grid.innerHTML=list.map((project,index)=>`<article class="feature-card" tabindex="0" role="button" data-id="${esc(project.id)}" style="--card-accent:${categoryColors[project.category]||project.accent||'#8ed7c7'}"><div class="feature-top"><span>${esc(ui().deepBuild)} / ${String(index+1).padStart(2,'0')}</span><b>${esc(localized(project,'domain'))}</b></div><h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p><div class="feature-flow">${(localized(project,'architecture')||[]).slice(0,6).map((item,i)=>`${i?'<i></i>':''}<span>${esc(item)}</span>`).join('')}</div></article>`).join(''); }
  function renderExperiences(){ const grid=q('#experience-grid');if(!grid)return;grid.innerHTML=projects.filter(p=>p.category==='visual').map(project=>`<article class="experience-card" tabindex="0" role="button" data-id="${esc(project.id)}"><small>${esc(localized(project,'domain'))}</small><h3>${esc(project.title)}</h3><p>${esc(localized(project,'summary'))}</p><span>${esc(project.year)} ↗</span></article>`).join(''); }

  const drawer=q('.detail-drawer'),backdrop=q('.drawer-backdrop');
  function openProject(projectOrId,focusDrawer=true){ const project=typeof projectOrId==='string'?projects.find(p=>p.id===projectOrId):projectOrId;if(!project||!drawer||!backdrop)return;activeProjectId=project.id;q('.drawer-index').textContent=`SYS / ${String(projects.indexOf(project)+1).padStart(2,'0')}`;q('.drawer-status').textContent=localized(project,'status');q('.drawer-domain').textContent=localized(project,'domain');q('.drawer-title').textContent=project.title;q('.drawer-summary').textContent=localized(project,'summary');q('.drawer-problem').textContent=localized(project,'problem');q('#drawer-architecture').innerHTML=(localized(project,'architecture')||[]).map(item=>`<span>${esc(item)}</span>`).join('');q('#drawer-stack').innerHTML=(project.stack||[]).map(item=>`<span>${esc(item)}</span>`).join('');q('#drawer-signals').innerHTML=(localized(project,'signals')||[]).map(item=>`<li>${esc(item)}</li>`).join('');const repo=q('.drawer-link'),live=q('.drawer-live'),privateNote=q('.drawer-private');if(repo){repo.hidden=Boolean(project.private||!project.repo);if(project.repo)repo.href=project.repo}if(privateNote)privateNote.hidden=!project.private;if(live){live.hidden=!project.live;if(project.live)live.href=project.live}drawer.classList.add('is-open');backdrop.classList.add('is-open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');if(focusDrawer)q('.drawer-close')?.focus({preventScroll:true}); }
  function closeDrawer(){activeProjectId=null;drawer?.classList.remove('is-open');backdrop?.classList.remove('is-open');drawer?.setAttribute('aria-hidden','true');document.body.classList.remove('drawer-open');}

  function createGraph(){
    const canvas=q('#atlas-canvas'); if(!canvas)return{resize(){},setProjects(){},reset(){},zoom(){},fit(){},clearSelection(){}};
    const ctx=canvas.getContext('2d');
    let width=0,height=0,dpr=1,nodes=[],edges=[],hovered=null,selected=null,scale=1,offsetX=0,offsetY=0;
    let dragging=false,moved=false,startX=0,startY=0,baseOffsetX=0,baseOffsetY=0,pointerId=null,keyboardIndex=0;
    const getCss=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    function build(list){
      const categoryIds=[...new Set(projects.map(p=>p.category))],groups=new Map();
      list.forEach(p=>{if(!groups.has(p.category))groups.set(p.category,[]);groups.get(p.category).push(p)});
      const minSide=Math.min(width,height);
      nodes=list.map((project,index)=>{const group=groups.get(project.category)||[project],gi=group.indexOf(project),ci=Math.max(0,categoryIds.indexOf(project.category)),base=(Math.PI*2*ci/Math.max(1,categoryIds.length))-Math.PI/2,spread=(gi-(group.length-1)/2)*(group.length>5?.13:.19),ring=.25+(gi%3)*.09,radius=minSide*ring,jitter=((index*37)%17-8)*2;return{project,x:Math.cos(base+spread)*radius+jitter,y:Math.sin(base+spread)*radius-jitter,r:project.featured?9:6};});
      const map=new Map(nodes.map(n=>[n.project.id,n])); edges=[];
      for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const rel=relation(list[i],list[j]);if(rel.score>=2.75)edges.push({a:map.get(list[i].id),b:map.get(list[j].id),rel});}
      if(selected&&!map.has(selected.project.id)) selected=null;
    }
    function screen(node){return{x:width/2+offsetX+node.x*scale,y:height/2+offsetY+node.y*scale,r:node.r*Math.max(.9,Math.min(scale,1.55))};}
    function resize(){const rect=canvas.parentElement.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);build(filteredProjects);draw();}
    function relatedIds(){if(!selected)return new Set();return new Set(edges.filter(e=>e.a===selected||e.b===selected).map(e=>(e.a===selected?e.b:e.a).project.id));}
    function edgeIsSelected(edge){return selected&&(edge.a===selected||edge.b===selected);}
    function drawEdge(edge){const A=screen(edge.a),B=screen(edge.b),hot=edgeIsSelected(edge);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.strokeStyle=hot?'rgba(181,240,226,.58)':'rgba(142,215,199,.11)';ctx.lineWidth=hot?1.6:1;ctx.stroke();}
    function drawLabel(node,p,isHover,isSelected,isRelated){const featured=node.project.featured;if(!featured&&!isHover&&!isSelected&&!(isRelated&&width>800))return;const title=node.project.title;ctx.font=`${isSelected?800:featured?700:650} ${width<520?10:11}px ${getCss('--mono')||'monospace'}`;const tw=ctx.measureText(title).width,padX=7,boxH=23;let bx=p.x+13,by=p.y-27;if(bx+tw+padX*2>width-8)bx=p.x-tw-padX*2-13;if(by<8)by=p.y+12;ctx.fillStyle='rgba(10,16,17,.95)';ctx.strokeStyle=isSelected?'rgba(181,240,226,.7)':'rgba(142,215,199,.27)';ctx.beginPath();ctx.roundRect(bx,by,tw+padX*2,boxH,6);ctx.fill();ctx.stroke();ctx.fillStyle=isSelected||isHover?'#fff':'#cad6d2';ctx.fillText(title,bx+padX,by+15.5);}
    function draw(){
      ctx.clearRect(0,0,width,height);ctx.save();const cx=width/2+offsetX,cy=height/2+offsetY;[.18,.31,.43].forEach((factor,i)=>{ctx.beginPath();ctx.arc(cx,cy,Math.min(width,height)*factor*scale,0,Math.PI*2);ctx.strokeStyle=`rgba(142,215,199,${.07-i*.011})`;ctx.stroke();});
      edges.filter(e=>!edgeIsSelected(e)).forEach(drawEdge);edges.filter(edgeIsSelected).forEach(drawEdge);
      const related=relatedIds();nodes.forEach(node=>{const p=screen(node),isHover=node===hovered,isSelected=node===selected,isRelated=related.has(node.project.id),dim=selected&&!isSelected&&!isRelated;ctx.globalAlpha=dim?.24:1;const color=categoryColors[node.project.category]||node.project.accent||'#8ed7c7';if(node.project.featured||isHover||isSelected){ctx.beginPath();ctx.arc(p.x,p.y,p.r+(isSelected?13:isHover?10:7),0,Math.PI*2);ctx.fillStyle=isSelected?'rgba(181,240,226,.12)':'rgba(142,215,199,.05)';ctx.fill();ctx.strokeStyle=isSelected?'rgba(181,240,226,.82)':'rgba(142,215,199,.31)';ctx.stroke();}ctx.beginPath();ctx.arc(p.x,p.y,p.r+(isHover?2:0),0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(isSelected){ctx.beginPath();ctx.arc(p.x,p.y,p.r+5,0,Math.PI*2);ctx.strokeStyle='#fff';ctx.lineWidth=1.4;ctx.stroke();}drawLabel(node,p,isHover,isSelected,isRelated);ctx.globalAlpha=1;});ctx.beginPath();ctx.arc(cx,cy,4.5,0,Math.PI*2);ctx.fillStyle='#f3f7f5';ctx.fill();ctx.restore();
    }
    function hit(x,y){let best=null,bestDistance=Infinity;for(const node of nodes){const p=screen(node),d=Math.hypot(p.x-x,p.y-y),zone=node.project.featured?30:26;if(d<=zone&&d<bestDistance){best=node;bestDistance=d}}return best;}
    function pointFromEvent(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
    function announce(project){const live=q('#map-live');if(live)live.textContent=`${xui('selected')}: ${project.title}. ${localized(project,'domain')}.`;}
    function updateInspector(){const panel=q('#atlas-inspector');if(!panel)return;if(!selected){panel.hidden=true;return;}const p=selected.project,rels=relationsFor(p,filteredProjects),patterns=patternsFor(p);q('#inspector-category').textContent=categoryLabel(p.category);q('#inspector-title').textContent=p.title;q('#inspector-summary').textContent=localized(p,'summary');q('#inspector-relations').textContent=`${rels.length} ${xui('relations')}`;q('#inspector-patterns').textContent=`${patterns.length} ${xui('patterns')}`;q('#inspector-stack').innerHTML=(p.stack||[]).slice(0,5).map(item=>`<span>${esc(item)}</span>`).join('');const repo=q('#inspector-repo');if(repo){repo.hidden=Boolean(p.private||!p.repo);if(p.repo)repo.href=p.repo;}panel.hidden=false;announce(p);}
    function selectNode(node,openIfSame=false){if(node&&selected===node&&openIfSame){openProject(node.project);return;}selected=node;keyboardIndex=Math.max(0,nodes.indexOf(node));updateInspector();draw();}
    function clearSelection(){selected=null;hovered=null;updateInspector();draw();}
    function zoom(factor,anchor={x:width/2,y:height/2}){const old=scale,next=Math.max(.58,Math.min(2.05,scale*factor));const worldX=(anchor.x-width/2-offsetX)/old,worldY=(anchor.y-height/2-offsetY)/old;scale=next;offsetX=anchor.x-width/2-worldX*scale;offsetY=anchor.y-height/2-worldY*scale;draw();}
    function fit(){scale=1;offsetX=0;offsetY=0;draw();}
    function reset(){scale=1;offsetX=0;offsetY=0;selected=null;hovered=null;build(filteredProjects);updateInspector();draw();const live=q('#map-live');if(live)live.textContent=xui('mapReset');}

    canvas.addEventListener('pointerdown',e=>{const p=pointFromEvent(e);pointerId=e.pointerId;dragging=true;moved=false;startX=p.x;startY=p.y;baseOffsetX=offsetX;baseOffsetY=offsetY;canvas.setPointerCapture?.(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{const p=pointFromEvent(e);if(dragging&&e.pointerId===pointerId){const dx=p.x-startX,dy=p.y-startY;if(Math.hypot(dx,dy)>5)moved=true;if(moved){offsetX=baseOffsetX+dx;offsetY=baseOffsetY+dy;hovered=null;canvas.style.cursor='grabbing';draw();return;}}hovered=hit(p.x,p.y);canvas.style.cursor=hovered?'pointer':'grab';draw();});
    canvas.addEventListener('pointerup',e=>{const p=pointFromEvent(e),target=hit(p.x,p.y);if(!moved){if(target)selectNode(target,true);else clearSelection();}dragging=false;moved=false;pointerId=null;canvas.style.cursor=target?'pointer':'grab';canvas.releasePointerCapture?.(e.pointerId);draw();});
    canvas.addEventListener('pointercancel',()=>{dragging=false;moved=false;pointerId=null;canvas.style.cursor='grab';});canvas.addEventListener('pointerleave',()=>{if(!dragging){hovered=null;canvas.style.cursor='grab';draw();}});
    canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.1:.9,pointFromEvent(e));},{passive:false});
    canvas.addEventListener('keydown',e=>{if(!nodes.length)return;if(['ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();keyboardIndex=(keyboardIndex+1)%nodes.length;selectNode(nodes[keyboardIndex]);}else if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();keyboardIndex=(keyboardIndex-1+nodes.length)%nodes.length;selectNode(nodes[keyboardIndex]);}else if(e.key==='Enter'&&selected){e.preventDefault();openProject(selected.project);}else if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.12);}else if(e.key==='-'){e.preventDefault();zoom(.89);}else if(e.key==='0'){e.preventDefault();fit();}});
    canvas.style.cursor='grab';addEventListener('resize',()=>requestAnimationFrame(resize),{passive:true});
    return{resize,reset,fit,zoom,clearSelection,setProjects(list){filteredProjects=list;build(list);selected=null;hovered=null;updateInspector();draw();},selectedProject(){return selected?.project||null;}};
  }

  const graph=createGraph();
  function applyFilters(){filteredProjects=projects.filter(matchesProject);const label=q('#active-filter-label');if(label)label.textContent=activeCategory==='all'?ui().allSystems:categoryLabel(activeCategory).toUpperCase();const visible=q('#visible-count');if(visible)visible.textContent=filteredProjects.length;renderAtlasList();renderProjectGrid();graph.setProjects(filteredProjects);}
  function setView(view){activeView=view==='list'?'list':'graph';qa('.view-button').forEach(button=>button.classList.toggle('is-active',button.dataset.view===activeView));const stage=q('.atlas-stage'),list=q('#atlas-list'),context=q('.atlas-context-row');if(stage)stage.hidden=activeView!=='graph';if(context)context.hidden=activeView!=='graph';if(list)list.hidden=activeView!=='list';if(activeView==='graph')requestAnimationFrame(()=>graph.resize());}
  function setLanguage(next,persist=true){language=i18n.ui[next]?next:'ru';if(persist)localStorage.setItem('atlas-language',language);document.documentElement.lang=language;document.title=meta[language].title;q('meta[name="description"]')?.setAttribute('content',meta[language].description);q('meta[property="og:title"]')?.setAttribute('content',meta[language].title);q('meta[property="og:description"]')?.setAttribute('content',meta[language].description);qa('[data-lang]').forEach(button=>{const active=button.dataset.lang===language;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});qa('[data-ui]').forEach(el=>{const value=ui()[el.dataset.ui];if(typeof value==='string')el.textContent=value;});const search=q('#project-search');if(search)search.placeholder=ui().searchPlaceholder||'';const guide=q('#atlas-guide');if(guide)guide.textContent=xui('guide');const fit=q('#fit-map');if(fit)fit.textContent=xui('fit');const details=q('#inspector-details');if(details)details.textContent=xui('details');renderStaticArrays();renderCategories();applyFilters();renderFeatured();renderExperiences();if(activeProjectId)openProject(activeProjectId,false);}

  function drawHeroMap(){const canvas=q('#hero-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');function draw(){const rect=canvas.parentElement.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,w*dpr);canvas.height=Math.max(1,h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const c={x:w/2,y:h/2},pts=[[.16,.25],[.78,.29],[.21,.78],[.8,.76],[.34,.13],[.64,.88],[.1,.54],[.9,.48]].map(([x,y])=>({x:w*x,y:h*y}));ctx.lineWidth=1;pts.forEach((p,i)=>{ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle='rgba(142,215,199,.14)';ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,i<4?4:3,0,Math.PI*2);ctx.fillStyle=i<4?'#8ed7c7':'#3e756c';ctx.fill()});[.19,.31].forEach(r=>{ctx.beginPath();ctx.arc(c.x,c.y,Math.min(w,h)*r,0,Math.PI*2);ctx.strokeStyle='rgba(142,215,199,.09)';ctx.stroke()});}draw();addEventListener('resize',()=>requestAnimationFrame(draw),{passive:true});}
  function setMenu(open){const menu=q('.mobile-menu'),button=q('.menu-toggle');if(!menu||!button)return;menu.classList.toggle('is-open',open);menu.setAttribute('aria-hidden',String(!open));button.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open);}

  function bindEvents(){
    qa('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
    q('#category-strip')?.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;renderCategories();applyFilters();});
    const search=q('#project-search');search?.addEventListener('input',event=>{searchTerm=event.target.value.trim().toLowerCase();applyFilters();});qa('.view-button').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));qa('.sort-button').forEach(button=>button.addEventListener('click',()=>{sortMode=button.dataset.sort;qa('.sort-button').forEach(item=>item.classList.toggle('is-active',item===button));renderProjectGrid();}));q('#clear-filters')?.addEventListener('click',()=>{activeCategory='all';searchTerm='';if(search)search.value='';renderCategories();applyFilters();});
    q('.map-controls')?.addEventListener('click',event=>{const action=event.target.closest('[data-map-action]')?.dataset.mapAction;if(action==='zoom-in')graph.zoom(1.14);if(action==='zoom-out')graph.zoom(.87);if(action==='fit')graph.fit();if(action==='reset')graph.reset();});q('#inspector-close')?.addEventListener('click',()=>graph.clearSelection());q('#inspector-details')?.addEventListener('click',()=>{const p=graph.selectedProject();if(p)openProject(p);});
    document.addEventListener('click',event=>{const target=event.target.closest('[data-id]');if(target&&target.matches('.project-card,.feature-card,.experience-card,.atlas-list-item'))openProject(target.dataset.id);});document.addEventListener('keydown',event=>{const target=event.target.closest?.('[data-id]');if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openProject(target.dataset.id);}if(event.key==='/'&&search&&document.activeElement!==search){event.preventDefault();search.focus();}if(event.key==='Escape'){if(drawer?.classList.contains('is-open'))closeDrawer();else if(!q('#atlas-inspector')?.hidden)graph.clearSelection();else setMenu(false);}});q('.drawer-close')?.addEventListener('click',closeDrawer);backdrop?.addEventListener('click',closeDrawer);const menuButton=q('.menu-toggle');menuButton?.addEventListener('click',()=>setMenu(!q('.mobile-menu')?.classList.contains('is-open')));qa('.mobile-menu a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  }

  const count=q('#stat-projects');if(count)count.textContent=projects.length;const domains=q('#stat-domains');if(domains)domains.textContent=new Set(projects.filter(p=>p.category!=='visual').map(p=>p.category)).size;const featured=q('#stat-featured');if(featured)featured.textContent=projects.filter(p=>p.featured).length;
  bindEvents();drawHeroMap();setLanguage(language,false);setView('graph');
})();
