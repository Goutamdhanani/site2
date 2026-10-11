const menuButton=document.querySelector('.menu-toggle');
const mobileNav=document.querySelector('#mobile-nav');
const navigation=document.querySelector('.notch-nav');
let pinnedMenu=false;
function setMenu(open){navigation?.classList.toggle('open',open);if(!menuButton||!mobileNav)return;mobileNav.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
function closeMenu(){pinnedMenu=false;setMenu(false);}
menuButton?.addEventListener('click',()=>{pinnedMenu=!pinnedMenu;setMenu(pinnedMenu);});
navigation?.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&innerWidth>700)setMenu(true);});
navigation?.addEventListener('pointerleave',()=>{if(!pinnedMenu&&!navigation.contains(document.activeElement))setMenu(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menuButton?.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.notch-nav'))closeMenu();});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let smoothScroll=null, smoothFrame=0;
async function configureSmoothScroll(){
 if(reduced.matches){smoothScroll?.destroy();smoothScroll=null;cancelAnimationFrame(smoothFrame);return;}
 if(smoothScroll||!matchMedia('(pointer:fine)').matches)return;
 try{const {default:Lenis}=await import('/studio/smooth.mjs');if(reduced.matches)return;
 smoothScroll=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false});
 const tick=t=>{smoothFrame=0;if(!smoothScroll||document.hidden)return;smoothScroll.raf(t);smoothFrame=requestAnimationFrame(tick);};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(smoothFrame);smoothFrame=0;}else if(!smoothFrame&&smoothScroll)smoothFrame=requestAnimationFrame(tick);});
 smoothFrame=requestAnimationFrame(tick);
 }catch{/* Native scrolling remains available if the enhancement cannot load. */}
}
configureSmoothScroll();reduced.addEventListener('change',configureSmoothScroll);
const clock=()=>document.querySelectorAll('.local-time').forEach(el=>{el.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(new Date());});clock();setInterval(clock,30000);

// Keep the content readable before JavaScript runs; enhance its reading rhythm on scroll.
const wordBlocks=[...document.querySelectorAll('.scroll-words')];
wordBlocks.forEach(block=>{const text=block.textContent;block.textContent='';text.split(/\s+/).forEach((word,i)=>{if(i)block.append(' ');const span=document.createElement('span');span.textContent=word;block.append(span);});});
const scenes=[...document.querySelectorAll('.project-scene')];
const reel=document.querySelector('.expanding-reel');
const rolls=[...document.querySelectorAll('.roll-row')];
let scrollPending=false;
function scrollEffects(){
 scrollPending=false;const h=innerHeight;
 for(const block of wordBlocks){const r=block.getBoundingClientRect();const amount=Math.max(0,Math.min(1,(h*.8-r.top)/(r.height+h*.15)));[...block.children].forEach((word,i)=>word.classList.toggle('read',reduced.matches||i<amount*block.children.length));}
 rolls.forEach(row=>{const r=row.getBoundingClientRect();row.classList.toggle('current',r.top<h*.65&&r.bottom>h*.25);});
 if(reel){const r=reel.getBoundingClientRect();const p=Math.max(0,Math.min(1,(h-r.top)/(h*.75)));reel.style.setProperty('--reel-scale',reduced.matches?1:.62+p*.38);}
 for(const scene of scenes){const r=scene.getBoundingClientRect();if(r.top>h||r.bottom<0)continue;const leave=Math.max(0,Math.min(1,(h-r.bottom)/h));scene.style.setProperty('--scene-scale',reduced.matches?1:1-leave*.14);scene.style.setProperty('--parallax',reduced.matches?'0px':`${Math.max(-22,Math.min(22,-r.top*.04))}px`);}
}
function requestScroll(){if(!scrollPending){scrollPending=true;requestAnimationFrame(scrollEffects);}}
addEventListener('scroll',requestScroll,{passive:true});addEventListener('resize',requestScroll);reduced.addEventListener('change',requestScroll);scrollEffects();

// Restrained liquid-light cursor, drawn locally without a video or external runtime.
const canvas=document.querySelector('.ink-canvas');
if(canvas&&!reduced.matches){
 const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,frame=0,visible=true,points=[],last=0,activePointer=0;
 function size(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 function addPoint(x,y,auto=false){points.push({x,y,age:0,auto,seed:Math.random()*Math.PI*2});if(points.length>130)points.shift();}
 canvas.parentElement.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();activePointer=performance.now();addPoint(e.clientX-r.left,e.clientY-r.top);},{passive:true});
 canvas.parentElement.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();activePointer=performance.now();addPoint(e.clientX-r.left,e.clientY-r.top);},{passive:true});
 function draw(t){frame=0;if(!visible||document.hidden||reduced.matches)return;const dt=Math.min(32,t-(last||t));last=t;ctx.clearRect(0,0,w,h);
  if(t-activePointer>2500){const u=t*.0006;addPoint(w*(.53+.13*Math.sin(u)),h*(.47+.30*Math.cos(u*.79)),true);}
  points=points.filter(p=>p.age<2400);points.forEach(p=>{p.age+=dt;p.x+=Math.sin(p.seed+p.age*.002)*dt*.008;p.y-=dt*.007;});
  for(let layer=3;layer>=0;layer--){ctx.lineWidth=layer===0?1.1:layer*5;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowBlur=layer*8;ctx.shadowColor='#789ed5';
   for(let i=2;i<points.length;i++){const a=points[i-2],b=points[i-1],c=points[i];if(Math.hypot(c.x-b.x,c.y-b.y)>120)continue;const opacity=Math.max(0,1-b.age/2400)*(b.auto?.045:.48)/(layer+1);ctx.strokeStyle=`rgba(154,189,230,${opacity})`;ctx.beginPath();ctx.moveTo((a.x+b.x)/2,(a.y+b.y)/2);ctx.quadraticCurveTo(b.x,b.y,(b.x+c.x)/2,(b.y+c.y)/2);ctx.stroke();}
  }ctx.shadowBlur=0;frame=requestAnimationFrame(draw);
 }
 function resume(){if(!frame&&visible&&!document.hidden&&!reduced.matches){last=0;frame=requestAnimationFrame(draw);}}
 size();new ResizeObserver(size).observe(canvas.parentElement);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else resume();}).observe(canvas);document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0;ctx.clearRect(0,0,w,h);}else resume();});resume();
}
const cursor=document.querySelector('.project-cursor');
document.addEventListener('pointermove',e=>{if(!cursor||e.pointerType!=='mouse')return;cursor.style.transform=`translate(${e.clientX+14}px,${e.clientY+14}px)`;cursor.style.opacity=e.target.closest('.scene-link')?'1':'0';},{passive:true});

// Horizontal work index: wheel, touch scrolling, mouse drag, and keyboard controls.
const gallery=document.querySelector('.gallery-track');
if(gallery){
 gallery.setAttribute('data-lenis-prevent','');
 const cards=[...gallery.querySelectorAll('.gallery-card')];let startX=0,startScroll=0,dragging=false,moved=false;
 const step=()=>cards[0].getBoundingClientRect().width+(innerWidth<=700?20:40);
 const move=d=>gallery.scrollBy({left:d*step(),behavior:reduced.matches?'instant':'smooth'});
 document.querySelector('[data-gallery-prev]').addEventListener('click',()=>move(-1));document.querySelector('[data-gallery-next]').addEventListener('click',()=>move(1));
 gallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
 gallery.addEventListener('scroll',()=>{const index=Math.min(cards.length,Math.round(gallery.scrollLeft/step())+1);document.querySelector('.gallery-count').textContent=String(index).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');},{passive:true});
 gallery.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;const atStart=gallery.scrollLeft<1,atEnd=gallery.scrollLeft+gallery.clientWidth>=gallery.scrollWidth-2;if((e.deltaY<0&&atStart)||(e.deltaY>0&&atEnd))return;e.preventDefault();gallery.scrollLeft+=e.deltaY;},{passive:false});
 gallery.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;dragging=true;moved=false;startX=e.clientX;startScroll=gallery.scrollLeft;});
 gallery.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-startX;if(Math.abs(dx)>6){moved=true;gallery.classList.add('dragging');gallery.setPointerCapture(e.pointerId);gallery.scrollLeft=startScroll-dx;}});
 const finish=()=>{dragging=false;gallery.classList.remove('dragging');};gallery.addEventListener('pointerup',finish);gallery.addEventListener('pointercancel',finish);gallery.addEventListener('lostpointercapture',finish);gallery.addEventListener('dragstart',e=>e.preventDefault());gallery.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false;}},true);
}
const transition=document.querySelector('.page-transition');
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||!smoothScroll||e.defaultPrevented||e.ctrlKey||e.metaKey||a.target)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));if(!target)return;e.preventDefault();closeMenu();history.pushState(null,'',url.href);smoothScroll.scrollTo(target,{offset:-60,onComplete:()=>{if(target.id==='main')target.focus({preventScroll:true});}});});
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||!/^https?:$/.test(url.protocol)||url.pathname===location.pathname||reduced.matches)return;e.preventDefault();transition?.classList.add('leaving');setTimeout(()=>location.assign(url.href),320);});
addEventListener('pageshow',()=>transition?.classList.remove('leaving'));
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
 const routes={'#portfolio':'/work/','#process':'/services/','#demo':'/contact/','#services-page':'/services/','#services':'/services/','#admin':'/legacy/#admin','#analytics':'/legacy/#analytics'};
 if(routes[location.hash])location.replace(routes[location.hash]);
}
