(() => {
  const projects = window.ATLAS_PROJECTS || [];
  const categories = window.ATLAS_CATEGORIES || [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const q = (selector, context = document) => context.querySelector(selector);
  const qa = (selector, context = document) => [...context.querySelectorAll(selector)];

  let activeCategory = 'all';
  let searchTerm = '';
  let sortMode = 'featured';
  let activeView = 'graph';
  let filteredProjects = [...projects];

  const categoryLabel = id => categories.find(item => item.id === id)?.label || id;
  const initials = title => title.split(/\s+/).map(part => part[0]).join('').replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase();

  addEventListener('load', () => {
    setTimeout(() => q('.loader')?.classList.add('is-hidden'), 650);
  });

  q('#header-count').textContent = projects.length;
  q('#stat-projects').textContent = projects.length;
  q('#visible-count').textContent = projects.length;

  const menu = q('.menu-panel');
  const menuButton = q('.menu-toggle');
  const setMenu = open => {
    menu?.classList.toggle('is-open', open);
    menu?.setAttribute('aria-hidden', String(!open));
    menuButton?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };
  menuButton?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  qa('.menu-panel a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  if (fine) {
    const cursor = q('.cursor');
    addEventListener('pointermove', event => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.add('is-visible');
    });
    addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('pointerover', event => {
      const target = event.target.closest('a, button, .project-card, .feature-card, .experience-card, .atlas-list-item');
      cursor.classList.toggle('is-active', Boolean(target));
      q('span', cursor).textContent = target?.dataset.cursor || (target ? 'OPEN' : 'OPEN');
    });

    qa('.magnetic').forEach(element => {
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .12;
        const y = (event.clientY - rect.top - rect.height / 2) * .12;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });

    const orbit = q('.hero__orbit');
    orbit?.addEventListener('pointermove', event => {
      const rect = orbit.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      q('.hero-core').style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translate(${x * 10}px, ${y * 8}px)`;
      qa('.hero-node').forEach((node, index) => {
        const factor = index % 2 ? 16 : -16;
        node.style.translate = `${x * factor}px ${y * factor}px`;
      });
    });
    orbit?.addEventListener('pointerleave', () => {
      q('.hero-core').style.transform = '';
      qa('.hero-node').forEach(node => { node.style.translate = ''; });
    });
  }

  const drawer = q('.detail-drawer');
  const drawerBackdrop = q('.drawer-backdrop');
  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    drawerBackdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
  };
  const openProject = projectOrId => {
    const project = typeof projectOrId === 'string' ? projects.find(item => item.id === projectOrId) : projectOrId;
    if (!project) return;
    drawer.style.setProperty('--drawer-accent', project.accent);
    q('.drawer-index').textContent = `SYS / ${String(projects.indexOf(project) + 1).padStart(2, '0')}`;
    q('.drawer-status').textContent = project.status;
    q('.drawer-domain').textContent = project.domain;
    q('.drawer-title').textContent = project.title;
    q('.drawer-summary').textContent = project.summary;
    q('.drawer-problem').textContent = project.problem;
    q('#drawer-architecture').innerHTML = project.architecture.map(item => `<span>${item}</span>`).join('');
    q('#drawer-stack').innerHTML = project.stack.map(item => `<span>${item}</span>`).join('');
    q('#drawer-signals').innerHTML = project.signals.map(item => `<li>${item}</li>`).join('');
    const repoLink = q('.drawer-link');
    const privateNote = q('.drawer-private');
    repoLink.hidden = project.private;
    privateNote.hidden = !project.private;
    if (!project.private) repoLink.href = project.repo;
    drawer.classList.add('is-open');
    drawerBackdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
  };
  q('.drawer-close')?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);
  qa('[data-project]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.project)));

  const categoryStrip = q('#category-strip');
  categoryStrip.innerHTML = categories.map(item => `<button class="category-button${item.id === 'all' ? ' is-active' : ''}" type="button" data-category="${item.id}">${item.label}</button>`).join('');
  categoryStrip.addEventListener('click', event => {
    const button = event.target.closest('.category-button');
    if (!button) return;
    activeCategory = button.dataset.category;
    qa('.category-button').forEach(item => item.classList.toggle('is-active', item === button));
    applyFilters();
  });

  const searchInput = q('#project-search');
  searchInput?.addEventListener('input', event => {
    searchTerm = event.target.value.trim().toLowerCase();
    applyFilters();
  });

  document.addEventListener('keydown', event => {
    if (event.key === '/' && document.activeElement !== searchInput) {
      event.preventDefault();
      searchInput?.focus();
    }
    if (event.key === 'Escape') {
      if (drawer.classList.contains('is-open')) closeDrawer();
      else if (menu.classList.contains('is-open')) setMenu(false);
      else if (document.activeElement === searchInput) searchInput.blur();
    }
  });

  qa('.view-button').forEach(button => button.addEventListener('click', () => {
    activeView = button.dataset.view;
    qa('.view-button').forEach(item => item.classList.toggle('is-active', item === button));
    q('.atlas-stage').hidden = activeView !== 'graph';
    q('#atlas-list').hidden = activeView !== 'list';
    if (activeView === 'graph') graph.resize();
  }));

  qa('.sort-button').forEach(button => button.addEventListener('click', () => {
    sortMode = button.dataset.sort;
    qa('.sort-button').forEach(item => item.classList.toggle('is-active', item === button));
    renderProjectGrid();
  }));

  q('#clear-filters')?.addEventListener('click', () => {
    activeCategory = 'all';
    searchTerm = '';
    searchInput.value = '';
    qa('.category-button').forEach(item => item.classList.toggle('is-active', item.dataset.category === 'all'));
    applyFilters();
  });

  function matchesProject(project) {
    const categoryMatch = activeCategory === 'all' || project.category === activeCategory;
    const haystack = [project.title, project.domain, project.summary, ...project.stack, ...project.signals].join(' ').toLowerCase();
    return categoryMatch && (!searchTerm || haystack.includes(searchTerm));
  }

  function applyFilters() {
    filteredProjects = projects.filter(matchesProject);
    q('#active-filter-label').textContent = activeCategory === 'all' ? 'ALL SYSTEMS' : categoryLabel(activeCategory).toUpperCase();
    q('#visible-count').textContent = filteredProjects.length;
    renderAtlasList();
    renderProjectGrid();
    graph.setProjects(filteredProjects);
  }

  function renderAtlasList() {
    const list = q('#atlas-list');
    list.innerHTML = filteredProjects.map((project, index) => `
      <button class="atlas-list-item" type="button" data-id="${project.id}" style="--item-accent:${project.accent}">
        <span class="atlas-list-item__mark">${initials(project.title)}</span>
        <span><small>${project.domain}</small><strong>${project.title}</strong></span>
        <b>↗</b>
      </button>`).join('');
    qa('.atlas-list-item', list).forEach(button => button.addEventListener('click', () => openProject(button.dataset.id)));
  }

  function sortedProjects() {
    const list = [...filteredProjects];
    if (sortMode === 'alpha') list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortMode === 'category') list.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
    if (sortMode === 'featured') list.sort((a, b) => Number(b.featured) - Number(a.featured) || projects.indexOf(a) - projects.indexOf(b));
    return list;
  }

  function renderProjectGrid() {
    const grid = q('#project-grid');
    const list = sortedProjects();
    grid.innerHTML = list.map((project, index) => `
      <article class="project-card" tabindex="0" role="button" data-id="${project.id}" style="--card-accent:${project.accent}">
        <div class="project-card__meta"><span>${String(index + 1).padStart(2, '0')} / ${categoryLabel(project.category)}</span><b>${project.status}</b></div>
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        <div class="project-card__bottom">
          <div class="project-card__stack">${project.stack.slice(0, 4).map(item => `<span>${item}</span>`).join('')}</div>
          <span class="project-card__arrow">↗</span>
        </div>
      </article>`).join('');
    qa('.project-card', grid).forEach(card => {
      card.addEventListener('click', () => openProject(card.dataset.id));
      card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') openProject(card.dataset.id); });
    });
    q('#empty-state').hidden = list.length > 0;
    grid.hidden = list.length === 0;
  }

  function renderFeatured() {
    const list = projects.filter(item => item.featured).slice(0, 6);
    q('#featured-grid').innerHTML = list.map((project, index) => `
      <article class="feature-card" tabindex="0" role="button" data-id="${project.id}" style="--card-accent:${project.accent}">
        <div class="feature-card__top"><span>DEEP BUILD / ${String(index + 1).padStart(2, '0')}</span><b>${project.domain}</b></div>
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        <div class="feature-flow">${project.architecture.slice(0, 5).map((item, flowIndex) => `${flowIndex ? '<i></i>' : ''}<span>${item}</span>`).join('')}</div>
      </article>`).join('');
    qa('.feature-card').forEach(card => {
      card.addEventListener('click', () => openProject(card.dataset.id));
      card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') openProject(card.dataset.id); });
    });
  }

  function renderExperiences() {
    const visual = projects.filter(item => item.category === 'visual');
    q('#experience-rail').innerHTML = visual.map((project, index) => `
      <article class="experience-card" tabindex="0" role="button" data-id="${project.id}" style="--exp-accent:${project.accent};--exp-bg:linear-gradient(145deg,#080d13,#10151b)">
        <div class="experience-card__meta"><span>DIGITAL EXPERIENCE / ${String(index + 1).padStart(2, '0')}</span><span>${project.domain}</span></div>
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        <span class="experience-card__code">CASE / ${project.year}</span>
      </article>`).join('');
    qa('.experience-card').forEach(card => {
      card.addEventListener('click', () => openProject(card.dataset.id));
      card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') openProject(card.dataset.id); });
    });
  }

  q('.atlas-reset')?.addEventListener('click', () => graph.reset());

  function createAtlasGraph() {
    const canvas = q('#atlas-canvas');
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes = [];
    let hovered = null;
    let pointer = { x: -9999, y: -9999 };
    let phase = 0;

    const categoryAngles = new Map(categories.filter(item => item.id !== 'all').map((item, index, array) => [item.id, (Math.PI * 2 * index / array.length) - Math.PI / 2]));

    const buildNodes = list => {
      const grouped = new Map();
      list.forEach(project => {
        if (!grouped.has(project.category)) grouped.set(project.category, []);
        grouped.get(project.category).push(project);
      });
      nodes = list.map((project, index) => {
        const group = grouped.get(project.category);
        const groupIndex = group.indexOf(project);
        const angle = categoryAngles.get(project.category) ?? (Math.PI * 2 * index / Math.max(1, list.length));
        const spread = (groupIndex - (group.length - 1) / 2) * .17;
        const radius = Math.min(width, height) * (.27 + (groupIndex % 3) * .065);
        const jitter = ((index * 47) % 23 - 11) * 1.2;
        return {
          project,
          x: width / 2 + Math.cos(angle + spread) * radius + jitter,
          y: height / 2 + Math.sin(angle + spread) * radius - jitter,
          baseX: width / 2 + Math.cos(angle + spread) * radius + jitter,
          baseY: height / 2 + Math.sin(angle + spread) * radius - jitter,
          r: project.featured ? 9 : 6,
          pulse: Math.random() * Math.PI * 2
        };
      });
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes(filteredProjects);
    };

    const setProjects = list => {
      filteredProjects = list;
      buildNodes(list);
      hovered = null;
    };

    const reset = () => {
      phase += Math.PI / 3;
      nodes.forEach((node, index) => {
        const angle = Math.atan2(node.baseY - height / 2, node.baseX - width / 2) + phase * .08;
        const radius = Math.hypot(node.baseX - width / 2, node.baseY - height / 2);
        node.baseX = width / 2 + Math.cos(angle) * radius + Math.sin(index * 2.7) * 14;
        node.baseY = height / 2 + Math.sin(angle) * radius + Math.cos(index * 1.9) * 14;
      });
    };

    const draw = time => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const t = time * .001;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.strokeStyle = 'rgba(124,247,196,.11)';
      ctx.lineWidth = 1;
      [90, 170, 260].forEach((radius, index) => {
        ctx.beginPath();
        ctx.setLineDash(index === 1 ? [4, 8] : []);
        ctx.arc(0, 0, Math.min(radius, Math.min(width, height) * (.17 + index * .12)), 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      nodes.forEach((node, index) => {
        node.x += (node.baseX + Math.sin(t * .55 + index) * 3 - node.x) * .035;
        node.y += (node.baseY + Math.cos(t * .45 + index * .8) * 3 - node.y) * .035;
      });

      nodes.forEach((node, index) => {
        const distanceToCenter = Math.hypot(node.x - centerX, node.y - centerY);
        const alpha = Math.max(.05, .22 - distanceToCenter / Math.max(width, height) * .12);
        ctx.strokeStyle = `rgba(124,247,196,${alpha})`;
        ctx.lineWidth = node.project.featured ? 1 : .55;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        const nearestSame = nodes
          .filter((other, otherIndex) => otherIndex !== index && other.project.category === node.project.category)
          .sort((a, b) => Math.hypot(a.x - node.x, a.y - node.y) - Math.hypot(b.x - node.x, b.y - node.y))[0];
        if (nearestSame && index % 2 === 0) {
          ctx.strokeStyle = 'rgba(87,217,255,.08)';
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(nearestSame.x, nearestSame.y);
          ctx.stroke();
        }
      });

      ctx.fillStyle = '#060a0f';
      ctx.strokeStyle = 'rgba(124,247,196,.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 27 + Math.sin(t * 1.5) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7cf7c4';
      ctx.font = '700 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DZ', centerX, centerY);

      hovered = null;
      let nearestDistance = 24;
      nodes.forEach(node => {
        const distance = Math.hypot(pointer.x - node.x, pointer.y - node.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          hovered = node;
        }
      });

      nodes.forEach((node, index) => {
        const isHovered = node === hovered;
        const pulse = Math.sin(t * 2 + node.pulse) * 1.2;
        const radius = node.r + pulse + (isHovered ? 5 : 0);
        ctx.shadowBlur = isHovered ? 24 : node.project.featured ? 13 : 0;
        ctx.shadowColor = node.project.accent;
        ctx.fillStyle = node.project.accent;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(3, radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (node.project.featured || isHovered || width < 760) {
          ctx.textAlign = node.x > centerX ? 'left' : 'right';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isHovered ? '#edf7f3' : 'rgba(237,247,243,.68)';
          ctx.font = `${isHovered ? 700 : 600} ${isHovered ? 12 : 9}px monospace`;
          ctx.fillText(node.project.title.toUpperCase(), node.x + (node.x > centerX ? radius + 8 : -radius - 8), node.y);
        }
      });

      canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
      requestAnimationFrame(draw);
    };

    const updatePointer = event => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    canvas.addEventListener('pointermove', updatePointer);
    canvas.addEventListener('pointerleave', () => { pointer = { x: -9999, y: -9999 }; hovered = null; });
    canvas.addEventListener('click', event => {
      updatePointer(event);
      if (hovered) openProject(hovered.project);
    });
    addEventListener('resize', resize);
    resize();
    requestAnimationFrame(draw);
    return { resize, setProjects, reset };
  }

  const graph = createAtlasGraph();

  function createFieldCanvas() {
    const canvas = q('#field-canvas');
    const ctx = canvas.getContext('2d');
    let width = innerWidth;
    let height = innerHeight;
    let dpr = 1;
    let pointer = { x: width / 2, y: height / 2 };
    let particles = [];

    const resetParticles = () => {
      const count = Math.min(85, Math.max(32, Math.floor(width / 18)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: (index * 131) % width,
        y: (index * 83) % height,
        vx: ((index % 7) - 3) * .025,
        vy: ((index % 5) - 2) * .022,
        r: index % 9 === 0 ? 1.7 : .75
      }));
    };
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth;
      height = innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resetParticles();
    };
    addEventListener('resize', resize);
    addEventListener('pointermove', event => { pointer = { x: event.clientX, y: event.clientY }; });
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        const pointerDistance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
        if (pointerDistance < 160) {
          particle.x -= (pointer.x - particle.x) * .0006;
          particle.y -= (pointer.y - particle.y) * .0006;
        }
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const distance = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (distance < 112) {
            ctx.strokeStyle = `rgba(124,247,196,${(1 - distance / 112) * .11})`;
            ctx.lineWidth = .5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(particle => {
        ctx.fillStyle = particle.r > 1 ? 'rgba(87,217,255,.38)' : 'rgba(124,247,196,.25)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    if (!reduced) requestAnimationFrame(draw);
  }
  createFieldCanvas();

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? scrollY / max : 0;
    q('.page-progress span').style.transform = `scaleY(${progress})`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (!reduced) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.animate([
          { opacity: 0, transform: 'translateY(38px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 800, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    qa('.manifest__grid, .atlas__head, .systems__head, .index-section__head, .matrix__header, .experiences__head, .about__copy, .contact-section__grid').forEach(element => observer.observe(element));
  }

  renderFeatured();
  renderExperiences();
  applyFilters();
})();
