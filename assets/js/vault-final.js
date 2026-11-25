/* ALL Create by LamberthRumpaidus — one-action mechanically sequenced 3D key. */
import * as THREE from './lib/three.module.js';
const canvas=document.getElementById('vaultCanvas'),stage=document.getElementById('lockStage'),fallback=document.getElementById('vaultFallback'),button=document.getElementById('vaultAdvance'),status=document.getElementById('vaultStatus');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=t=>{const x=clamp(t);return x*x*(3-2*x)};
const range=(t,a,b)=>smooth((t-a)/(b-a));
let renderer,scene,camera,lock,key,shackle,slotRing,glow,portal,portalLight;
const pointer={x:0,y:0};
let visible=true,running=false,unlocked=false,progress=0,start=0,animationFrame=0;
function rounded(x,y,w,h,r){const s=new THREE.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function add(parent,geo,material,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m}
function build(){
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:innerWidth>680,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.2:1.6));
 renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,.1,60);
 portal=new THREE.LOD();const auraMat=new THREE.MeshBasicMaterial({color:0x88c7b7,transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide});
 portal.addLevel(new THREE.Mesh(new THREE.TorusGeometry(1.8,.035,12,100),auraMat),0);
 portal.addLevel(new THREE.Mesh(new THREE.TorusGeometry(1.8,.045,5,24),auraMat),7);
 portal.position.set(-.55,.2,-1.35);scene.add(portal);
 portalLight=new THREE.PointLight(0x9de5c9,1.1,12,2);portalLight.position.set(1.2,1.5,3.5);scene.add(portalLight);
 scene.add(new THREE.HemisphereLight(0xc9f6e6,0x10232a,2));
 const keylight=new THREE.DirectionalLight(0xe3e9db,3.2);keylight.position.set(-4,7,7);scene.add(keylight);
 const rim=new THREE.DirectionalLight(0xd2a878,2.9);rim.position.set(6,3,-4);scene.add(rim);
 const metal=new THREE.MeshStandardMaterial({color:0x8fa6a1,metalness:.79,roughness:.27}),darkMetal=new THREE.MeshStandardMaterial({color:0x254248,metalness:.72,roughness:.32}),gold=new THREE.MeshStandardMaterial({color:0xd8ba91,metalness:.78,roughness:.24}),hole=new THREE.MeshStandardMaterial({color:0x09171d,roughness:.4});
 lock=new THREE.Group();scene.add(lock);lock.position.set(-.55,-.30,0);
 const bodyGeo=new THREE.ExtrudeGeometry(rounded(-1.25,-1,2.5,2.25,.28),{depth:.58,steps:1,bevelEnabled:true,bevelThickness:.07,bevelSize:.075,bevelSegments:3,curveSegments:10});
 add(lock,bodyGeo,darkMetal,0,0,-.44);add(lock,new THREE.BoxGeometry(2.0,.055,.05),metal,0,-.61,.215);
 const face=add(lock,new THREE.CylinderGeometry(.43,.43,.045,48),metal,0,-.34,.25);face.rotation.x=Math.PI/2;
 add(lock,new THREE.CircleGeometry(.185,36),hole,0,-.31,.281);add(lock,new THREE.BoxGeometry(.105,.27,.03),hole,0,-.43,.297);
 slotRing=add(lock,new THREE.TorusGeometry(.30,.014,8,56),gold,0,-.34,.29);
 shackle=new THREE.Group();lock.add(shackle);const points=[];
 for(let i=0;i<=40;i++){const t=Math.PI-(i/40)*Math.PI;points.push(new THREE.Vector3(.81*Math.cos(t),1.06+1.05*Math.sin(t),-.08))}
 add(shackle,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,.19,14,false),metal);
 for(const x of [-.81,.81])add(shackle,new THREE.CylinderGeometry(.19,.19,.72,16),metal,x,.72,-.08);
 key=new THREE.Group();scene.add(key);add(key,new THREE.TorusGeometry(.32,.11,14,48),gold,0,0,.06);
 add(key,new THREE.CylinderGeometry(.095,.095,1.42,14),gold,0,0,-.73).rotation.x=Math.PI/2;
 add(key,new THREE.BoxGeometry(.26,.115,.19),gold,.12,0,-1.18);
 add(key,new THREE.BoxGeometry(.19,.09,.13),gold,.10,0,-1.38);
 add(key,new THREE.CylinderGeometry(.14,.14,.16,24),darkMetal,0,0,.07).rotation.x=Math.PI/2;
 const floor=new THREE.Mesh(new THREE.CircleGeometry(2.55,64),new THREE.MeshBasicMaterial({color:0x86bdb0,transparent:true,opacity:.055,depthWrite:false}));floor.position.set(0,-1.56,-.7);floor.rotation.x=-Math.PI/2;scene.add(floor);
 glow=new THREE.Mesh(new THREE.RingGeometry(.57,.61,56),new THREE.MeshBasicMaterial({color:0xb4cbb4,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));glow.position.set(-.55,-.64,.41);scene.add(glow);
 resize();pose(0)
}
function resize(){if(!renderer)return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<540?57:42;camera.position.set(w<540?2.05:2.9,2.1,w<540?8:8.5);camera.lookAt(0,.27,0);camera.updateProjectionMatrix()}
function pose(p){
 const align=range(p,.04,.33),insert=range(p,.34,.69),turn=range(p,.70,.83),open=range(p,.84,1);
 if(key){key.position.set(1.9-2.45*align,-.64,3.5-2.08*insert);key.rotation.set(0,-.23*(1-align),-.13*(1-align)+turn*(Math.PI/2))}
 if(shackle){shackle.position.y=.95*open;shackle.rotation.z=.25*open}
 if(slotRing){slotRing.material.emissive=new THREE.Color(0x3f3020);slotRing.material.emissiveIntensity=.12+.5*open}
 if(glow)glow.material.opacity=.25*open;
 fallback?.style.setProperty('--key-align',String(align));fallback?.style.setProperty('--key-insert',String(insert));fallback?.style.setProperty('--key-turn',String(turn));fallback?.style.setProperty('--shackle-open',String(open))
}
function startLoop(){if(!animationFrame&&!document.hidden&&visible)animationFrame=requestAnimationFrame(render)}
function render(t){animationFrame=0;if(document.hidden||!visible)return;
 if(running){progress=clamp((t-start)/3900);pose(smooth(progress));if(progress>=1){running=false;unlocked=true;status.textContent='Akses terbuka';button.textContent='Lihat karya ↗';button.setAttribute('aria-label','Lihat karya portofolio');button.disabled=false;stage.classList.add('is-unlocked');window.dispatchEvent(new CustomEvent('portfolio:vault-unlocked'))}}
 if(renderer){if(!reduce){const w=stage.clientWidth<540;camera.position.set((w?2.05:2.9)+pointer.x*.4,2.1+pointer.y*.23,w?8:8.5);camera.lookAt(0,.27,0);if(portal)portal.rotation.z+=.0008;if(portalLight)portalLight.position.set(1.0+pointer.x*3,1.65+pointer.y*2,3.5)}renderer.render(scene,camera)}
 if(visible)animationFrame=requestAnimationFrame(render)
}
function unlock(){if(unlocked){document.getElementById('work')?.scrollIntoView({behavior:reduce?'instant':'smooth'});return}if(running)return;
 if(reduce){progress=1;pose(1);running=false;unlocked=true;status.textContent='Akses terbuka';button.textContent='Lihat karya ↗';stage.classList.add('is-unlocked');window.dispatchEvent(new CustomEvent('portfolio:vault-unlocked'));return}
 start=performance.now();running=true;startLoop();status.textContent='Kunci sedang dipasang…';button.textContent='Membuka…';button.disabled=true
}
button?.addEventListener('click',unlock);
canvas?.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer=null;canvas.hidden=true;fallback.hidden=false});
try{build();fallback.hidden=true;new ResizeObserver(resize).observe(stage);new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)startLoop()},{threshold:.01}).observe(stage);startLoop()}
catch(e){console.warn('3D key unavailable; enabling 2D mechanical fallback',e);canvas.hidden=true;fallback.hidden=false;renderer=null;startLoop()}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(animationFrame);animationFrame=0}else startLoop()});
stage?.addEventListener('pointermove',e=>{if(reduce||e.pointerType==='touch')return;const b=stage.getBoundingClientRect();pointer.x=((e.clientX-b.left)/b.width-.5)*2;pointer.y=-((e.clientY-b.top)/b.height-.5)*2},{passive:true});
stage?.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0});
window.portfolioVault={next:unlock,get progress(){return progress}};