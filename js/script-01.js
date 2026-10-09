const nav = document.getElementById('nav');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const toTop = document.getElementById('toTop');
    const toast = document.getElementById('toast');
    document.getElementById('year').textContent = new Date().getFullYear();

    function scrollContact() { document.getElementById('contact').scrollIntoView({behavior:'smooth'}); mobileMenu.classList.remove('open'); menuBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`; }
    document.querySelectorAll('[data-scroll-contact]').forEach(btn => btn.addEventListener('click', scrollContact));
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.innerHTML = open ? `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>` : `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { mobileMenu.classList.remove('open'); menuBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`; }));

    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 50);
      toTop.classList.toggle('visible', window.scrollY > 500);
    }
    window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

    document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.portfolio-card').forEach(card => card.classList.toggle('hidden', !(f === 'Все' || card.dataset.category === f)));
    }));

    const pricePanels = document.querySelectorAll('[data-price-panel]');
    function showPrices(id) {
      document.querySelectorAll('[data-price-tab]').forEach(t => t.classList.toggle('active', t.dataset.priceTab === id));
      pricePanels.forEach(p => p.classList.toggle('active', p.dataset.pricePanel === id));
    }
    document.querySelectorAll('[data-price-tab]').forEach(tab => tab.addEventListener('click', () => showPrices(tab.dataset.priceTab)));
    showPrices('landing');

    document.querySelectorAll('.faq-q').forEach(btn => btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item'); const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-a').style.maxHeight = 0; });
      if (!isOpen) { item.classList.add('open'); const a = item.querySelector('.faq-a'); a.style.maxHeight = a.scrollHeight + 'px'; }
    }));

    document.getElementById('contactForm').addEventListener('submit', e => {
      e.preventDefault(); e.currentTarget.reset(); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3600);
    });

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -40px 0px'}) : null;
    document.querySelectorAll('.reveal').forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));
