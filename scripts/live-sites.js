(() => {
  const projects = window.ATLAS_PROJECTS || [];
  const byId = new Map(projects.map(project => [project.id, project]));
  const byTitle = new Map(projects.map(project => [project.title, project]));
  const rail = document.querySelector('#experience-rail');
  const drawer = document.querySelector('.detail-drawer');

  if (!rail) return;

  const openExternal = url => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  rail.querySelectorAll('.experience-card').forEach(card => {
    const project = byId.get(card.dataset.id);
    if (!project?.live) return;

    card.setAttribute('role', 'link');
    card.dataset.cursor = 'LIVE';
    card.dataset.live = project.live;

    if (!card.querySelector('.experience-card__links')) {
      const actions = document.createElement('div');
      actions.className = 'experience-card__links';
      actions.innerHTML = `
        <a href="${project.live}" target="_blank" rel="noreferrer">Visit live <b>↗</b></a>
        <a href="${project.repo}" target="_blank" rel="noreferrer">View source <b>↗</b></a>
      `;
      actions.querySelectorAll('a').forEach(link => link.addEventListener('click', event => event.stopPropagation()));
      card.append(actions);
    }
  });

  rail.addEventListener('click', event => {
    if (event.target.closest('.experience-card__links')) return;
    const card = event.target.closest('.experience-card');
    if (!card?.dataset.live) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openExternal(card.dataset.live);
  }, true);

  rail.addEventListener('keydown', event => {
    const card = event.target.closest('.experience-card');
    if (!card?.dataset.live || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openExternal(card.dataset.live);
  }, true);

  if (!drawer) return;

  const sourceLink = drawer.querySelector('.drawer-link');
  const privateNote = drawer.querySelector('.drawer-private');
  const liveLink = document.createElement('a');
  liveLink.className = 'drawer-link drawer-live-link';
  liveLink.target = '_blank';
  liveLink.rel = 'noreferrer';
  liveLink.hidden = true;
  liveLink.innerHTML = '<span>Visit live site</span><b>↗</b>';
  sourceLink?.insertAdjacentElement('afterend', liveLink);

  const syncDrawerLinks = () => {
    if (!drawer.classList.contains('is-open')) return;
    const title = drawer.querySelector('.drawer-title')?.textContent?.trim();
    const project = byTitle.get(title);
    if (!project) return;

    if (sourceLink) {
      sourceLink.querySelector('span').textContent = 'View source';
      sourceLink.href = project.repo;
      sourceLink.hidden = Boolean(project.private);
    }

    liveLink.hidden = !project.live;
    if (project.live) liveLink.href = project.live;
    if (privateNote) privateNote.hidden = !project.private;
  };

  new MutationObserver(syncDrawerLinks).observe(drawer, { attributes: true, attributeFilter: ['class'] });
})();
