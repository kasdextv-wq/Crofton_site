(() => {
  const esc = (v='') => String(v).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
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
    const cards = items.map((t,i) => `<article class="testimonial reveal visible" data-review-index="${i}" tabindex="0" role="button" aria-label="Открыть полный отзыв">${quoteIcon()}${t.avatar?`<img loading="lazy" class="testimonial-avatar" src="${esc(t.avatar)}" alt="${esc(t.author)}">`:''}<div class="testimonial-body">${t.workType?`<div class="testimonial-work">${esc(t.workType)}</div>`:''}<p>${trimReviewText(t.text)}</p><strong>${esc(t.author)}</strong><span>${esc(t.position)}</span></div></article>`).join('');
    root.innerHTML = `<div class="testimonial-track"><div class="testimonial-loop-group">${cards}</div><div class="testimonial-loop-group" aria-hidden="true">${cards}</div></div>`;
  }
  fetch('projects_api.php?action=list', {credentials:'same-origin'})
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => { if(data.ok) renderTestimonials(data.testimonials); })
    .catch(() => {
      const existing = Array.from(document.querySelectorAll('.testimonial-grid > .testimonial')).map(card => ({text:card.querySelector('p')?.textContent||'', author:card.querySelector('strong')?.textContent||'', position:card.querySelector('span')?.textContent||''}));
      renderTestimonials(existing);
    });
  const texts = {
    privacy: `<h2>Политика конфиденциальности</h2><p>Настоящая Политика описывает, как Crofton обрабатывает данные, которые пользователь оставляет на сайте при отправке заявки.</p><h3>1. Какие данные обрабатываются</h3><ul><li>имя;</li><li>выбранный способ связи и контакт: Telegram, VK, email или телефон;</li><li>комментарий к проекту;</li><li>тип выбранной услуги.</li></ul><h3>2. Цель обработки</h3><p>Данные используются только для связи с пользователем, уточнения задачи, подготовки предложения и ведения заявки.</p><h3>3. Хранение данных</h3><p>Заявки сохраняются на сервере сайта в защищённой административной части. Доступ к ним имеет только администратор Crofton.</p><h3>4. Передача третьим лицам</h3><p>Данные не продаются и не передаются третьим лицам, кроме случаев, необходимых для обработки заявки через подключённые сервисы связи: Telegram, VK и email.</p><h3>5. Удаление данных</h3><p>Пользователь может запросить удаление своих данных, написав на контактный email Crofton.</p>`,
    terms: `<h2>Условия использования</h2><p>Используя сайт Crofton, пользователь соглашается с настоящими условиями.</p><h3>1. Назначение сайта</h3><p>Сайт предназначен для ознакомления с услугами, кейсами, ценами и отправки заявок на дизайн, брендинг и разработку.</p><h3>2. Заявки</h3><p>Отправка формы не является заключением договора. После получения заявки Crofton связывается с пользователем для уточнения задачи, сроков и стоимости.</p><h3>3. Информация на сайте</h3><p>Цены, описания услуг и примеры работ носят информационный характер и могут быть уточнены после брифа.</p><h3>4. Интеллектуальные права</h3><p>Материалы сайта, визуальный стиль, тексты и изображения не могут использоваться без согласия правообладателя.</p><h3>5. Ответственность</h3><p>Crofton не несёт ответственности за невозможность отправки заявки, вызванную сбоями хостинга, браузера или сторонних сервисов связи.</p>`
  };
  const modal = document.getElementById('legalModal'); const content = document.getElementById('legalContent');
  function openLegal(type){ if(!modal||!content) return; content.innerHTML = texts[type] || texts.privacy; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeLegal(){ if(!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  document.querySelectorAll('.legal a').forEach(a => { const txt = a.textContent.toLowerCase(); a.addEventListener('click', e => { e.preventDefault(); openLegal(txt.includes('услов') ? 'terms' : 'privacy'); }); });
  document.querySelectorAll('[data-legal-close]').forEach(el => el.addEventListener('click', closeLegal));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal?.classList.contains('open')) closeLegal(); });
})();
