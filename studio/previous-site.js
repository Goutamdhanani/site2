const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { if (!menuButton || !mobileNav) return; mobileNav.hidden=true; menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open navigation'); }
menuButton?.addEventListener('click',()=>{ const open=menuButton.getAttribute('aria-expanded')!=='true'; menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation'); mobileNav.hidden=!open; });
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && menuButton?.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();} });
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
matchMedia('(min-width:801px)').addEventListener('change',closeMenu);

const filters=[...document.querySelectorAll('[data-filter]')];
filters.forEach(button=>button.addEventListener('click',()=>{let count=0;filters.forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='All'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++;});const live=document.querySelector('#filter-result');if(live)live.textContent=`Showing ${count} ${count===1?'project':'projects'}.`;}));

const form=document.querySelector('#contact-form');
if(form){
 const subject=new URLSearchParams(location.search).get('subject');
 if(subject && [...form.elements.subject.options].some(o=>o.value===subject))form.elements.subject.value=subject;
 const output=document.querySelector('#form-status');
 const getValues=()=>Object.fromEntries(new FormData(form).entries());
 document.querySelector('#email-draft').addEventListener('click',()=>{if(!form.reportValidity())return;const v=getValues();const body=`Name: ${v.name}\nEmail: ${v.email}\n\n${v.message}`;location.href=`mailto:goutamdhanani@gmail.com?subject=${encodeURIComponent('Oddwebs enquiry — '+v.subject)}&body=${encodeURIComponent(body)}`;output.textContent='Your email app has been requested. Review and send the draft there; nothing has been sent by this website.';});
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('[type="submit"]');button.disabled=true;output.textContent='Sending your enquiry…';try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(getValues()),signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok||result.success!==true)throw new Error('Not delivered');output.textContent='Your enquiry was accepted by our email provider. Thank you—we’ll reply to the address you provided.';form.reset();}catch{output.textContent='Your enquiry could not be confirmed. Your message is still here. Use “Open in email” or email goutamdhanani@gmail.com directly.';}finally{button.disabled=false;}});
}

// Keep old public hash links useful after moving to crawlable page URLs.
if(location.pathname==='/'){
 const routes={'#portfolio':'/work/','#about':'/about/','#process':'/services/','#demo':'/contact/','#services-page':'/services/','#services':'/services/','#work':'/work/','#admin':'/legacy/#admin','#analytics':'/legacy/#analytics'};
 if(routes[location.hash])location.replace(routes[location.hash]);
}
