/* ALL Create by LamberthRumpaidus — one-action mechanically sequenced 3D key. */
import * as THREE from './lib/three.module.js';
const canvas=document.getElementById('vaultCanvas'),stage=document.getElementById('lockStage'),fallback=document.getElementById('vaultFallback'),button=document.getElementById('vaultAdvance'),status=document.getElementById('vaultStatus');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=t=>{const x=clamp(t);return x*x*(3-2*x)};
const range=(t,a,b)=>smooth((t-a)/(b-a));
let renderer,scene,camera,lock,key,shackle,slotRing,glow;
let visible=true,running=false,unlocked=false,progress=0,start=0,animationFrame=0;
function rounded(x,y,w,h,r){const s=new THREE.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function add(parent,geo,material,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m}
function build(){
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:innerWidth>680,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.2:1.6));
 renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,.1,60);
 scene.add(new THREE.HemisphereLight(0xc9f6e6,0x10232a,2));
 const keylight=new THREE.DirectionalLight(0xe3e9db,3.2);keylight.position.set(-4,7,7);scene.add(keylight);
 const rim=new THREE.DirectionalLight(0xd2a878,2.9);rim.position.set(6,3,-4);scene.add(rim);
 const metal=new THREE.MeshStandardMaterial({color:0x7daba6,metalness:.79,roughness:.27}),darkMetal=new THREE.MeshStandardMaterial({color:0x254248,metalness:.72,roughness:.32}),gold=new THREE.MeshStandardMaterial({color:0xe4bc80,metalness:.78,roughness:.24}),hole=new THREE.MeshStandardMaterial({color:0x09171d,roughness:.4});
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
 glow=new THREE.Mesh(new THREE.RingGeometry(.57,.61,56),new THREE.MeshBasicMaterial({color:0x9debc3,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));glow.position.set(-.55,-.64,.41);scene.add(glow);
 resize();pose(0)
}
function resize(){if(!renderer)return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<540?57:42;camera.position.set(w<540?2.05:2.9,2.1,w<540?8:8.5);camera.lookAt(0,.27,0);camera.updateProjectionMatrix()}
function pose(p){
 const align=range(p,.04,.33),insert=range(p,.34,.69),turn=range(p,.70,.83),open=range(p,.84,1);
 if(key){key.position.set(1.9-2.45*align,-.64,3.5-2.08*insert);key.rotation.set(0,-.23*(1-align),-.13*(1-align)+turn*(Math.PI/2))}
 if(shackle){shackle.position.y=.71*open;shackle.rotation.z=-.24*open}
 if(slotRing){slotRing.material.emissive=new THREE.Color(0x3f3020);slotRing.material.emissiveIntensity=.12+.5*open}
 if(glow)glow.material.opacity=.25*open;
 fallback?.style.setProperty('--key-align',String(align));fallback?.style.setProperty('--key-insert',String(insert));fallback?.style.setProperty('--key-turn',String(turn));fallback?.style.setProperty('--shackle-open',String(open))
}
function render(t){animationFrame=requestAnimationFrame(render);if(document.hidden)return;
 if(running){progress=clamp((t-start)/3900);pose(smooth(progress));if(progress>=1){running=false;unlocked=true;status.textContent='Akses terbuka';button.textContent='Lihat karya ↗';button.setAttribute('aria-label','Lihat karya portofolio');button.disabled=false;stage.classList.add('is-unlocked');window.dispatchEvent(new CustomEvent('portfolio:vault-unlocked'))}}
 if(renderer&&visible)renderer.render(scene,camera)
}
function unlock(){if(unlocked){document.getElementById('work')?.scrollIntoView({behavior:reduce?'instant':'smooth'});return}if(running)return;
 if(reduce){progress=1;pose(1);running=false;unlocked=true;status.textContent='Akses terbuka';button.textContent='Lihat karya ↗';stage.classList.add('is-unlocked');return}
 start=performance.now();running=true;status.textContent='Kunci sedang dipasang…';button.textContent='Membuka…';button.disabled=true
}
button?.addEventListener('click',unlock);
canvas?.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer=null;canvas.hidden=true;fallback.hidden=false});
try{build();fallback.hidden=true;new ResizeObserver(resize).observe(stage);new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting)},{threshold:.01}).observe(stage);animationFrame=requestAnimationFrame(render)}
catch(e){console.warn('3D key unavailable; enabling 2D mechanical fallback',e);canvas.hidden=true;fallback.hidden=false;renderer=null;animationFrame=requestAnimationFrame(render)}
window.portfolioVault={next:unlock,get progress(){return progress}};