/* ALL Create by LamberthRumpaidus
 * Progressive enhancement: GSAP+Lenis, FLIP-like case transitions, cursor,
 * mechanical shell SFX and animation accessibility.
 */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(hover: hover) and (pointer: fine)');
let lenis=null, gsapActive=false;
function scrollMotion(){
 // Use native mouse-wheel, touch and keyboard scrolling for consistent behavior.
 // Only animate short offsets; avoid competing CSS, Lenis, and GSAP transforms.
 const G=window.gsap,ST=window.ScrollTrigger;
 if(reduce.matches||!G||!ST)return;
 try{
   G.registerPlugin(ST);
   const words=$$('#heroHeading > span,#heroHeading > em');
   if(words.length)G.fromTo(words,{y:18,opacity:.94},{y:0,opacity:1,duration:.8,stagger:.11,ease:'power2.out',clearProps:'transform,opacity'});
   const docs=$('#documentationTitle');
   if(docs)G.fromTo(docs,{y:15,opacity:.92},{y:0,opacity:1,duration:.75,ease:'power2.out',scrollTrigger:{trigger:docs,start:'top 92%',once:true},clearProps:'transform,opacity'});
 }catch(e){console.warn('Scroll enhancement fallback:',e)}
}
function magnetic(){
 if(!fine.matches||reduce.matches)return;
 const ring=document.createElement('div');ring.className='creative-cursor';ring.setAttribute('aria-hidden','true');document.body.append(ring);
 let x=-100,y=-100,tx=-100,ty=-100,active=false,raf=0;
 document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;tx=e.clientX;ty=e.clientY;if(!raf)raf=requestAnimationFrame(draw)},{passive:true});
 function draw(){raf=0;x+=(tx-x)*.27;y+=(ty-y)*.27;ring.style.transform='translate3d('+x+'px,'+y+'px,0) translate(-50%,-50%)';if(Math.abs(x-tx)+Math.abs(y-ty)>.5)raf=requestAnimationFrame(draw)}
 const targets='.hero-primary,.hero-explore,.lock-action,.doc-launch,.form-send';
 document.addEventListener('pointerover',e=>{if(e.target.closest(targets)){ring.classList.add('is-active');active=true}});
 document.addEventListener('pointerout',e=>{if(e.target.closest(targets)){ring.classList.remove('is-active');active=false}});
 document.addEventListener('pointermove',e=>{
   const el=e.target.closest(targets);if(!el)return;
   const r=el.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
   el.style.setProperty('--mag-x',(dx*.09).toFixed(2)+'px');
   el.style.setProperty('--mag-y',(dy*.09).toFixed(2)+'px');
 },{passive:true});
 document.addEventListener('pointerout',e=>{const el=e.target.closest(targets);if(el&&!el.contains(e.relatedTarget)){el.style.setProperty('--mag-x','0px');el.style.setProperty('--mag-y','0px')}});
}
function transitions(){
 const curtain=document.createElement('div');curtain.className='creative-curtain';curtain.setAttribute('aria-hidden','true');document.body.append(curtain);
 document.addEventListener('click',event=>{
   const button=event.target.closest('[data-project],[data-docs]');
   if(!button)return;
   const project=button.dataset.project,docs=button.dataset.docs;
   // No dark curtain while opening the documentation: the paper itself provides its transition.
   if(docs)return;
   const handler=project?window.portfolioOpenProject:window.openProjectDocumentation;
   if(typeof handler!=='function')return;
   event.preventDefault();event.stopImmediatePropagation();
   const source=button.closest('.project-card,.feature-card')?.querySelector('.project-visual img');
   let destination=null;
   const open=()=>{
     if(source)source.style.viewTransitionName='';
     handler(project||docs);
     destination=$('#dialogContent .case-hero img');
     if(project&&destination)destination.style.viewTransitionName='case-study-preview';
   };
   if(!reduce.matches&&document.startViewTransition){
     if(project&&source)source.style.viewTransitionName='case-study-preview';
     curtain.classList.add('is-transitioning');
     try{
       const vt=document.startViewTransition(open);
       vt.finished.catch(()=>{}).finally(()=>{
         if(source)source.style.viewTransitionName='';
         if(destination)destination.style.viewTransitionName='';
         curtain.classList.remove('is-transitioning');
       });
     }catch{curtain.classList.remove('is-transitioning');open()}
   }else{
     if(!reduce.matches){curtain.classList.add('is-transitioning');setTimeout(()=>curtain.classList.remove('is-transitioning'),560)}
     open();
   }
 },true);
}
function shell(){
 const terminal=$('.terminal'),form=$('#terminalForm'),out=$('#terminalDisplay');
 const announce=document.createElement('span');announce.className='sr-only';announce.setAttribute('role','status');announce.setAttribute('aria-live','polite');terminal?.append(announce);
 if(!terminal||!form)return;
 const header=$('.terminal-top',terminal);
 const toggle=document.createElement('button');toggle.type='button';toggle.className='shell-sound-toggle';toggle.textContent='SFX OFF';toggle.setAttribute('aria-pressed','false');toggle.setAttribute('aria-label','Aktifkan suara ketikan terminal');header.append(toggle);
 let enabled=false,ctx=null,lastClick=0;
 toggle.addEventListener('click',()=>{
   enabled=!enabled;toggle.textContent=enabled?'SFX ON':'SFX OFF';toggle.setAttribute('aria-pressed',String(enabled));
   if(enabled){const C=window.AudioContext||window.webkitAudioContext;try{if(C){ctx??=new C();ctx.resume()}}catch{}}
 });
 const input=$('#terminalCommand');
 input?.addEventListener('keydown',e=>{
   if(!enabled||reduce.matches||e.repeat||e.key.length!==1||!ctx||performance.now()-lastClick<48)return;
   lastClick=performance.now();
   try{const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
     osc.type='triangle';osc.frequency.setValueAtTime(190,now);
     osc.frequency.exponentialRampToValueAtTime(83,now+.028);
     gain.gain.setValueAtTime(.013,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.035);
     osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+.036);
   }catch{}
 });
 window.addEventListener('portfolio:shell-output',e=>{
   if(reduce.matches||!out)return;
   const el=e.detail?.element,full=e.detail?.text;
   if(!el||typeof full!=='string'||full.length>650)return;
   el.textContent='';el.classList.add('shell-typing');out.setAttribute('aria-live','off');
   let pos=0;function update(){if(!el.isConnected)return;pos=Math.min(full.length,pos+Math.max(2,Math.ceil(full.length/28)));el.textContent=full.slice(0,pos)+(pos<full.length?'▋':'');out.scrollTop=out.scrollHeight;
     if(pos<full.length)requestAnimationFrame(update);else{el.classList.remove('shell-typing');out.setAttribute('aria-live','polite');announce.textContent=full}
   }requestAnimationFrame(update);
 });
}
scrollMotion();transitions();shell();
window.addEventListener('beforeunload',()=>lenis?.destroy());
})();