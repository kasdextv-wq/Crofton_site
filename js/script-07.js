(() => {
  const esc = (v='') => String(v).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const modal = document.getElementById('reviewModal');
  const content = document.getElementById('reviewModalContent');
  function openReview(index){
    const list = window.__croftonTestimonials || [];
    const t = list[Number(index)];
    if(!modal || !content || !t) return;
    content.innerHTML = `<div class="review-head"><div>${t.workType?`<div class="review-work">${esc(t.workType)}</div>`:''}<div class="review-author" id="reviewModalAuthor">${esc(t.author)}</div><div class="review-position">${esc(t.position)}</div></div>${t.avatar?`<img class="review-avatar-large" src="${esc(t.avatar)}" alt="${esc(t.author)}">`:''}</div><div class="review-text-full">${esc(t.text)}</div>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeReview(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  document.addEventListener('click', e => {
    const card = e.target.closest('.testimonial[data-review-index]');
    if(card){ e.preventDefault(); openReview(card.dataset.reviewIndex); }
  });
  document.addEventListener('keydown', e => {
    const card = e.target.closest && e.target.closest('.testimonial[data-review-index]');
    if(card && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); openReview(card.dataset.reviewIndex); }
    if(e.key==='Escape' && modal?.classList.contains('open')) closeReview();
  });
  document.querySelectorAll('[data-review-close]').forEach(el => el.addEventListener('click', closeReview));
})();
