(() => {
  function digits(v){return String(v||'').replace(/\D/g,'')}
  function formatPhone(v){let d=digits(v); if(d[0]==='8') d='7'+d.slice(1); if(d[0]!=='7') d='7'+d; d=d.slice(0,11); let out='+7'; if(d.length>1) out+=' ('+d.slice(1,4); if(d.length>=4) out+=') '+d.slice(4,7); if(d.length>=7) out+='-'+d.slice(7,9); if(d.length>=9) out+='-'+d.slice(9,11); return out;}
  function validPhone(v){let d=digits(v); if(d[0]==='8') d='7'+d.slice(1); return d.length===11 && d[0]==='7';}
  function currentMethod(scope){return document.querySelector(`[data-method-scope="${scope}"] .method-btn.active`)?.dataset.method || 'telegram'}
  ['orderContactValue','contactMethodValue'].forEach(id=>{const input=document.getElementById(id); if(!input)return; input.addEventListener('input',()=>{const scope=id==='orderContactValue'?'order':'contact'; if(currentMethod(scope)==='phone') input.value=formatPhone(input.value);});});
  document.addEventListener('submit',e=>{const form=e.target; if(form?.id==='orderForm'){const input=document.getElementById('orderContactValue'); if(currentMethod('order')==='phone'&&!validPhone(input.value)){e.preventDefault();e.stopImmediatePropagation();alert('Введите корректный номер телефона.'); input.focus();}} if(form?.id==='contactForm'){const input=document.getElementById('contactMethodValue'); if(currentMethod('contact')==='phone'&&!validPhone(input.value)){e.preventDefault();e.stopImmediatePropagation();alert('Введите корректный номер телефона.'); input.focus();}}},true);
})();
