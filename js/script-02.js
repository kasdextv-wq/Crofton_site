(() => {
      const TG='https://t.me/EvanCrofton', VK='https://vk.com/ivancrofton', EMAIL='ivan.crofton@yandex.ru';
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

      // Project overlay: fixed size, one project = one description + its own image carousel
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
          const res=await fetch('send.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lead)});
          const data=await res.json().catch(()=>({ok:false}));
          if(!res.ok || !data.ok) throw new Error(data.error||'send failed');
          showToast('Спасибо! Мы свяжемся с вами в ближайшее время.');
        }catch(e){
          showToast('Не удалось отправить заявку на сервер. Проверьте PHP/send.php.');
        }
      }
      function buildLead({source, product, name, comment, method, contact}){ const number=0; const channel=method==='phone'?'telegram':method; const message=`Заявка №${number}. ${product}. ${name}, ${comment||'без комментария'}. Метод связи: ${method}. Контакт: ${contact}`; return {number,source,product,name,comment:comment||'',method,contact,channel,status:'Новая',createdAt:new Date().toISOString(),message}; }
      if(orderModal){ document.getElementById('orderForm').onsubmit=async e=>{ e.preventDefault(); const name=document.getElementById('orderName').value.trim(); const comment=document.getElementById('orderComment').value.trim(); const method=selectedMethod('order'); const contact=document.getElementById('orderContactValue').value.trim(); if(!name||!contact){showToast('Заполните имя и контакт.'); return;} const lead=buildLead({source:'Оверлей заказа',product:activeProduct?.title||'Продукт',name,comment,method,contact}); await sendLead(lead); closeOrder(); }; }
      const contactForm=document.getElementById('contactForm'); if(contactForm){ contactForm.addEventListener('submit',async e=>{e.preventDefault(); e.stopImmediatePropagation(); const name=document.getElementById('name')?.value.trim()||'Без имени'; const comment=document.getElementById('message')?.value.trim()||''; const method=selectedMethod('contact'); const contact=document.getElementById('contactMethodValue').value.trim(); if(!contact){showToast('Укажите контакт для связи.'); return;} const lead=buildLead({source:'Форма Готовы начать проект',product:'Консультация',name,comment,method,contact}); await sendLead(lead); contactForm.reset(); applyMethod('contact','telegram');}, true); }
    })();
