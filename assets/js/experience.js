/* ALL Create by LamberthRumpaidus
 * Documentation studio: progressive real case-study drafting.
 * Each completed section remains on the document; no fake AI or deployment.
 */
(()=>{'use strict';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const projects=window.PORTFOLIO_PROJECTS||[];
const dialog=$('#deployDialog'),work=$('#deployWorkspace'),paper=$('#docBuildCollection');
const result=$('#deployResult'),out=$('#deployDocument'),select=$('#documentationProject');
if(!dialog||!work||!paper||!result||!out||!select||!projects.length)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const value=(p,k)=>document.documentElement.lang==='en'&&p.en?.[k]?p.en[k]:p[k];
const times=[3100,4300,4700,5600],duration=times.reduce((a,b)=>a+b,0);
const descriptions=[
  ['RINGKASAN PROYEK','PROJECT OVERVIEW'],
  ['TANTANGAN','CHALLENGE ANALYSIS'],
  ['PENDEKATAN','ENGINEERING APPROACH'],
  ['HASIL & REFLEKSI','OUTCOME & LEARNING']
];
const $status=$('#deployPhase'),$clock=$('#deployClock'),$percent=$('#deployPercent'),
$bar=$('#deployProgressBar'),$stage=$('#deployStageNumber'),$log=$('#docBuildLines'),
$announce=$('#deployAnnounce');
let active=0,elapsed=0,last=0,frame=0,timeout=0,runId=0,lastFocus=null,done=false,currentStage=-1;
let chapters=[],htmlParts=[];
const text=(p,k)=>String(value(p,k)||'Tidak ada informasi yang tercatat pada proyek ini.');
function chaptersFor(p){return [
 {label:descriptions[0][0],console:descriptions[0][1],text:String(value(p,'summary')||'')+'\n\nTeknologi: '+(p.stack||[]).join(' · ')},
 {label:descriptions[1][0],console:descriptions[1][1],text:text(p,'problem')},
 {label:descriptions[2][0],console:descriptions[2][1],text:text(p,'approach')},
 {label:descriptions[3][0],console:descriptions[3][1],text:text(p,'outcome')+'\n\nRefleksi: '+text(p,'reflection')}
]}
function clearRun(){runId++;cancelAnimationFrame(frame);clearTimeout(timeout);frame=0;timeout=0;last=0}
function fillResult(p){
 const labels=[['01','Tantangan','problem'],['02','Pendekatan','approach'],['03','Hasil','outcome'],['04','Refleksi','reflection']];
 const tags=(p.stack||[]).map(s=>'<span>'+safe(s)+'</span>').join('');
 const link=p.repository?'<a class="doc-repo-link" href="'+safe(p.repository)+'" target="_blank" rel="noopener noreferrer">Lihat sumber proyek ↗</a>':'';
 const pic='<img class="deploy-result-img" src="'+safe(p.image||'')+'" '+(p.imageFallback?'data-image-fallback="'+safe(p.imageFallback)+'" ':'')+'alt="Pratinjau '+safe(p.title)+'" loading="lazy">';
 result.innerHTML='<article class="deploy-result-hero">'+pic+'<div class="deploy-result-intro"><small>'+safe(p.type||'PROJECT')+' / CASE STUDY '+safe(p.number||'')+'</small><h2 id="deployTitle">'+safe(p.title)+'</h2><p>'+safe(value(p,'summary')||'')+'</p><div class="deploy-tech">'+tags+'</div>'+link+'</div></article><div class="deploy-dossier">'+labels.map(([num,title,k])=>'<section><span>'+num+' / STUDI KASUS</span><h3>'+title+'</h3><p>'+safe(text(p,k))+'</p></section>').join('')+'</div>';
}
function showPreview(){const p=projects.find(x=>x.id===select.value)||projects[0];if(!p)return;
 const img=$('#machinePreviewImage'),title=$('#machineProjectTitle');
 if(title)title.textContent=p.title;
 if(img){img.onerror=null;img.src=p.image||'';img.alt='Pratinjau proyek '+p.title;img.onerror=()=>{img.onerror=null;if(p.imageFallback)img.src=p.imageFallback}}
 $('#documentationMachine')?.setAttribute('aria-label','Buka dokumentasi proyek '+p.title);
}
function createChapters(p){
 chapters=chaptersFor(p);
 paper.replaceChildren();
 htmlParts=chapters.map((chapter,i)=>{
   const node=document.createElement('section');node.className='doc-paper-chapter';node.dataset.chapter=String(i);
   const label=document.createElement('span');label.className='doc-paper-number';label.textContent=String(i+1).padStart(2,'0')+' / '+chapter.label;
   const content=document.createElement('p');content.className='doc-paper-content';content.textContent='';
   node.append(label,content);paper.append(node);
   return{node,content,chars:Array.from(chapter.text),count:-1};
 });
 const header=$('#docBuildTitle');if(header)header.textContent=p.title;
 $('#docBuildPaperNum').textContent=p.number||'01';
 $('#docBuildSource').textContent=(p.stack||[]).slice(0,2).join(' / ')||'PROJECT DATA';
 $log.replaceChildren();currentStage=-1;
 $$('#deployWorkspace [data-deploy-step]').forEach((el,i)=>{el.classList.remove('is-active','is-complete');el.setAttribute('aria-current','false')});
}
function progress(time){
 let phase=0,offset=0;
 for(let i=0;i<times.length;i++){if(time<offset+times[i]){phase=i;break}offset+=times[i];phase=i+1}
 phase=Math.min(times.length-1,phase);
 const local=phase===0?time:time-times.slice(0,phase).reduce((a,b)=>a+b,0);
 const ratio=Math.max(0,Math.min(1,local/times[phase]));
 chapters.forEach((ch,i)=>{
   const shown=i<phase?ch.text.length:i===phase?Math.min(ch.text.length,Math.floor(ch.text.length*ratio)):0;
   const part=htmlParts[i];if(part.count!==shown){part.count=shown;part.content.textContent=ch.text.slice(0,shown)}
   part.node.classList.toggle('is-active',i===phase);
   part.node.classList.toggle('is-complete',i<phase||(time>=duration&&i===phase));
 });
 if(phase!==currentStage){
   currentStage=phase;work.dataset.phase=String(phase);
   $stage.textContent=String(phase+1).padStart(2,'0');
   $clock.textContent=chapters[phase].console;
   const statement=(phase===0?'Memuat proyek':phase===1?'Menyusun tantangan':phase===2?'Membangun pendekatan':'Merangkum hasil')+' — '+projects[active].title;
   $status.textContent=statement;if($announce)$announce.textContent=statement;
   $log.replaceChildren();
   chapters.forEach((ch,i)=>{
     if(i>phase)return;
     const line=document.createElement('p');line.className=i===phase?'doc-log-active':'doc-log-complete';
     line.textContent=(i===phase?'→ ':'✓ ')+ch.console;
     $log.append(line);
   });
   paper.scrollTop=Math.max(0,htmlParts[phase].node.offsetTop-paper.offsetTop-16);
 }
 const percentage=Math.min(100,Math.round(100*time/duration));
 $percent.textContent=percentage+'%';$bar.style.width=percentage+'%';
 $$('#deployWorkspace [data-deploy-step]').forEach((el,i)=>{
   el.classList.toggle('is-active',i===phase);
   el.classList.toggle('is-complete',i<phase);
   el.setAttribute('aria-current',i===phase?'step':'false');
 });
}
function complete(){
 if(done)return;done=true;
 cancelAnimationFrame(frame);frame=0;last=0;
 progress(duration);$status.textContent='Dokumentasi selesai disusun';if($announce)$announce.textContent='Dokumentasi selesai. Studi kasus siap dibaca.';
 work.classList.add('is-done');
 const thisRun=runId;
 timeout=setTimeout(()=>{
   if(thisRun!==runId||!dialog.open)return;
   work.hidden=true;out.hidden=false;
   out.classList.add('doc-result-enter');
   dialog.scrollTop=0;
   $('#deployClose')?.focus({preventScroll:true});
 },reduce.matches?0:850);
}
function tick(now){
 frame=0;if(!dialog.open||done)return;
 if(document.hidden){last=0;return}
 if(!last)last=now;
 elapsed=Math.min(duration,elapsed+Math.min(64,now-last));last=now;
 progress(elapsed);
 if(elapsed>=duration)complete();else frame=requestAnimationFrame(tick);
}
function start(){
 clearRun();done=false;elapsed=0;currentStage=-1;
 const p=projects[active];if(!p)return;
 out.hidden=true;out.classList.remove('doc-result-enter');work.hidden=false;work.classList.remove('is-done');
 createChapters(p);fillResult(p);
 dialog.scrollTop=0;
 progress(0);
 if(reduce.matches){complete();return}
 frame=requestAnimationFrame(tick);
}
function open(id){
 const index=projects.findIndex(p=>p.id===id);if(index<0)return;
 active=index;lastFocus=document.activeElement;
 const other=$('#projectDialog');if(other?.open)other.close();
 if(!dialog.open)dialog.showModal();
 select.value=id;
 start();
}
select.replaceChildren(...projects.map(p=>{const el=document.createElement('option');el.value=p.id;el.textContent=p.title;return el}));
select.addEventListener('change',showPreview);showPreview();
$('#documentationLaunch')?.addEventListener('click',()=>open(select.value));
// Project cover is a visual preview only; one explicit documentation button starts the sequence.
document.addEventListener('click',e=>{const b=e.target.closest('[data-docs]');if(b){e.preventDefault();open(b.dataset.docs)}});
$('#deploySkip')?.addEventListener('click',complete);
$('#deployReplay')?.addEventListener('click',start);
$('#deployPrev')?.addEventListener('click',()=>{active=(active+projects.length-1)%projects.length;select.value=projects[active].id;start()});
$('#deployNext')?.addEventListener('click',()=>{active=(active+1)%projects.length;select.value=projects[active].id;start()});
$('#deployClose')?.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>{clearRun();done=false;if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true})});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&dialog.open&&!done&&!frame){last=0;frame=requestAnimationFrame(tick)}});
document.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.dataset.imageFallback){img.src=img.dataset.imageFallback;delete img.dataset.imageFallback}},true);
window.openProjectDocumentation=open;
window.portfolioDocStatus=()=>({open:dialog.open,project:projects[active]?.id,stage:currentStage,elapsed,ready:!out.hidden});
})();