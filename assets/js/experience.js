/* ALL Create by LamberthRumpaidus — Documentation "deploy" is a visual assembly sequence; it does not publish code. */
(()=>{'use strict';
const $$=(s,r=document)=>[...r.querySelectorAll(s)],$=(s,r=document)=>r.querySelector(s);
const projects=window.PORTFOLIO_PROJECTS||[];
const d=$('#deployDialog'), workspace=$('#deployWorkspace'), result=$('#deployResult'), documentPanel=$('#deployDocument'), selector=$('#documentationProject');
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let active=0,timers=[],runID=0,lastFocus=null;

/* Documentation now reveals real project text incrementally, rather than flashing abstract layers. */
const durations=[3500,5000,5500,5200],allDuration=durations.reduce((x,y)=>x+y,0);
const docParts=[
 {heading:'MEMUAT SUMBER',value:p=>p.title+' — '+p.type+'\nTeknologi: '+(p.stack||[]).join(', '),terminal:'SOURCE LOADED'},
 {heading:'MENGANALISIS TANTANGAN',value:p=>content(p,'problem'),terminal:'PROBLEM ANALYSIS'},
 {heading:'MENYUSUN PENDEKATAN',value:p=>content(p,'approach'),terminal:'METHOD ASSEMBLY'},
 {heading:'MERANGKUM HASIL',value:p=>content(p,'outcome')+'\n\nRefleksi: '+content(p,'reflection'),terminal:'FINAL DOCUMENT'}
];
let frameId=0;
function showProgress(p,time){
 let since=0,index=docParts.length-1,ratio=1;
 for(let i=0;i<durations.length;i++){if(time<since+durations[i]){index=i;ratio=(time-since)/durations[i];break}since+=durations[i]}
 const part=docParts[index],full=String(part.value(p)),count=Math.round(full.length*Math.min(1,ratio*1.28));
 workspace.dataset.phase=String(index);
 $('#deployStageNumber').textContent=String(index+1).padStart(2,'0');
 $('#deployClock').textContent=part.terminal;
 $('#docBuildTopic').textContent=part.heading;
 $('#deployPhase').textContent=part.heading;
 $('#docBuildText').textContent=full.slice(0,count)+(ratio<.8?'▍':'');
 $('#docBuildSkeleton').style.opacity=String(1-Math.min(1,ratio*1.7));
 const percent=Math.min(100,Math.floor(100*time/allDuration));
 $('#deployPercent').textContent=percent+'%';
 $('#deployProgressBar').style.width=percent+'%';
 $('[data-deploy-step]').forEach((x,i)=>x.classList.toggle('is-active',i<=index));
 const log=$('#docBuildLines');log.replaceChildren();
 for(let i=0;i<index;i++){const el=document.createElement('p');el.textContent='✓ '+docParts[i].heading;el.className='doc-log-complete';log.append(el)}
 const row=document.createElement('p');row.textContent='→ '+part.heading;row.className='doc-log-active';log.append(row);
}

const steps=[
  {label:'Memuat sumber dan metadata proyek',terminal:'SOURCE LOADER',pct:16},
  {label:'Menyusun lapisan arsitektur dan media',terminal:'STRUCTURE MAP',pct:43},
  {label:'Membangun halaman studi kasus',terminal:'DOCUMENT BUILDER',pct:76},
  {label:'Menyiapkan dokumentasi untuk dibaca',terminal:'READY TO OPEN',pct:100}
];
function getLang(){return document.documentElement.lang==='en'?'en':'id'}
const content=(p,k)=>getLang()==='en'&&p.en?.[k]?p.en[k]:p[k];
function clearTimers(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(frameId);frameId=0;runID++}
function schedule(fn,delay){timers.push(setTimeout(fn,delay))}
function phase(i){const s=steps[i];workspace.dataset.phase=String(i);$('#deployStageNumber').textContent='0'+(i+1);$('#deployClock').textContent=s.terminal;$('#deployPhase').textContent=s.label;$('#deployPercent').textContent=s.pct+'%';$('#deployProgressBar').style.width=s.pct+'%';$$('[data-deploy-step]').forEach((e,j)=>e.classList.toggle('is-active',j<=i))}
function render(p){
  const labels=getLang()==='en'?[['01','The Challenge','problem'],['02','Our Approach','approach'],['03','The Outcome','outcome'],['04','Reflection','reflection']]:[['01','Tantangan','problem'],['02','Pendekatan','approach'],['03','Hasil','outcome'],['04','Refleksi','reflection']];
  result.innerHTML=`<article class="deploy-result-hero"><img class="deploy-result-img" src="${safe(p.image)}" alt="Pratinjau proyek ${safe(p.title)}"><div class="deploy-result-intro"><small>${safe(p.type)} / PROJECT ${safe(p.number)}</small><h2 id="deployTitle">${safe(p.title)}</h2><p>${safe(content(p,'summary'))}</p><div class="deploy-tech">${p.stack.map(s=>`<span>${safe(s)}</span>`).join('')}</div></div></article><div class="deploy-dossier">${labels.map(([num,heading,key],i)=>`<section style="--n:${i}"><span>${num} / ${heading.toUpperCase()}</span><h3>${safe(heading)}</h3><p>${safe(content(p,key))}</p></section>`).join('')}</div>`;
}
function finish(){workspace.classList.add('is-done');schedule(()=>{workspace.hidden=true;documentPanel.hidden=false;documentPanel.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});d.scrollTop=0;},reduced?1:650)}
function run(){
  clearTimers();const p=projects[active];if(!p)return;
  workspace.hidden=false;workspace.classList.remove('is-done');workspace.dataset.phase='0';documentPanel.hidden=true;
  $('#docBuildTitle').textContent=p.title;$('#docBuildPaperNum').textContent=p.number;
  $('#docBuildSource').textContent=(p.stack||[]).slice(0,2).join(' / ');
  d.scrollTop=0;render(p);
  const current=runID;
  if(reduced){showProgress(p,allDuration);finish();return}
  const start=performance.now();
  function draw(now){if(current!==runID||!d.open)return;const elapsed=Math.min(allDuration,Math.max(0,now-start));showProgress(p,elapsed);if(elapsed>=allDuration)finish();else frameId=requestAnimationFrame(draw)}
  frameId=requestAnimationFrame(draw);
}
function openDocs(id){const idx=projects.findIndex(p=>p.id===id);if(idx<0)return;active=idx;lastFocus=document.activeElement;const caseDialog=$('#projectDialog');if(caseDialog?.open)caseDialog.close();if(!d.open)d.showModal();run()}
selector?.replaceChildren(...projects.map(p=>{const el=document.createElement('option');el.value=p.id;el.textContent=`${p.number} / ${p.title}`;return el}));
// The 3D document vignette is connected to the chosen project, not a generic decorative card.
function previewProject(){
  const p=projects.find(item=>item.id===selector?.value)||projects[0];if(!p)return;
  const img=$('#machinePreviewImage'),label=$('#machineProjectTitle'),machine=$('#documentationMachine');
  if(img){img.src=p.image;img.onerror=()=>{if(p.imageFallback){img.onerror=null;img.src=p.imageFallback}}}
  if(label)label.textContent=p.title;
  if(machine)machine.setAttribute('aria-label',`Deploy dokumentasi proyek ${p.title}`);
}
selector?.addEventListener('change',previewProject);
previewProject();
$('#documentationMachine')?.addEventListener('click',()=>openDocs(selector?.value||projects[0]?.id));
$('#documentationMachine')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDocs(selector?.value||projects[0]?.id)}});

$('#documentationLaunch')?.addEventListener('click',()=>openDocs(selector?.value||projects[0]?.id));
$('#deployReplay')?.addEventListener('click',run);
$('#deploySkip')?.addEventListener('click',finish);
$('#deployClose')?.addEventListener('click',()=>d.close());
d?.addEventListener('click',e=>{if(e.target===d)d.close()});
d?.addEventListener('close',()=>{clearTimers();if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true})});
$('#deployPrev')?.addEventListener('click',()=>{active=(active-1+projects.length)%projects.length;run()});
$('#deployNext')?.addEventListener('click',()=>{active=(active+1)%projects.length;run()});
document.addEventListener('click',e=>{const btn=e.target.closest('[data-docs]');if(btn)openDocs(btn.dataset.docs)});
// Make the page continue the same 3D interaction language, rather than reverting to inert cards.
let cardObserver;
if('IntersectionObserver' in window){cardObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-scene');cardObserver.unobserve(entry.target)}})},{threshold:.13})}
function watchCards(){const cards=$$('.project-card,.feature-card');cards.forEach(card=>{
  if(card.dataset.readyForScene)return;card.dataset.readyForScene='true';card.classList.add('scene-card');cardObserver?.observe(card);
  if(!cardObserver)card.classList.add('in-scene');
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=((e.clientX-r.left)/r.width-.5)*2,y=((e.clientY-r.top)/r.height-.5)*2;card.style.transform=`perspective(1500px) rotateX(${-y*2.3}deg) rotateY(${x*2.6}deg) translateY(-4px)`;card.style.setProperty('--shine-x',((x+1)*50)+'%')});
  card.addEventListener('pointerleave',()=>{card.style.transform=''})
})}
const projectsDOM=$('#projectGrid'),featuredDOM=$('#featuredProjects');
[projectsDOM,featuredDOM].filter(Boolean).forEach(el=>new MutationObserver(watchCards).observe(el,{childList:true}));watchCards();
// Sections continue to assemble into view as visitors progress beyond the hero.
if('IntersectionObserver' in window){
  const chapterIO=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in-scene');chapterIO.unobserve(entry.target)}
  }),{threshold:.1});
  ['expertiseGrid','processGrid'].forEach(id=>{const el=document.getElementById(id);if(el)chapterIO.observe(el)});
}else ['expertiseGrid','processGrid'].forEach(id=>document.getElementById(id)?.classList.add('in-scene'));
// Current chapter marker in persistent navigation.
if('IntersectionObserver' in window){const links=$$('.primary-nav a[href^="#"]');const map=new Map(links.map(a=>[a.getAttribute('href')?.slice(1),a]));const navIO=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(a=>a.classList.remove('active'));map.get(entry.target.id)?.classList.add('active')}})},{rootMargin:'-30% 0px -60% 0px',threshold:0});['unlock','about','work','documentation','expertise','process','playground','contact'].forEach(id=>{const el=document.getElementById(id);if(el)navIO.observe(el)})}
// A direct shortcut lets visitors interact with the newly unlocked portfolio content.
window.addEventListener('portfolio:vault-unlocked',()=>{const launch=$('#documentationLaunch');if(launch)launch.classList.add('ready-to-deploy')});
window.openProjectDocumentation=openDocs;
})();
