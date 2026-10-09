(() => {
  let lockedY = 0;
  function anyModalOpen(){return !!document.querySelector('.project-modal.open,.order-modal.open,.legal-modal.open,.review-modal.open')}
  function lockBody(){ if(document.body.classList.contains('modal-lock')) return; lockedY = window.scrollY || document.documentElement.scrollTop || 0; document.body.style.top = `-${lockedY}px`; document.body.classList.add('modal-lock'); }
  function unlockBody(){ if(!document.body.classList.contains('modal-lock')) return; const y=lockedY; const html=document.documentElement; const prevHtml=html.style.scrollBehavior; const prevBody=document.body.style.scrollBehavior; html.style.scrollBehavior='auto'; document.body.style.scrollBehavior='auto'; document.body.classList.remove('modal-lock'); document.body.style.top=''; window.scrollTo({top:y,left:0,behavior:'auto'}); requestAnimationFrame(()=>{ html.style.scrollBehavior=prevHtml; document.body.style.scrollBehavior=prevBody; }); }
  const mo = new MutationObserver(() => { anyModalOpen() ? lockBody() : unlockBody(); });
  mo.observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});
  document.addEventListener('touchmove', e => {
    if(!anyModalOpen()) return;
    const scrollable = e.target.closest('.project-modal__info,.order-modal__dialog,.legal-dialog,.review-dialog');
    if(!scrollable) e.preventDefault();
  }, {passive:false});
})();
