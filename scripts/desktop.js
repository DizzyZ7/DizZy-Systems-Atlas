(() => {
  const rail = document.querySelector('#experience-rail');
  const previousButton = document.querySelector('#experience-prev');
  const nextButton = document.querySelector('#experience-next');
  const progress = document.querySelector('#experience-progress');
  const desktopQuery = window.matchMedia('(min-width: 900px) and (pointer: fine)');

  if (!rail) return;

  let isDragging = false;
  let dragStarted = false;
  let suppressClick = false;
  let startX = 0;
  let startScrollLeft = 0;
  let pointerId = null;
  let updateFrame = 0;

  const cards = () => [...rail.querySelectorAll('.experience-card')];

  const nearestCardIndex = () => {
    const list = cards();
    if (!list.length) return 0;
    const target = rail.scrollLeft + 1;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    list.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - target);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };

  const updateControls = () => {
    updateFrame = 0;
    const list = cards();
    const index = nearestCardIndex();
    if (progress) progress.textContent = `${String(index + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    if (previousButton) previousButton.disabled = rail.scrollLeft <= 3;
    if (nextButton) nextButton.disabled = rail.scrollLeft >= maxScroll - 3;
  };

  const requestControlsUpdate = () => {
    if (updateFrame) return;
    updateFrame = requestAnimationFrame(updateControls);
  };

  const scrollToCard = index => {
    const list = cards();
    const target = list[Math.max(0, Math.min(index, list.length - 1))];
    if (!target) return;
    rail.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
  };

  const moveByCard = direction => scrollToCard(nearestCardIndex() + direction);

  previousButton?.addEventListener('click', () => moveByCard(-1));
  nextButton?.addEventListener('click', () => moveByCard(1));

  rail.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveByCard(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveByCard(1);
    }
  });

  rail.addEventListener('wheel', event => {
    if (!desktopQuery.matches || rail.scrollWidth <= rail.clientWidth) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const atStart = rail.scrollLeft <= 1;
    const atEnd = rail.scrollLeft >= maxScroll - 1;
    if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

    event.preventDefault();
    rail.scrollLeft += delta * 1.18;
  }, { passive: false });

  rail.addEventListener('pointerdown', event => {
    if (!desktopQuery.matches || event.button !== 0) return;
    isDragging = true;
    dragStarted = false;
    suppressClick = false;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = rail.scrollLeft;
    rail.setPointerCapture?.(pointerId);
  });

  rail.addEventListener('pointermove', event => {
    if (!isDragging || event.pointerId !== pointerId) return;
    const distance = event.clientX - startX;
    if (!dragStarted && Math.abs(distance) > 6) {
      dragStarted = true;
      rail.classList.add('is-dragging');
    }
    if (!dragStarted) return;
    rail.scrollLeft = startScrollLeft - distance;
    event.preventDefault();
  });

  const stopDrag = event => {
    if (!isDragging || (event && event.pointerId !== pointerId)) return;
    isDragging = false;
    suppressClick = dragStarted;
    rail.classList.remove('is-dragging');
    if (pointerId !== null && rail.hasPointerCapture?.(pointerId)) rail.releasePointerCapture(pointerId);
    pointerId = null;
    if (dragStarted) scrollToCard(nearestCardIndex());
    dragStarted = false;
  };

  rail.addEventListener('pointerup', stopDrag);
  rail.addEventListener('pointercancel', stopDrag);
  rail.addEventListener('lostpointercapture', () => stopDrag());

  rail.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, true);

  rail.addEventListener('scroll', requestControlsUpdate, { passive: true });
  window.addEventListener('resize', requestControlsUpdate);
  requestAnimationFrame(updateControls);
})();
