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

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -40px 0px'}) : null;
    document.querySelectorAll('.reveal').forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));

(() => {
      const TG='https://t.me/EvanCrofton', VK='https://vk.com/ivancrofton', EMAIL=['ivan.crofton','yandex.ru'].join('@');
      const toast=document.getElementById('toast');
      const showToast=(m)=>{ if(!toast) return alert(m); toast.textContent=m; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),3800); };
      const copyText=async(t)=>{ try{ await navigator.clipboard.writeText(t); }catch(e){} };
      let adminState=null;
      const escHtml=(v)=>String(v||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      if(adminState && Array.isArray(adminState.projects) && adminState.projects.length){
        const byId=(id)=>adminState.projects.find(p=>p.id===id)||adminState.projects[0];
        const hero=document.querySelector('.hero-collage');
        if(hero){ const ids=(adminState.showcaseIds&&adminState.showcaseIds.length?adminState.showcaseIds:adminState.projects.slice(0,3).map(p=>p.id)).slice(0,3); hero.innerHTML=ids.map(id=>{const p=byId(id); const img=(p.images&&p.images[0])||''; return `<figure class="project-trigger" data-project="${adminState.projects.indexOf(p)}" tabindex="0" role="button" aria-label="Открыть проект ${escHtml(p.title)}"><img src="${img}" alt="${escHtml(p.title)}"></figure>`}).join(''); }
        const grid=document.querySelector('.portfolio-grid');
        if(grid){ grid.innerHTML=adminState.projects.map((p,i)=>`<article class="portfolio-card reveal visible" data-category="${escHtml(p.category||'Веб-сайт')}" data-project="${i}"><div class="portfolio-image project-trigger" tabindex="0" role="button" aria-label="Открыть описание проекта"><img loading="lazy" src="${(p.images&&p.images[0])||''}" alt="${escHtml(p.title)}"></div><h3>${escHtml(p.title)}</h3><p>${escHtml(p.category||'Веб-сайт')}</p></article>`).join(''); }
      }
      function selectedMethod(scope){ return document.querySelector(`[data-method-scope="${scope}"] .method-btn.active`)?.dataset.method || 'telegram'; }
      const methodMap={telegram:{label:'Ник Telegram',placeholder:'@username или ссылка t.me',type:'text'},vk:{label:'Ссылка VK',placeholder:'https://vk.com/username',type:'url'},email:{label:'Ваш email',placeholder:'your@email.com',type:'email'},phone:{label:'Ваш номер',placeholder:'+7 999 000-00-00',type:'tel'}};
      function applyMethod(scope,method){ const block=document.querySelector(`[data-method-scope="${scope}"]`); if(!block) return; block.querySelectorAll('.method-btn').forEach(b=>b.classList.toggle('active',b.dataset.method===method)); const input=scope==='order'?document.getElementById('orderContactValue'):document.getElementById('contactMethodValue'); const cfg=methodMap[method]||methodMap.telegram; input.type=cfg.type; input.placeholder=cfg.placeholder; const label=block.querySelector('label'); label.textContent='Как с вами связаться — '+cfg.label.toLowerCase(); }

      let visibleCases=6;
      function applyCaseLimit(reset=false){
        if(reset) visibleCases=6;
        const active=document.querySelector('.filter.active')?.dataset.filter || 'Все';
        const cards=Array.from(document.querySelectorAll('.portfolio-card'));
        const matching=cards.filter(card => active==='Все' || card.dataset.category===active);
        cards.forEach(card=>card.classList.remove('case-limit-hidden'));
        matching.forEach((card,i)=>{ if(i>=visibleCases) card.classList.add('case-limit-hidden'); });
        const btn=document.getElementById('showMoreCases');
        if(btn) btn.style.display = matching.length>visibleCases ? 'inline-flex' : 'none';
      }
      document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>setTimeout(()=>applyCaseLimit(true),0)));
      const moreBtn=document.getElementById('showMoreCases');
      if(moreBtn) moreBtn.addEventListener('click',()=>{visibleCases+=6;applyCaseLimit(false);});
      setTimeout(()=>applyCaseLimit(true),60);

      document.querySelectorAll('.method-btn').forEach(btn=>btn.addEventListener('click',()=>applyMethod(btn.closest('.method-block').dataset.methodScope,btn.dataset.method)));
      applyMethod('order','telegram'); applyMethod('contact','telegram');

      const modal = document.getElementById('projectModal');
      if (modal) {
        const img=document.getElementById('modalImage'), title=document.getElementById('modalTitle'), cat=document.getElementById('modalCategory'), desc=document.getElementById('modalDescription'), task=document.getElementById('modalTask'), result=document.getElementById('modalResult'), format=document.getElementById('modalFormat'), count=document.getElementById('carouselCount'), dots=document.getElementById('carouselDots');
        const base=[
          {title:'Modern E-commerce', category:'Веб-сайт', description:'Минималистичная витрина для e-commerce проекта с акцентом на продуктовые карточки, доверие и быстрый путь к покупке.', task:'Упаковать каталог и повысить конверсию', result:'Чёткая структура и премиальная подача', format:'UX/UI + Web'},
          {title:'Brand Identity System', category:'Айдентика', description:'Система айдентики для бренда: логика использования логотипа, цветовая палитра, типографика и визуальные носители.', task:'Собрать единый образ бренда', result:'Узнаваемая визуальная система', format:'Логотип'},
          {title:'Luxury Brand', category:'Логотип', description:'Премиальная презентация бренда с выразительной композицией, спокойной типографикой и фокусом на ощущение статуса.', task:'Передать высокий ценовой сегмент', result:'Сильный digital-образ', format:'Art direction'},
          {title:'Clean Interface', category:'Веб-сайт', description:'Чистый интерфейс для сервиса, где главный приоритет — понятная навигация, аккуратная сетка и быстрые сценарии пользователя.', task:'Упростить пользовательский путь', result:'Лёгкий и понятный интерфейс', format:'Продуктовый дизайн'},
          {title:'Corporate Branding', category:'Логотип', description:'Корпоративный визуальный стиль для коммуникаций компании: от сайта до социальных сетей и презентационных материалов.', task:'Усилить доверие к компании', result:'Консистентный бренд во всех точках', format:'Бренд-система'},
          {title:'Minimal Design', category:'Айдентика', description:'Минималистичная айдентика с контрастной графикой и строгой типографикой для бренда, которому важны чистота и ясность.', task:'Создать лаконичную айдентику', result:'Запоминаемый визуальный язык', format:'Айдентика'}
        ];
        const portfolioImages=Array.from(document.querySelectorAll('.portfolio-card img')).map(i=>i.src);
        const processImages=Array.from(document.querySelectorAll('.process-photo img')).map(i=>i.src);
        const allImages=[...portfolioImages,...processImages].filter(Boolean);
        const projects=(adminState && Array.isArray(adminState.projects) && adminState.projects.length)
          ? adminState.projects.map(p=>({title:p.title||'Новый проект', category:p.category||'Веб-сайт', description:p.description||'', task:p.task||'', result:p.result||'', format:p.format||'', images:(Array.isArray(p.images)&&p.images.length?p.images:[allImages[0]]).filter(Boolean)}))
          : base.map((p,i)=>({...p, images:[portfolioImages[i]||allImages[0], allImages[(i+1)%allImages.length], allImages[(i+6)%allImages.length]].filter(Boolean)}));
        let currentProject=0,currentImage=0;
        function renderProject(){ const p=projects[currentProject], images=p.images; currentImage=(currentImage+images.length)%images.length; title.textContent=p.title; cat.textContent=p.category; desc.textContent=p.description; task.textContent=p.task; result.textContent=p.result; if(format) format.textContent=p.format; count.textContent=String(currentImage+1).padStart(2,'0')+' / '+String(images.length).padStart(2,'0'); img.classList.remove('loaded'); setTimeout(()=>{img.src=images[currentImage]; img.alt=p.title; img.onload=()=>img.classList.add('loaded'); if(img.complete) img.classList.add('loaded');},30); dots.innerHTML=images.map((_,i)=>`<button type="button" aria-label="Изображение ${i+1}" class="${i===currentImage?'active':''}" data-dot="${i}"></button>`).join(''); }
        function openProject(i){ currentProject=(Number(i)||0+projects.length)%projects.length; currentImage=0; renderProject(); modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
        function closeProject(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
        function moveImage(step){ currentImage+=step; renderProject(); }
        document.querySelectorAll('.hero-collage .project-trigger').forEach(el=>{const fn=(e)=>{e.preventDefault();openProject(el.dataset.project||0)};el.onclick=fn;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){fn(e)}}});
        document.querySelectorAll('.portfolio-card .portfolio-image').forEach(el=>{const fn=(e)=>{e.preventDefault();openProject(el.closest('.portfolio-card')?.dataset.project||0)};el.onclick=fn;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){fn(e)}}});
        modal.querySelector('.carousel-nav.prev').onclick=()=>moveImage(-1); modal.querySelector('.carousel-nav.next').onclick=()=>moveImage(1); dots.onclick=e=>{const b=e.target.closest('[data-dot]'); if(b){currentImage=Number(b.dataset.dot);renderProject();}}; modal.querySelectorAll('[data-modal-close]').forEach(el=>el.onclick=closeProject);
        document.addEventListener('keydown',e=>{ if(!modal.classList.contains('open')) return; if(e.key==='Escape') closeProject(); if(e.key==='ArrowLeft') moveImage(-1); if(e.key==='ArrowRight') moveImage(1); });
      }

      const orderModal=document.getElementById('orderModal'); let activeProduct=null;
      function featuresFromCard(card){ return Array.from(card.querySelectorAll('.fr-feature-box li span:last-child')).map(x=>x.textContent.trim()).filter(Boolean); }
      function openOrder(card){ activeProduct={title:card.querySelector('h3')?.textContent.trim()||'Продукт', price:card.querySelector('.fr-price')?.textContent.trim()||'', subtitle:card.querySelector('.fr-fit')?.textContent.trim()||'', features:featuresFromCard(card)}; document.getElementById('orderTitle').textContent=activeProduct.title; document.getElementById('orderPrice').textContent=activeProduct.price; document.getElementById('orderSubtitle').textContent=activeProduct.subtitle; document.getElementById('orderFeatures').innerHTML=activeProduct.features.map(f=>`<li><span class="feature-glow"><svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span><span>${f}</span></li>`).join(''); document.getElementById('orderName').value=''; document.getElementById('orderComment').value=''; document.getElementById('orderContactValue').value=''; applyMethod('order','telegram'); orderModal.classList.add('open'); document.body.style.overflow='hidden'; setTimeout(()=>document.getElementById('orderName').focus(),50); }
      function closeOrder(){ orderModal.classList.remove('open'); document.body.style.overflow=''; }
      document.querySelectorAll('.fr-select').forEach(btn=>{ btn.onclick=(e)=>{e.preventDefault(); e.stopPropagation(); openOrder(btn.closest('.fr-price-card'));}; });
      if(orderModal){ orderModal.querySelectorAll('[data-order-close]').forEach(el=>el.onclick=closeOrder); }
      async function sendLead(lead){
        try{
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 18000);
          const res=await fetch('send.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lead),signal:controller.signal});
          clearTimeout(timer);
          const data=await res.json().catch(()=>({ok:false,error:'Некорректный ответ send.php'}));
          if(!res.ok || !data.ok) throw new Error(data.error||'send failed');
          if(data.warnings && data.warnings.telegram){
            showToast('Заявка сохранена, но Telegram не отправился. Проверьте .env/бота.');
          } else {
            showToast('Спасибо! Мы свяжемся с вами в ближайшее время.');
          }
          return data;
        }catch(e){
          showToast(e.name==='AbortError' ? 'send.php отвечает слишком долго. Проверьте сервер и Telegram API.' : 'Не удалось отправить заявку: '+(e.message||'ошибка сервера'));
          throw e;
        }
      }
      function buildLead({source, product, name, comment, method, contact}){ const number=0; const channel=method==='phone'?'telegram':method; const message=`Заявка №${number}. ${product}. ${name}, ${comment||'без комментария'}. Метод связи: ${method}. Контакт: ${contact}`; return {number,source,product,name,comment:comment||'',method,contact,channel,status:'Новая',createdAt:new Date().toISOString(),message}; }
      if(orderModal){ document.getElementById('orderForm').onsubmit=async e=>{ e.preventDefault(); const name=document.getElementById('orderName').value.trim(); const comment=document.getElementById('orderComment').value.trim(); const method=selectedMethod('order'); const contact=document.getElementById('orderContactValue').value.trim(); if(!name||!contact){showToast('Заполните имя и контакт.'); return;} const lead=buildLead({source:'Оверлей заказа',product:activeProduct?.title||'Продукт',name,comment,method,contact}); await sendLead(lead); closeOrder(); }; }
      const contactForm=document.getElementById('contactForm'); if(contactForm){ contactForm.addEventListener('submit',async e=>{e.preventDefault(); e.stopImmediatePropagation(); const name=document.getElementById('name')?.value.trim()||'Без имени'; const comment=document.getElementById('message')?.value.trim()||''; const method=selectedMethod('contact'); const contact=document.getElementById('contactMethodValue').value.trim(); if(!contact){showToast('Укажите контакт для связи.'); return;} const lead=buildLead({source:'Форма Готовы начать проект',product:'Консультация',name,comment,method,contact}); await sendLead(lead); contactForm.reset(); applyMethod('contact','telegram');}, true); }
    })();

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
  const isEnglish = document.documentElement.lang === 'en';
  const categoryEn = {'Айдентика':'Identity','Веб-сайт':'Website','Логотип':'Logo','Все':'All'};
  const projectEn = {
    'Eight': {category:'Identity', title:'Eight', description:'A premium condom brand, a MySize sub-brand created for the UAE market. The brand stands out with a restrained and refined presentation that is uncommon for the category.', task:'Create a minimalist identity from scratch without vulgar category clichés.', result:'A logo based on the “8” and infinity symbol, a dark green palette and packaging with linear icons for different product lines.'},
    'Green Design': {category:'Identity', title:'Green Design', description:'A floristry and floral design agency that decorates interiors with fresh flowers, creates bouquets and designs gardens.', task:'Create a visual identity that emphasizes a careful, natural approach to interior greenery.', result:'A visual style that communicates freshness, natural aesthetics and attention to detail.'},
    'Sweet Cherry Caramel': {category:'Identity', title:'Sweet Cherry Caramel', description:'Identity for a confectionery brand: logo, color palette, typography and branded touchpoints. The concept combines a juicy palette with elegant graphics.', task:'Create a recognizable visual image that conveys sweetness, warmth and craft.', result:'Logo, brand book, packaging design, business cards and a consistent visual system.'},
    'Yandex Pet Day': {category:'Website', title:'Yandex Pet Day', description:'Landing page design for a conference about digital products in the pet industry, with a strong visual rhythm and clear event presentation.', task:'Create an image-driven page to present the program, speakers and event value.', result:'A landing page with clear hierarchy, convenient navigation and a memorable visual style.'},
    'Bettico': {category:'Logo', title:'Bettico', description:'An iGaming platform with a style based on dynamic typography and a bold, recognizable sign.', task:'Develop a logo and a basic design system for a digital product in a competitive niche.', result:'Text logo plus symbol, moodboard, color palette and basic visual rules.'},
    'Ковалев': {category:'Logo', title:'Kovalev', description:'Logo and business card design for an electrician. The identity is minimal, clear and easy to apply across print and digital materials.', task:'Create a concise and understandable graphic mark for a personal service brand.', result:'A minimalist two-color logo and a clean business card layout.'},
    'Chillin Tano': {category:'Logo', title:'Chillin Tano', description:'Logo for an inflatable lounger brand built around an ironic character and relaxed summer mood.', task:'Create a charismatic mascot and a memorable logo for the product line.', result:'Illustrative logo and a brand concept with a playful, friendly tone.'},
    'Воскресенская выпечка': {category:'Logo', title:'Voskresenskaya Bakery', description:'Logo for a local bakery with a stylized pastry illustration and a warm handcrafted feeling.', task:'Create a simple and appetizing visual image for a local food brand.', result:'An illustrative logo with custom typography and a cozy visual tone.'},
    'Coffee Mallow': {category:'Identity', title:'Coffee Mallow', description:'Identity for Coffee Mallow, a coffee shop focused on marshmallow desserts and soft, memorable brand experiences.', task:'Create an unusual “marshmallow” image that feels sweet, modern and recognizable.', result:'Bold logo design, icons, color palette and a flexible visual language.'},
    'Колхоз': {category:'Logo', title:'Kolkhoz', description:'Brand identity for a grocery store. The visual solution balances local character with a modern retail feel.', task:'Create a recognizable retail brand for a neighborhood grocery point.', result:'Logo, storefront design, signboard design and branded visual elements.'},
    'Рекламная сеть Яндекса': {category:'Website', title:'Yandex Advertising Network', description:'A page for Yandex’s internet advertising management platform, presenting service features and user benefits.', task:'Present the platform capabilities in a structured, clear and conversion-oriented way.', result:'Clear page structure with forms, feature blocks and a strong product presentation.'},
    'Clubok': {category:'Website', title:'Clubok', description:'Lead-generation landing page for the Clubok travel service with a concept focused on simplicity and quick trip selection.', task:'Create a conversion-focused landing page that explains the offer and collects requests.', result:'A landing page with clear structure, package presentation and an easy path to contact.'}
  };
  function localizeProject(project){ if(!isEnglish || !project) return project; const item = projectEn[project.title] || {}; return {...project, ...item, category:item.category || categoryEn[project.category] || project.category}; }
  function projectById(state, id){ return state.projects.find(p => p.id === id) || state.projects[0]; }
  function renderServerProjects(state){
    if (!state || !Array.isArray(state.projects) || !state.projects.length) return;
    const sourceProjects = state.projects.map(localizeProject);
    serverProjects = sourceProjects;
    const localState = {...state, projects: sourceProjects};
    const hero = document.querySelector('.hero-collage');
    if (hero) {
      const ids = (state.showcaseIds && state.showcaseIds.length ? state.showcaseIds : sourceProjects.slice(0,3).map(p=>p.id)).slice(0,3);
      hero.innerHTML = ids.map(id => { const p = projectById(localState, id); const idx = sourceProjects.indexOf(p); const img = (p.images && p.images[0]) || ''; return `<figure class="project-trigger" data-server-project="${idx}" tabindex="0" role="button" aria-label="${isEnglish ? 'Open project' : 'Открыть проект'} ${esc(p.title)}"><img loading="lazy" src="${esc(img)}" alt="${esc(p.title)}"></figure>`; }).join('');
    }
    const grid = document.querySelector('.portfolio-grid');
    if (grid) {
      const fallbackCat = isEnglish ? 'Website' : 'Веб-сайт';
      grid.classList.remove('loading'); grid.innerHTML = sourceProjects.map((p, i) => `<article class="portfolio-card reveal visible" data-category="${esc(p.category || fallbackCat)}" data-server-project="${i}"><div class="portfolio-image project-trigger" data-server-project="${i}" tabindex="0" role="button" aria-label="${isEnglish ? 'Open project description' : 'Открыть описание проекта'}"><img loading="lazy" src="${esc((p.images && p.images[0]) || '')}" alt="${esc(p.title)}"></div><h3>${esc(p.title)}</h3><p>${esc(p.category || fallbackCat)}</p></article>`).join('');
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
    const active = document.querySelector('.filter.active')?.dataset.filter || (isEnglish ? 'All' : 'Все');
    const isAll = active === 'Все' || active === 'All';
    const cards = Array.from(document.querySelectorAll('.portfolio-card'));
    cards.forEach(card => { const match = isAll || card.dataset.category === active; card.classList.toggle('hidden', !match); card.classList.remove('case-limit-hidden'); });
    const matching = cards.filter(card => isAll || card.dataset.category === active);
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
      preloadImage(images[(serverImageIndex + 1) % images.length]);
      preloadImage(images[(serverImageIndex - 1 + images.length) % images.length]);
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

(() => {
  const esc = (v='') => String(v).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const avatarSvg = (name='') => { const initials = String(name).trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase() || 'C'; return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#1a1a29"/><circle cx="72" cy="24" r="28" fill="#ecf674" opacity=".24"/><text x="50%" y="56%" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#ecf674">${initials}</text></svg>`)}`; };
  function quoteIcon(){return `<svg class="quote-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11H6a4 4 0 0 1 4-4v2a2 2 0 0 0-2 2h2v6H4v-6a6 6 0 0 1 6-6z"/><path d="M20 11h-4a4 4 0 0 1 4-4v2a2 2 0 0 0-2 2h2v6h-6v-6a6 6 0 0 1 6-6z"/></svg>`}
  function trimReviewText(text){
    const full = String(text || '').trim();
    if (full.length <= 150) return esc(full);
    return `${esc(full.slice(0, 150).trim())}... <span class="testimonial-more">дальше</span>`;
  }
  function renderTestimonials(items){
    const root = document.querySelector('.testimonial-grid');
    if(!root || !items || !items.length) return;
    window.__croftonTestimonials = items;
    const cards = items.map((t,i) => `<article class="testimonial reveal visible" data-review-index="${i}" tabindex="0" role="button" aria-label="Открыть полный отзыв">${quoteIcon()}<img loading="lazy" class="testimonial-avatar" src="${esc(t.avatar || avatarSvg(t.author))}" onerror="this.onerror=null;this.src='${avatarSvg(t.author)}'" alt="${esc(t.author)}"><div class="testimonial-body">${t.workType?`<div class="testimonial-work">${esc(t.workType)}</div>`:''}<p>${trimReviewText(t.text)}</p><strong>${esc(t.author)}</strong><span>${esc(t.position)}</span></div></article>`).join('');
    root.innerHTML = `<div class="testimonial-track"><div class="testimonial-loop-group">${cards}</div><div class="testimonial-loop-group" aria-hidden="true">${cards}</div><div class="testimonial-loop-group" aria-hidden="true">${cards}</div><div class="testimonial-loop-group" aria-hidden="true">${cards}</div></div>`;
  }
  fetch('projects_api.php?action=list', {credentials:'same-origin'})
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => { if(data.ok) renderTestimonials(data.testimonials); })
    .catch(() => {
      const existing = Array.from(document.querySelectorAll('.testimonial-grid > .testimonial')).map(card => ({text:card.querySelector('p')?.textContent||'', author:card.querySelector('strong')?.textContent||'', position:card.querySelector('span:not(.testimonial-more)')?.textContent||'', avatar:card.querySelector('img')?.getAttribute('src')||'', workType:card.querySelector('.testimonial-work')?.textContent||''}));
      renderTestimonials(existing);
    });
  const textsRu = {
    privacy: `<h2>Политика конфиденциальности</h2><p>Настоящая Политика описывает, как Crofton обрабатывает данные, которые пользователь оставляет на сайте при отправке заявки.</p><h3>1. Какие данные обрабатываются</h3><ul><li>имя;</li><li>выбранный способ связи и контакт: Telegram, VK, email или телефон;</li><li>комментарий к проекту;</li><li>тип выбранной услуги.</li></ul><h3>2. Цель обработки</h3><p>Данные используются только для связи с пользователем, уточнения задачи, подготовки предложения и ведения заявки.</p><h3>3. Хранение данных</h3><p>Заявки сохраняются на сервере сайта в защищённой административной части. Доступ к ним имеет только администратор Crofton.</p><h3>4. Передача третьим лицам</h3><p>Данные не продаются и не передаются третьим лицам, кроме случаев, необходимых для обработки заявки через подключённые сервисы связи: Telegram, VK и email.</p><h3>5. Удаление данных</h3><p>Пользователь может запросить удаление своих данных, написав на контактный email Crofton.</p>`,
    terms: `<h2>Условия использования</h2><p>Используя сайт Crofton, пользователь соглашается с настоящими условиями.</p><h3>1. Назначение сайта</h3><p>Сайт предназначен для ознакомления с услугами, кейсами, ценами и отправки заявок на дизайн, брендинг и разработку.</p><h3>2. Заявки</h3><p>Отправка формы не является заключением договора. После получения заявки Crofton связывается с пользователем для уточнения задачи, сроков и стоимости.</p><h3>3. Информация на сайте</h3><p>Цены, описания услуг и примеры работ носят информационный характер и могут быть уточнены после брифа.</p><h3>4. Интеллектуальные права</h3><p>Материалы сайта, визуальный стиль, тексты и изображения не могут использоваться без согласия правообладателя.</p><h3>5. Ответственность</h3><p>Crofton не несёт ответственности за невозможность отправки заявки, вызванную сбоями хостинга, браузера или сторонних сервисов связи.</p>`
  };
  const textsEn = {
    privacy: `<h2>Privacy Policy</h2><p>This Policy explains how Crofton processes data that users submit through forms on the website.</p><h3>1. Data we process</h3><ul><li>name;</li><li>selected contact method and contact details: Telegram, VK, email or phone;</li><li>project comment;</li><li>selected service type.</li></ul><h3>2. Purpose of processing</h3><p>The data is used only to contact the user, clarify the task, prepare an offer and manage the request.</p><h3>3. Data storage</h3><p>Requests are stored on the website server in a protected administrative area. Access is limited to the Crofton administrator.</p><h3>4. Disclosure to third parties</h3><p>Data is not sold or transferred to third parties, except when required to process the request through connected communication services: Telegram, VK and email.</p><h3>5. Data deletion</h3><p>The user may request deletion of their data by writing to Crofton’s contact email.</p>`,
    terms: `<h2>Terms of Use</h2><p>By using the Crofton website, the user agrees to these terms.</p><h3>1. Website purpose</h3><p>The website is intended to present services, cases, pricing and to receive requests for design, branding and development.</p><h3>2. Requests</h3><p>Submitting a form does not constitute a contract. After receiving a request, Crofton contacts the user to clarify the task, timeline and cost.</p><h3>3. Website information</h3><p>Prices, service descriptions and examples of work are informational and may be clarified after the brief.</p><h3>4. Intellectual property</h3><p>Website materials, visual style, texts and images may not be used without the rights holder’s consent.</p><h3>5. Liability</h3><p>Crofton is not responsible for inability to submit a request caused by hosting, browser or third-party communication service failures.</p>`
  };
  const texts = document.documentElement.lang === 'en' ? textsEn : textsRu;
  const modal = document.getElementById('legalModal'); const content = document.getElementById('legalContent');
  function openLegal(type){ if(!modal||!content) return; content.innerHTML = texts[type] || texts.privacy; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeLegal(){ if(!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  document.querySelectorAll('.legal a').forEach(a => { const txt = a.textContent.toLowerCase(); a.addEventListener('click', e => { e.preventDefault(); openLegal(txt.includes('услов') ? 'terms' : 'privacy'); }); });
  document.querySelectorAll('[data-legal-close]').forEach(el => el.addEventListener('click', closeLegal));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal?.classList.contains('open')) closeLegal(); });
})();

(() => {
  function digits(v){return String(v||'').replace(/\D/g,'')}
  function formatPhone(v){let d=digits(v); if(d[0]==='8') d='7'+d.slice(1); if(d[0]!=='7') d='7'+d; d=d.slice(0,11); let out='+7'; if(d.length>1) out+=' ('+d.slice(1,4); if(d.length>=4) out+=') '+d.slice(4,7); if(d.length>=7) out+='-'+d.slice(7,9); if(d.length>=9) out+='-'+d.slice(9,11); return out;}
  function validPhone(v){let d=digits(v); if(d[0]==='8') d='7'+d.slice(1); return d.length===11 && d[0]==='7';}
  function currentMethod(scope){return document.querySelector(`[data-method-scope="${scope}"] .method-btn.active`)?.dataset.method || 'telegram'}
  function phoneToast(input){const toast=document.getElementById('toast'); const msg='Введите корректный номер телефона.'; if(toast){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200)}else alert(msg); input.focus();}
  ['orderContactValue','contactMethodValue'].forEach(id=>{const input=document.getElementById(id); if(!input)return; input.addEventListener('input',()=>{const scope=id==='orderContactValue'?'order':'contact'; if(currentMethod(scope)==='phone') input.value=formatPhone(input.value);});});
  document.addEventListener('submit',e=>{const form=e.target; if(form?.id==='orderForm'){const input=document.getElementById('orderContactValue'); if(currentMethod('order')==='phone'&&!validPhone(input.value)){e.preventDefault();e.stopImmediatePropagation();phoneToast(input);}} if(form?.id==='contactForm'){const input=document.getElementById('contactMethodValue'); if(currentMethod('contact')==='phone'&&!validPhone(input.value)){e.preventDefault();e.stopImmediatePropagation();phoneToast(input);}}},true);
})();

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


(() => {
  const marquee = document.querySelector('.hero-marquee');
  const track = marquee?.querySelector('.hero-marquee-track');
  const group = track?.querySelector('.hero-marquee-group');
  if (!marquee || !track || !group || track.dataset.heroStableMarqueeReady) return;
  track.dataset.heroStableMarqueeReady = '1';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let offset = 0;
  let last = performance.now();
  const speed = 42;

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const width = group.getBoundingClientRect().width || 1;
    offset -= speed * dt;
    if (offset <= -width) offset += width;
    track.style.transform = `translate3d(${offset}px,0,0)`;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

(() => {
  const email = ['ivan.crofton', 'yandex.ru'].join('@');
  document.querySelectorAll('[data-email-link]').forEach(link => {
    link.href = `mailto:${email}`;
    link.setAttribute('aria-label', email);
    const text = link.querySelector('[data-email-text]');
    if (text) text.textContent = email;
  });
})();

(() => {
  const stage = document.querySelector('.about-aww__stage');
  if (!stage || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = Array.from(stage.querySelectorAll('.about-card'));
  let raf = 0;
  stage.addEventListener('pointermove', (event) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const radius = 360;
        const power = Math.max(0, 1 - distance / radius);
        const direction = index % 2 ? 1 : -1;
        const moveX = (-dx / distance) * power * 24 * direction;
        const moveY = (-dy / distance) * power * 18;
        card.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
      });
      raf = 0;
    });
  }, { passive: true });
  stage.addEventListener('pointerleave', () => {
    cards.forEach(card => { card.style.transform = ''; });
  });
})();

(() => {
  if (document.documentElement.lang !== 'en') return;

  const categoryMap = {'Айдентика':'Identity','Веб-сайт':'Website','Логотип':'Logo','Все':'All'};
  const titleMap = {
    'Ковалев':'Kovalev',
    'Воскресенская выпечка':'Voskresenskaya Bakery',
    'Колхоз':'Kolkhoz',
    'Рекламная сеть Яндекса':'Yandex Advertising Network'
  };
  const trText = (value='') => titleMap[String(value).trim()] || categoryMap[String(value).trim()] || value;

  function setText(el, value) {
    if (el && el.textContent !== value) el.textContent = value;
  }

  function translatePortfolio() {
    document.querySelectorAll('.portfolio-card').forEach(card => {
      const cat = card.dataset.category;
      if (categoryMap[cat]) card.dataset.category = categoryMap[cat];
      const title = card.querySelector('h3');
      const meta = card.querySelector('p');
      if (title) setText(title, trText(title.textContent));
      if (meta) setText(meta, trText(meta.textContent));
    });
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    if (modalCategory) setText(modalCategory, trText(modalCategory.textContent));
    if (modalTitle) setText(modalTitle, trText(modalTitle.textContent));
  }

  let scheduled = false;
  const scheduleTranslate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      translatePortfolio();
    });
  };

  const grid = document.querySelector('.portfolio-grid');
  if (grid) {
    new MutationObserver(scheduleTranslate).observe(grid, {childList:true, subtree:true});
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-server-project], .project-trigger, .portfolio-card')) {
      setTimeout(translatePortfolio, 80);
    }
  }, true);

  scheduleTranslate();
  setTimeout(translatePortfolio, 500);
  setTimeout(translatePortfolio, 1500);
})();
