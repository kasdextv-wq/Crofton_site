(() => {
  let serverProjects = [];
  let serverImageIndex = 0;
  let serverProjectIndex = 0;
  const imageCache = new Map();
  function preloadImage(src){
    if(!src) return null;
    if(imageCache.has(src)) return imageCache.get(src);
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = src;
    imageCache.set(src, img);
    return img;
  }
  function preloadProjectImages(project){
    if(!project || !Array.isArray(project.images)) return;
    project.images.forEach(preloadImage);
  }
  function preloadAllProjectImages(){
    const run = () => serverProjects.forEach(preloadProjectImages);
    if('requestIdleCallback' in window) requestIdleCallback(run, {timeout: 2500});
    else setTimeout(run, 700);
  }
  const esc = (v='') => String(v).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function projectById(state, id){ return state.projects.find(p => p.id === id) || state.projects[0]; }
  function renderServerProjects(state){
    if (!state || !Array.isArray(state.projects) || !state.projects.length) return;
    serverProjects = state.projects;
    const hero = document.querySelector('.hero-collage');
    if (hero) {
      const ids = (state.showcaseIds && state.showcaseIds.length ? state.showcaseIds : state.projects.slice(0,3).map(p=>p.id)).slice(0,3);
      hero.innerHTML = ids.map(id => { const p = projectById(state, id); const idx = state.projects.indexOf(p); const img = (p.images && p.images[0]) || ''; return `<figure class="project-trigger" data-server-project="${idx}" tabindex="0" role="button" aria-label="Открыть проект ${esc(p.title)}"><img src="${esc(img)}" alt="${esc(p.title)}"></figure>`; }).join('');
    }
    const grid = document.querySelector('.portfolio-grid');
    if (grid) {
      grid.classList.remove('loading'); grid.innerHTML = state.projects.map((p, i) => `<article class="portfolio-card reveal visible" data-category="${esc(p.category || 'Веб-сайт')}" data-server-project="${i}"><div class="portfolio-image project-trigger" data-server-project="${i}" tabindex="0" role="button" aria-label="Открыть описание проекта"><img loading="lazy" src="${esc((p.images && p.images[0]) || '')}" alt="${esc(p.title)}"></div><h3>${esc(p.title)}</h3><p>${esc(p.category || 'Веб-сайт')}</p></article>`).join('');
    }
    setupServerFilters();
    serverProjects.slice(0, 6).forEach(preloadProjectImages);
    preloadAllProjectImages();
  }
  let visibleCases = 6;
  function setupServerFilters(){
    document.querySelectorAll('.filter').forEach(btn => {
      btn.onclick = () => { document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); visibleCases = 6; applyServerCaseLimit(); };
    });
    const more = document.getElementById('showMoreCases');
    if (more) more.onclick = () => { visibleCases += 6; applyServerCaseLimit(); };
    applyServerCaseLimit();
  }
  function applyServerCaseLimit(){
    const active = document.querySelector('.filter.active')?.dataset.filter || 'Все';
    const cards = Array.from(document.querySelectorAll('.portfolio-card'));
    cards.forEach(card => { const match = active === 'Все' || card.dataset.category === active; card.classList.toggle('hidden', !match); card.classList.remove('case-limit-hidden'); });
    const matching = cards.filter(card => active === 'Все' || card.dataset.category === active);
    matching.forEach((card, i) => { if (i >= visibleCases) card.classList.add('case-limit-hidden'); });
    const more = document.getElementById('showMoreCases');
    if (more) more.style.display = matching.length > visibleCases ? 'inline-flex' : 'none';
  }
  function renderModal(){
    const p = serverProjects[serverProjectIndex]; if (!p) return;
    const images = (p.images && p.images.length ? p.images : ['']).filter(Boolean);
    if (!images.length) images.push('');
    serverImageIndex = (serverImageIndex + images.length) % images.length;
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || ''; };
    set('modalCategory', p.category || 'Веб-сайт'); set('modalTitle', p.title); set('modalDescription', p.description); set('modalTask', p.task); set('modalResult', p.result); set('modalFormat', p.format);
    set('carouselCount', String(serverImageIndex + 1).padStart(2,'0') + ' / ' + String(images.length).padStart(2,'0'));
    const img = document.getElementById('modalImage');
    if (img) {
      const src = images[serverImageIndex];
      img.classList.remove('loaded');
      const cached = preloadImage(src);
      img.onload = () => img.classList.add('loaded');
      img.src = src;
      img.alt = p.title || '';
      if ((cached && cached.complete) || img.complete) requestAnimationFrame(() => img.classList.add('loaded'));
      // Preload neighbours first, then the rest of this project's carousel.
      preloadImage(images[(serverImageIndex + 1) % images.length]);
      preloadImage(images[(serverImageIndex - 1 + images.length) % images.length]);
      preloadProjectImages(p);
    }
    const dots = document.getElementById('carouselDots');
    if (dots) dots.innerHTML = images.map((_,i)=>`<button type="button" aria-label="Изображение ${i+1}" class="${i===serverImageIndex?'active':''}" data-server-dot="${i}"></button>`).join('');
  }
  function openServerProject(i){ if(!serverProjects.length) return; serverProjectIndex = Number(i) || 0; serverImageIndex = 0; preloadProjectImages(serverProjects[serverProjectIndex]); renderModal(); const modal = document.getElementById('projectModal'); if(modal){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; } }
  function closeServerProject(){ const modal = document.getElementById('projectModal'); if(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; } }
  function moveServerImage(step){ serverImageIndex += step; renderModal(); }
  document.addEventListener('click', e => { const trg = e.target.closest('[data-server-project]'); if(!trg) return; e.preventDefault(); e.stopPropagation(); openServerProject(trg.dataset.serverProject); }, true);
  document.addEventListener('keydown', e => { const trg = e.target.closest && e.target.closest('[data-server-project]'); if(trg && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); openServerProject(trg.dataset.serverProject); } });
  const modal = document.getElementById('projectModal');
  if (modal) {
    const prev = modal.querySelector('.carousel-nav.prev'); const next = modal.querySelector('.carousel-nav.next'); const dots = document.getElementById('carouselDots');
    if(prev) prev.onclick = () => moveServerImage(-1);
    if(next) next.onclick = () => moveServerImage(1);
    if(dots) dots.onclick = e => { const b = e.target.closest('[data-server-dot]'); if(b){ serverImageIndex = Number(b.dataset.serverDot); renderModal(); } };
    modal.querySelectorAll('[data-modal-close]').forEach(el => el.onclick = closeServerProject);
  }
  fetch('projects_api.php?action=list', {credentials:'same-origin'})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('projects api unavailable')))
    .then(data => { if(data && data.ok){ renderServerProjects(data); setTimeout(()=>{ if(typeof applyServerCaseLimit==='function') applyServerCaseLimit(); },100); } })
    .catch(() => { setupServerFilters(); });
})();
