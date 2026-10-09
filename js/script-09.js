(() => {
  function closeReviewModal(){
    const modal = document.getElementById('reviewModal');
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    if(!document.querySelector('.project-modal.open,.order-modal.open,.legal-modal.open')){
      document.body.style.overflow='';
    }
  }
  document.addEventListener('click', e => {
    const modal = document.getElementById('reviewModal');
    if(!modal || !modal.classList.contains('open')) return;
    if(e.target === modal || e.target.classList.contains('review-backdrop') || e.target.closest('[data-review-close]')){
      e.preventDefault();
      closeReviewModal();
    }
  }, true);
})();
