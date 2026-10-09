(() => {
  function setupStableTestimonialMarquee(){
    document.querySelectorAll('.testimonial-grid').forEach(grid => {
      const track = grid.querySelector('.testimonial-track');
      const group = grid.querySelector('.testimonial-loop-group');
      if(!track || !group || grid.dataset.stableMarqueeReady) return;
      grid.dataset.stableMarqueeReady = '1';
      let offset = 0;
      let last = performance.now();
      let targetSpeed = 70; // px/sec
      let currentSpeed = 70;
      const normalSpeed = 70;
      const slowSpeed = 7;
      function inCardVerticalBand(clientY){
        const cards = Array.from(grid.querySelectorAll('.testimonial'));
        if(!cards.length) return false;
        let top = Infinity, bottom = -Infinity;
        cards.forEach(card => { const r = card.getBoundingClientRect(); top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom); });
        return clientY >= top && clientY <= bottom;
      }
      grid.addEventListener('mousemove', e => { targetSpeed = inCardVerticalBand(e.clientY) ? slowSpeed : normalSpeed; });
      grid.addEventListener('mouseleave', () => { targetSpeed = normalSpeed; });
      function tick(now){
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, dt * 8);
        const width = group.getBoundingClientRect().width || 1;
        offset -= currentSpeed * dt;
        if(offset <= -width) offset += width;
        track.style.transform = `translate3d(${offset}px,0,0)`;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  const mo = new MutationObserver(setupStableTestimonialMarquee);
  mo.observe(document.body, {childList:true, subtree:true});
  setTimeout(setupStableTestimonialMarquee, 150);

  function copyEmail(email){
    const done = () => {
      const toast = document.getElementById('toast');
      if(toast){ toast.textContent = 'E-mail скопирован'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }
      else alert('E-mail скопирован');
    };
    if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(email).then(done).catch(done); }
    else {
      const ta = document.createElement('textarea'); ta.value = email; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy')}catch(e){} ta.remove(); done();
    }
  }
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const email = a.getAttribute('href').replace(/^mailto:/,'').split('?')[0] || a.textContent.trim();
      copyEmail(email);
    });
  });
})();
