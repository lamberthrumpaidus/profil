/* ALL Create by LamberthRumpaidus
 * Real geometrical 3D key/lock mechanism. Scroll-linked assembly, insertion and unlock.
 * Degrades gracefully to a functional animated CSS mechanism without WebGL.
 */
import * as THREE from './lib/three.module.js';
const story = document.getElementById('unlock');
const canvas = document.getElementById('vaultCanvas');
const stage = document.querySelector('.vault-stage');
const fallback = document.getElementById('vaultFallback');
const status = document.getElementById('vaultStatus');
const stageLabel = document.getElementById('vaultStageLabel');
const button = document.getElementById('vaultAdvance');
const reset = document.getElementById('vaultReset');
const cssKey = document.getElementById('cssKeyWrap');
const cssLoop = document.querySelector('.css-lock-loop');
const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,min=0,max=1)=>Math.min(max,Math.max(min,x));
const ease=t=>t*t*(3-2*t);
const between=(p,from,to)=>ease(clamp((p-from)/(to-from)));
let renderer, scene, camera, keyGroup, shackle, lockGroup, targetOrb, sparkles, aperture;
let keyParts=[], decorativeRings=[], glowMat;
let visible=false, progress=0, manualMode=false, isAnimating=false, orbit={x:0,y:0}, pointer={x:0,y:0};
let clock=new THREE.Clock(), animationToken=0, lastScroll=window.scrollY;
const makeMat=(color,metalness=.45,roughness=.32)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
function mesh(geometry, material,parent,x=0,y=0,z=0){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);parent.add(o);return o}
function box(parent,w,h,d,x,y,z,material,bevel=.06){const geo=new THREE.BoxGeometry(w,h,d);const m=mesh(geo,material,parent,x,y,z);if(bevel>0){const e=new THREE.EdgesGeometry(geo);const line=new THREE.LineSegments(e,new THREE.LineBasicMaterial({color:0xc9d8c1,transparent:true,opacity:.12}));m.add(line)}return m}
function build(){
  scene=new THREE.Scene();scene.background=new THREE.Color('#07171d');scene.fog=new THREE.FogExp2('#091c25',.036);
  camera=new THREE.PerspectiveCamera(43,1,.1,90);
  camera.position.set(0.0,1.25,10.7);
  scene.add(new THREE.HemisphereLight(0xc2efe0,0x0a1823,2.1));
  const keyLight=new THREE.DirectionalLight(0xffdfb0,4.2);keyLight.position.set(-5.5,8,8);scene.add(keyLight);
  const rim=new THREE.DirectionalLight(0x6bdbde,3.5);rim.position.set(4,-1,-5);scene.add(rim);
  const fill=new THREE.PointLight(0x99ead8,3.8,16);fill.position.set(-5,-.8,3);scene.add(fill);
  const bronze=makeMat(0xdcb578,.83,.19), bronzeDark=makeMat(0x836742,.82,.32), chrome=makeMat(0x8ca7a2,.89,.24), dark=makeMat(0x172f38,.63,.3), ink=makeMat(0x07171f,.28,.67);
  const floor=mesh(new THREE.PlaneGeometry(75,75),new THREE.MeshStandardMaterial({color:0x0e2730,roughness:.83,metalness:.2}),scene,0,-2.6,-3);floor.rotation.x=-Math.PI/2;
  const grid=new THREE.GridHelper(45,45,0x396766,0x1b4146);grid.position.y=-2.57;grid.material.transparent=true;grid.material.opacity=.24;scene.add(grid);
  lockGroup=new THREE.Group();lockGroup.position.set(1.36,.05,0);scene.add(lockGroup);
  // Mechanical body: layered plates, edge bolts, raised front cylinder and a physical shackle.
  box(lockGroup,2.64,2.67,.94,0,-.65,0,dark);
  box(lockGroup,2.47,2.48,.16,0,-.65,.54,makeMat(0x34515a,.8,.33));
  box(lockGroup,2.3,2.26,.08,0,-.65,.635,makeMat(0x172f35,.78,.28));
  for(const x of [-1.10,1.10])for(const y of [-1.68,.4]){
    const screw=mesh(new THREE.CylinderGeometry(.09,.09,.04,24),chrome,lockGroup,x,y,.69);screw.rotation.x=Math.PI/2;
    box(lockGroup,.09,.018,.014,x,y,.725,ink,0);
  }
  const profile=new THREE.Group();profile.position.set(-.10,-.9,.74);lockGroup.add(profile);
  mesh(new THREE.TorusGeometry(.49,.075,12,64),bronze,profile);
  mesh(new THREE.TorusGeometry(.34,.035,12,64),chrome,profile,0,0,.05);
  mesh(new THREE.CylinderGeometry(.24,.24,.12,36),makeMat(0x071219,.3,.44),profile,0,0,.01).rotation.x=Math.PI/2;
  // Key insertion receiver sits precisely on the lock face.
  box(profile,.31,.095,.03,0,0,.091,bronzeDark,0);
  const ridge=mesh(new THREE.TorusGeometry(1.03,.018,8,80),bronzeDark,lockGroup,0,-.65,.702);ridge.material.transparent=true;ridge.material.opacity=.7;
  shackle=new THREE.Group();lockGroup.add(shackle);
  const points=[];for(let i=0;i<=44;i++){const t=Math.PI-i*Math.PI/44;points.push(new THREE.Vector3(.83*Math.cos(t),.93+1.05*Math.sin(t),-.16))}
  const arch=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),100,.22,12,false),chrome,shackle);
  for(const x of [-.83,.83])mesh(new THREE.CylinderGeometry(.22,.22,1.33,16),chrome,shackle,x,.30,-.16);
  for(const x of [-.83,.83])mesh(new THREE.CylinderGeometry(.27,.27,.16,16),bronzeDark,lockGroup,x,.21,-.15);
  // Floating 3D key comprised of independently assembled parts.
  keyGroup=new THREE.Group();scene.add(keyGroup);
  const head=new THREE.Group();keyGroup.add(head);head.position.set(0,0,0);
  mesh(new THREE.TorusGeometry(.43,.15,16,60),bronze,head,0,0,0);
  mesh(new THREE.TorusGeometry(.28,.035,8,60),bronzeDark,head,0,0,.16);
  const cap=mesh(new THREE.SphereGeometry(.12,14,10),bronze,head,.45,0,0);cap.scale.set(.9,.6,.7);
  const stem=new THREE.Group();keyGroup.add(stem);
  box(stem,2.15,.17,.20,1.34,0,0,bronze);
  box(stem,1.84,.028,.22,1.22,.107,0,chrome,0);
  const teeth=new THREE.Group();keyGroup.add(teeth);
  box(teeth,.18,.53,.22,1.85,-.26,.0,bronze);
  box(teeth,.18,.33,.22,2.17,-.16,.0,bronze);
  box(teeth,.18,.40,.22,2.40,-.20,.0,bronze);
  keyParts=[head,stem,teeth];
  // Animated complementary rings react to unlocking.
  glowMat=new THREE.MeshBasicMaterial({color:0x9ff3d6,transparent:true,opacity:.06,depthWrite:false,side:THREE.DoubleSide});
  aperture=mesh(new THREE.RingGeometry(1.8,1.88,100),glowMat,scene,1.36,-.4,-1.0);
  for(let i=0;i<4;i++){
    const r=mesh(new THREE.TorusGeometry(2.0+i*.38,.012,6,100),new THREE.MeshBasicMaterial({color:i%2?0xa1d4cc:0xd8b37c,transparent:true,opacity:.17,depthWrite:false}),scene,1.36,-.43,-1.1-i*.09);r.rotation.y=i*.12;decorativeRings.push(r);
  }
  const sparkCount=100,arr=new Float32Array(sparkCount*3);
  for(let i=0;i<sparkCount;i++){const n=i*3;arr[n]=-6+(i*97%131)/131*12;arr[n+1]=-2+(i*29%59)/59*5;arr[n+2]=-5+(i*13%61)/61*6}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
  sparkles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xe1c58f,size:.035,transparent:true,opacity:.5}));scene.add(sparkles);
  const small=window.innerWidth<=900;
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!small,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,small?1.25:1.7));
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.32;
  resize();
}
function resize(){if(!renderer||!camera)return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<520?55:43;camera.updateProjectionMatrix()}
function pose(p){
  const assembled=between(p,.01,.26),inserted=between(p,.25,.67),turned=between(p,.62,.83),opened=between(p,.78,.99);
  if(keyGroup){
    keyParts[0].position.set(-1.7*(1-assembled),1.45*(1-assembled),1.18*(1-assembled));keyParts[0].rotation.set(.6*(1-assembled),-.65*(1-assembled),-.6*(1-assembled));
    keyParts[1].position.set(.45*(1-assembled),-.65*(1-assembled),-1.4*(1-assembled));keyParts[1].rotation.set(-.5*(1-assembled),.32*(1-assembled),.2*(1-assembled));
    keyParts[2].position.set(1.15*(1-assembled),-1.32*(1-assembled),1.32*(1-assembled));keyParts[2].rotation.set(.75*(1-assembled),.75*(1-assembled),-.45*(1-assembled));
    keyGroup.position.set(-3.65+2.43*inserted,-.76-.15*inserted,1.65-.47*inserted);
    keyGroup.rotation.set(0,.14*(1-inserted),turned*-Math.PI*.48);
    keyGroup.scale.setScalar(.92);
  }
  if(shackle){shackle.position.y=1.10*opened;shackle.rotation.z=-.21*opened;lockGroup.rotation.y=.025*Math.sin(p*Math.PI)}
  if(aperture){aperture.material.opacity=.05+.19*opened;aperture.scale.setScalar(1+.52*opened)}
  decorativeRings.forEach((r,i)=>{r.material.opacity=(.08+.14*opened)*(1-i*.12);r.rotation.z=(i%2?1:-1)*(opened*.68)})
}
function updateUI(p){
  const done=p>.97;
  const stageNum=p<.30?0:p<.7?1:2;
  const statuses=['MENUNGGU PERAKITAN','KUNCI SUDAH DIRAKIT','KUNCI TERPASANG','AKSES TERBUKA'];
  status.textContent=p<.28?statuses[0]:p<.64?statuses[1]:p<.94?statuses[2]:statuses[3];
  const labels=['01 — ASSEMBLE COMPONENTS','02 — INSERT MECHANISM','03 — ROTATE & UNLOCK','04 — ACCESS GRANTED'];
  stageLabel.textContent=p<.28?labels[0]:p<.64?labels[1]:p<.94?labels[2]:labels[3];
  button.innerHTML=done?'Buka dokumentasi <span>↗</span>':p<.28?'Rakit kunci <span>↗</span>':p<.64?'Pasang kunci <span>↗</span>':'Putar &amp; buka <span>↗</span>';
  document.querySelector('.vault-timeline')?.style.setProperty('--vault-pct',(p*100)+'%');
  document.querySelectorAll('.vault-timeline-dot').forEach((el,i)=>el.classList.toggle('is-active',p>=([.24,.62,.95][i])));
  // CSS-rendered, meaningful fallback animation even on WebGL-disabled browsers.
  if(cssKey){const inserted=between(p,.27,.68),turn=between(p,.65,.84);const mobile=innerWidth<600;cssKey.style.setProperty('--key-tx',(inserted*(mobile?118:215))+'px');cssKey.style.setProperty('--key-ty',(-16*inserted)+'px');cssKey.style.setProperty('--key-rotate',(-87*turn)+'deg');cssKey.style.opacity=String(.65+.35*between(p,.02,.27))}
  if(cssLoop){const open=between(p,.75,.99);cssLoop.style.transform=`translateY(${-48*open}px) rotate(${-13*open}deg)`;cssLoop.style.transformOrigin='10% 80%'}
  document.querySelector('.vault-sticky')?.classList.toggle('is-unlocked',done);
}
function setProgress(p){progress=clamp(p);pose(progress);updateUI(progress)}
function onScroll(){const y=window.scrollY;if(Math.abs(y-lastScroll)>3){manualMode=false;animationToken++}lastScroll=y;if(manualMode)return;const r=story.getBoundingClientRect();const usable=Math.max(1,story.offsetHeight-innerHeight);setProgress(clamp(-r.top/usable))}
function animateTo(next){manualMode=true;animationToken++;const token=animationToken,from=progress,start=performance.now(),duration=isReduced?1:1150;isAnimating=true;
  function step(now){if(token!==animationToken){isAnimating=false;return}const t=clamp((now-start)/duration);setProgress(from+(next-from)*ease(t));if(t<1)requestAnimationFrame(step);else{isAnimating=false;if(next>=.99)window.dispatchEvent(new CustomEvent('portfolio:vault-unlocked'))}}
  requestAnimationFrame(step)
}
function nextStage(){if(isAnimating)return; if(progress>.97){document.getElementById('documentation')?.scrollIntoView({behavior:isReduced?'instant':'smooth'});return}const target=progress<.27?.30:progress<.63?.68:1;animateTo(target)}
button?.addEventListener('click',nextStage);reset?.addEventListener('click',()=>{animationToken++;isAnimating=false;manualMode=true;animateTo(0)});
// Genuine pointer + touch orbit. Do not disable vertical native scroll on phones.
let drag=null;
stage?.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};
  if(e.pointerType==='mouse')stage.setPointerCapture?.(e.pointerId);
},{passive:true});
stage?.addEventListener('pointermove',e=>{
  const r=stage.getBoundingClientRect();
  if(drag&&drag.id===e.pointerId){
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    pointer.x=clamp(pointer.x+dx/Math.max(160,r.width)*2,-1,1);
    pointer.y=clamp(pointer.y+dy/Math.max(150,r.height)*2,-1,1);
    drag.x=e.clientX;drag.y=e.clientY;
  }else if(e.pointerType==='mouse'){
    pointer.x=clamp((e.clientX-r.left)/r.width*2-1,-1,1);
    pointer.y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);
  }
},{passive:true});
stage?.addEventListener('pointerup',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;
  // A horizontal swipe operates the next / previous mechanical checkpoint on touch devices.
  if(e.pointerType==='touch'&&Math.abs(dx)>90&&Math.abs(dx)>Math.abs(dy)*1.35&&!isAnimating){
    const stops=[0,.30,.68,1];
    const nearest=stops.reduce((i,s,index)=>Math.abs(s-progress)<Math.abs(stops[i]-progress)?index:i,0);
    animateTo(stops[clamp(nearest+(dx<0?1:-1),0,3)]);
  }
  drag=null;
},{passive:true});
stage?.addEventListener('pointercancel',()=>{drag=null});
stage?.addEventListener('pointerleave',()=>{if(!drag){pointer.x=pointer.y=0}});
// Keyboard interaction is explicit and discoverable for people who cannot drag.
canvas?.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'){e.preventDefault();nextStage()}
  if(e.key==='ArrowLeft'){e.preventDefault();animateTo(progress>.7?.3:0)}
});
function tick(){requestAnimationFrame(tick);if(!renderer||!visible||document.hidden)return;const dt=Math.min(clock.getDelta(),.06);orbit.x+=(pointer.x-orbit.x)*Math.min(1,dt*2.4);orbit.y+=(pointer.y-orbit.y)*Math.min(1,dt*2.4);
  camera.position.set(orbit.x*.45,1.15-orbit.y*.28,window.innerWidth<650?11.6:10.7);camera.lookAt(.02,-.07,0);
  if(sparkles&&!isReduced){sparkles.rotation.y+=dt*.012;decorativeRings.forEach((r,i)=>{r.rotation.z+=dt*(i%2?-.05:.04)})}
  renderer.render(scene,camera)
}
canvas?.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;canvas.hidden=true;fallback.hidden=false;setProgress(progress)});
try{build();fallback.hidden=true;setProgress(0);new ResizeObserver(resize).observe(stage);const io=new IntersectionObserver(es=>{visible=!!es[0]?.isIntersecting;if(visible)clock.getDelta()},{threshold:.01});io.observe(stage);window.addEventListener('resize',resize,{passive:true});tick()}
catch(e){console.warn('WebGL lock unavailable; enabling animated CSS fallback.',e);canvas.hidden=true;fallback.hidden=false;setProgress(0)}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
window.portfolioVault={next:nextStage,reset:()=>animateTo(0),get progress(){return progress}};
