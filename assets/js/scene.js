/* ALL Create by LamberthRumpaidus — immersive procedural garden, inspired by user's visual reference. */
import * as THREE from './lib/three.module.js';

const frame = document.getElementById('worldFrame');
const canvas = document.getElementById('gardenCanvas');
const fallback = document.getElementById('worldFallback');
const state = { active: true, immersive: false, motion: !matchMedia('(prefers-reduced-motion: reduce)').matches, detail: 'high', theme: 'dusk', preset: 'arrival', drag: false, wanted: null };
const cameras = {
  arrival: { position: [5.0, 3.15, 14.5], target: [-0.4, 2.12, -9.5] },
  gate: { position: [-0.8, 2.9, 4.2], target: [0, 2.55, -16] },
  water: { position: [9.5, 4.5, 3.2], target: [3.3, 0.8, -15] },
  bamboo: { position: [-8.8, 4.6, 3], target: [-4.1, 2.8, -17] }
};
let renderer, scene, camera, clock, keyLight, hemi, water, fireflies, petals, glow, heroSpot, bloomTrees=[];
let qualityScale=1,slowFrameCount=0;
let pose = new THREE.Vector3(...cameras.arrival.position), look = new THREE.Vector3(...cameras.arrival.target);
const mouse = {x:0,y:0}; const targets = {x:0,y:0};
let raf = null; let visible = true;
const colors = { dusk: {fog:0x10272a, sky:0x10272a, floor:0x17322e, water:0x214a4d, light:0xffceb1, lamp:0xffbe75}, night:{fog:0x08151e,sky:0x08151e,floor:0x0e282b,water:0x133a46,light:0x799fc5,lamp:0xffce88}};
let seed=76213;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const rr=(a,b)=>a+rnd()*(b-a);
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const mat=(hex,roughness=0.85,metalness=0)=>new THREE.MeshStandardMaterial({color:hex,roughness,metalness});
const darkWood=mat(0x321c1c), redWood=mat(0x9b352e,.52), redLight=mat(0xd45842,.48), trim=mat(0x211a1d,.7), slate=mat(0x526668,.92), moss=mat(0x304d3d), warm= new THREE.MeshBasicMaterial({color:0xffdfa3}), gold=mat(0xb68b59,.48);
function mesh(geo,material,x=0,y=0,z=0){const o = new THREE.Mesh(geo,material);o.position.set(x,y,z);return o}
function box(parent,w,h,d,x,y,z,material,rot=0){const m=mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z);m.rotation.z=rot;parent.add(m);return m}
function cyl(parent,r1,r2,h,x,y,z,material,radial=8){const m=mesh(new THREE.CylinderGeometry(r1,r2,h,radial),material,x,y,z);parent.add(m);return m}
function sphere(parent,r,x,y,z,material,detail=0){const s=mesh(new THREE.IcosahedronGeometry(r,detail),material,x,y,z);parent.add(s);return s}
function groupedCloud(g,x,y,z,n,radius,material){for(let i=0;i<n;i++)sphere(g,rr(.35,.92),x+rr(-radius,radius),y+rr(-radius*.36,radius*.36),z+rr(-radius,radius),material,1)}

function createTorii(z,scale=1){
  const g=new THREE.Group();g.position.z=z;g.scale.setScalar(scale);scene.add(g);
  const side=3.55;
  for(const s of [-1,1]){
    cyl(g,.23,.32,5.5,s*side,2.75,0,redWood,12);
    cyl(g,.36,.39,.2,s*side,5.53,0,trim,12);
    cyl(g,.42,.55,.27,s*side,.15,0,trim,10);
    box(g,.72,.12,.8,s*side,.45,0,redLight);
  }
  box(g,8.5,.4,.64,0,4.6,0,redWood);
  box(g,7.0,.18,.52,0,4.06,0,redLight);
  box(g,1.3,.76,.2,0,4.16,.36,trim);
  box(g,.08,.56,.04,0,4.18,.47,gold);
  // Slight upsweep gives the roof silhouette of classic Japanese torii.
  const shape=new THREE.Shape();
  shape.moveTo(-4.72,5.54); shape.bezierCurveTo(-3.25,5.42,-1.3,5.43,0,5.46);
  shape.bezierCurveTo(1.3,5.43,3.25,5.42,4.72,5.54);
  shape.lineTo(4.84,5.88);shape.bezierCurveTo(2.6,5.69,0,5.65,-2.6,5.69);
  shape.lineTo(-4.84,5.88);shape.closePath();
  const roof=mesh(new THREE.ExtrudeGeometry(shape,{depth:.94,bevelEnabled:true,bevelThickness:.06,bevelSize:.08,bevelSegments:2,steps:1,curveSegments:12}),redWood,0,0,-.47);
  g.add(roof);
  for(const s of [-1,1]){
    box(g,.85,.16,1.1,s*4.45,5.72,0,trim,s*.04);
  }
  return g;
}
function createLantern(x,z,s=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g);
  cyl(g,.34,.48,.23,0,.12,0,slate);
  cyl(g,.17,.2,2.03,0,1.2,0,slate);
  box(g,.94,.18,.94,0,2.27,0,slate);
  const glass=box(g,.66,.78,.66,0,2.71,0,warm);
  glass.material= new THREE.MeshBasicMaterial({color:0xffcf81,transparent:true,opacity:.7});
  for(const dx of [-.4,.4])for(const dz of [-.4,.4])cyl(g,.045,.045,.9,dx,2.7,dz,trim,6);
  box(g,.96,.13,.96,0,3.17,0,slate);
  const roof=cyl(g,.07,.62,.45,0,3.47,0,slate,4);roof.rotation.y=Math.PI/4;
  sphere(g,.14,0,3.78,0,gold,1);
  const light=new THREE.PointLight(0xffac56,1.6,9,2);light.position.set(0,2.8,0);g.add(light);
  return g;
}
function createBambooForest(isLow){
  const count=isLow?82:165;
  const geo=new THREE.CylinderGeometry(.075,.095,1,7);
  const segments=new THREE.InstancedMesh(geo,mat(0x50765c),count*4);
  const nodes=new THREE.InstancedMesh(new THREE.CylinderGeometry(.103,.1,.065,8),mat(0x233d2b),count*3);
  const leafShape=new THREE.BufferGeometry();
  leafShape.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, -.13,.06,-.13, 0,.03,-1.7, .13,.06,-.13, 0,.03,-1.7, 0,0,0],3));
  leafShape.setIndex([0,1,2,3,4,5]);leafShape.computeVertexNormals();
  const leafMat=new THREE.MeshStandardMaterial({color:0x547a57,side:THREE.DoubleSide,roughness:1});
  const leafCount=count*6;
  const leaves=new THREE.InstancedMesh(leafShape,leafMat,leafCount);
  const dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){
    const side=rnd()<.5?-1:1;
    const distance=rr(5.8,29);
    const x=(side*distance)+(side===1?rr(0,3):rr(-3,0));
    const z=rr(-54,22), h=rr(7.5,16), lean=rr(-.11,.11);
    for(let j=0;j<4;j++){
      dummy.position.set(x+lean*(j+0.5),h*(j+.5)/4,z);
      dummy.rotation.set(0,0,lean);
      dummy.scale.set(rr(.8,1.16),h/4,rr(.8,1.16));dummy.updateMatrix();segments.setMatrixAt(i*4+j,dummy.matrix);
      if(j<3){dummy.position.set(x+lean*(j+1),h*(j+1)/4,z);dummy.scale.set(1,1,1);dummy.rotation.set(0,0,0);dummy.updateMatrix();nodes.setMatrixAt(i*3+j,dummy.matrix)}
    }
    for(let j=0;j<6;j++){
      const angle=rr(0,Math.PI*2);
      dummy.position.set(x+lean*3,rr(h*.62,h*1.02),z);
      dummy.rotation.set(rr(-.4,.4),angle,rr(-.25,.25));dummy.scale.set(rr(1.3,2.2),rr(.8,1.8),rr(1,2.5));dummy.updateMatrix();leaves.setMatrixAt(i*6+j,dummy.matrix)
    }
  }
  for(const inst of [segments,nodes,leaves]){inst.instanceMatrix.needsUpdate=true;inst.frustumCulled=false;scene.add(inst)}
}
function createGarden(){
  const c=colors.dusk;
  scene.background=new THREE.Color(c.sky);
  scene.fog=new THREE.FogExp2(c.fog,.021);
  hemi=new THREE.HemisphereLight(0xd2f2dc,0x102624,1.8);scene.add(hemi);
  keyLight=new THREE.DirectionalLight(0xffd9ae,2.9);keyLight.position.set(-14,26,11);scene.add(keyLight);
  const rim=new THREE.DirectionalLight(0x8fc5d2,.85);rim.position.set(15,9,-16);scene.add(rim);
  const floor=mesh(new THREE.PlaneGeometry(300,300),mat(c.floor),0,-.08,-14);floor.rotation.x=-Math.PI/2;scene.add(floor);
  const river=mesh(new THREE.PlaneGeometry(48,95,1,1), new THREE.MeshStandardMaterial({color:c.water,metalness:.32,roughness:.33,transparent:true,opacity:.96}),17,-.035,-15);
  river.rotation.x=-Math.PI/2;scene.add(river);water=river;
  // Soft floating stones and layered stepping slabs create a navigable depth axis.
  const pathBase=mesh(new THREE.PlaneGeometry(8.0,75),mat(0x2d4240),0,-.005,-17);pathBase.rotation.x=-Math.PI/2;scene.add(pathBase);
  for(let z=11;z>-52;z-=1.45){
    const g=new THREE.Group();g.position.set(rr(-.06,.06),.04,z);scene.add(g);
    const w=rr(3.3,3.9),d=rr(1.28,1.4);
    const slab=box(g,w,.19,d,rr(-.75,-.35),0,0,slate,rr(-.012,.012));
    slab.rotation.y=rr(-.016,.016);
    const slab2=box(g,rr(2,3.3),.18,d,rr(.8,1.2),-.02,0,slate,rr(-.015,.015));slab2.rotation.y=rr(-.016,.016);
    if(rnd()>.64){box(g,rr(.2,.9),.07,rr(.15,.55),rr(-3,3),.07,rr(-.55,.55),moss)}
  }
  for(let z=9;z>-46;z-=5.1){
    for(let s of [-1,1]){
      const x=s*4.16;
      const h=2.15;
      cyl(scene,.22,.27,h,x,h/2,z,darkWood,8);
      sphere(scene,.29,x,h+.12,z,trim,1);
      sphere(scene,.13,x,h+.42,z,darkWood,1);
      if(z>-18){box(scene,.11,.12,5.1,x,1.49,z-2.55,darkWood);box(scene,.1,.12,5.1,x,.87,z-2.55,darkWood)}
    }
  }
  createTorii(-4.2,1);createTorii(-21.5,.86);createTorii(-37,.7);
  for(let z of [3,-12,-27,-42]){createLantern(-5.35,z,.86);createLantern(5.35,z,.86)}
  const low=window.innerWidth<720 || (navigator.deviceMemory||8)<4;
  createBambooForest(low);
  const rockGeo=new THREE.IcosahedronGeometry(1,0);const rockMat=mat(0x445958);
  const rocks=new THREE.InstancedMesh(rockGeo,rockMat,low?75:140);
  const d=new THREE.Object3D();for(let i=0;i<rocks.count;i++){
    const s=rnd()<.5?-1:1;
    d.position.set(s*rr(4.4,32),rr(-.23,.23),rr(-56,18));d.rotation.set(rr(0,Math.PI),rr(0,Math.PI),rr(0,Math.PI));d.scale.set(rr(.25,1.5),rr(.12,.8),rr(.27,1.4));d.updateMatrix();rocks.setMatrixAt(i,d.matrix)
  }rocks.instanceMatrix.needsUpdate=true;scene.add(rocks);
  // Cherry trees: broad, layered clusters in pink, coral and burgundy.
  const cherryTrunk=mat(0x362522);
  for(const t of [{x:7,z:-11,s:1.0},{x:-8,z:-26,s:.9},{x:12,z:-34,s:1.3}]){
    const g=new THREE.Group();g.position.set(t.x,0,t.z);g.scale.setScalar(t.s);scene.add(g);
    cyl(g,.31,.43,5.1,0,2.5,0,cherryTrunk,8);
    const branchMat=cherryTrunk;
    for(let i=0;i<9;i++){
      const a=i*Math.PI*2/9;
      const br=cyl(g,.09,.14,rr(2.1,3.4),Math.cos(a)*.88,4.95,Math.sin(a)*.88,branchMat,5);
      br.rotation.z=Math.sin(a)*.73;br.rotation.x=Math.cos(a)*.64;
    }
    for(let i=0;i<21;i++){
      const shade=[0x9f4252,0xd1747c,0xa75065,0xe78d8e][i%4];
      const leafMat=mat(shade,1);
      sphere(g,rr(.7,1.6),rr(-3.4,3.4),rr(4.9,8),rr(-3.4,3.4),leafMat,1);
    }
    bloomTrees.push(g);
  }
  const flyCount=low?68:175, flyArray=new Float32Array(flyCount*3);
  for(let i=0;i<flyCount;i++){flyArray[i*3]=rr(-27,27);flyArray[i*3+1]=rr(.8,10);flyArray[i*3+2]=rr(-48,16)}
  const flyGeo=new THREE.BufferGeometry();flyGeo.setAttribute('position',new THREE.BufferAttribute(flyArray,3));
  fireflies=new THREE.Points(flyGeo,new THREE.PointsMaterial({color:0xffdda1,size:low?.12:.15,transparent:true,opacity:.81,sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(fireflies);
  const petCount=low?80:210,pPositions=new Float32Array(petCount*3);
  for(let i=0;i<petCount;i++){pPositions[i*3]=rr(-16,18);pPositions[i*3+1]=rr(.4,10);pPositions[i*3+2]=rr(-43,12)}
  const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(pPositions,3));
  petals=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xef9c9d,size:.105,transparent:true,opacity:.8,depthWrite:false}));scene.add(petals);
  const haze=mesh(new THREE.SphereGeometry(85,16,8),new THREE.MeshBasicMaterial({color:0x255257,transparent:true,opacity:.055,side:THREE.BackSide}),0,17,-27);scene.add(haze);
}
function changeSceneTheme(next){
  state.theme=next;const c=colors[next];
  frame.dataset.scene=next;document.getElementById('worldTime').textContent=next==='night'?'MOONLIT / 02':'GOLDEN HOUR / 01';
  if(scene){scene.background.set(c.sky);scene.fog.color.set(c.fog);keyLight.color.set(c.light);keyLight.intensity=next==='night'?1.3:2.9;hemi.intensity=next==='night'?.94:1.8;water.material.color.set(c.water);}
  document.getElementById('worldDayBtn').setAttribute('aria-pressed',String(next==='dusk'));
  document.getElementById('worldNightBtn').setAttribute('aria-pressed',String(next==='night'));
}
function resize(){if(!renderer)return;const w=Math.max(1,frame.clientWidth),h=Math.max(1,frame.clientHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,state.detail==='low'?1:(innerWidth<700?1.25:1.65)*qualityScale));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<700?67:w<1100?62:54;camera.updateProjectionMatrix()}
function startLoop(){if(!raf&&renderer&&!document.hidden&&(visible||state.immersive)){clock?.getDelta();raf=requestAnimationFrame(tick)}}
function tick(){
  raf=null;
  if(document.hidden||(!visible&&!state.immersive)||!renderer)return;
  const dt=Math.min(clock.getDelta(),.05),time=performance.now()*.001;
  if(dt>.035&&qualityScale===1&&++slowFrameCount>28){qualityScale=.75;resize()}else if(dt<.029)slowFrameCount=Math.max(0,slowFrameCount-1);
  if(state.motion){
    const preset=state.wanted||cameras[state.preset];
    const pos=v(...preset.position);const tar=v(...preset.target);
    if(!state.immersive){pos.x+=mouse.x*.55;pos.y+=mouse.y*.22;tar.x+=mouse.x*.35;tar.y+=mouse.y*.11}
    else {pos.x+=mouse.x*.95;tar.x+=mouse.x*1.3;tar.y+=mouse.y*.75}
    const easing=1-Math.exp(-dt*2.1);
    pose.lerp(pos,easing);look.lerp(tar,easing);
    fireflies.material.opacity=.53+Math.sin(time*1.2)*.23;
    petals.rotation.y=Math.sin(time*.10)*.012;
  }
  camera.position.copy(pose);camera.lookAt(look);
  if(heroSpot){heroSpot.position.x+=(mouse.x*5-heroSpot.position.x)*.08;heroSpot.position.y+=(4+mouse.y*2-heroSpot.position.y)*.08;heroSpot.intensity=state.motion?1.12+Math.abs(mouse.x)*.25:.6}
  renderer.render(scene,camera);
  raf=requestAnimationFrame(tick);
}
function setPreset(id){if(!cameras[id])return;state.preset=id;document.querySelectorAll('[data-world-view]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.worldView===id)))}
function saveFrame(){if(!renderer)return;try{renderer.render(scene,camera);const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='lamberthrumpaidus-immersive-garden.png';a.click()}catch{document.getElementById('worldError').textContent='Gambar tidak dapat disimpan di browser ini.'}}
function init(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:innerWidth>=720,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
    renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.32;
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(54,1,.08,210);clock=new THREE.Clock();createGarden();heroSpot=new THREE.PointLight(0xffd8ac,1.1,26,1.65);heroSpot.position.set(2,4,4);scene.add(heroSpot);resize();startLoop();
    fallback.hidden=true;
  }catch(error){console.warn('3D mode unavailable, using accessible fallback.',error);canvas.style.display='none';fallback.hidden=false;frame.classList.add('world-unavailable');document.getElementById('worldPhotoBtn').disabled=true;document.getElementById('worldQualityBtn').disabled=true;document.getElementById('worldMotionBtn').disabled=true;document.querySelectorAll('[data-world-view]').forEach(b=>{b.disabled=true;b.title='Kamera 3D memerlukan WebGL'});document.getElementById('worldError').textContent='Mode 3D tidak didukung pada perangkat ini. Seluruh portofolio tetap bisa digunakan.'}
}

frame.addEventListener('pointermove',e=>{if(!state.motion)return;const r=frame.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width-.5)*2;mouse.y=-((e.clientY-r.top)/r.height-.5)*2},{passive:true});
frame.addEventListener('pointerleave',()=>{mouse.x=0;mouse.y=0});
frame.addEventListener('touchmove',e=>{const t=e.touches[0];if(!t||!state.motion)return;const r=frame.getBoundingClientRect();mouse.x=Math.max(-1,Math.min(1,((t.clientX-r.left)/r.width-.5)*2));mouse.y=-Math.max(-1,Math.min(1,((t.clientY-r.top)/r.height-.5)*2))},{passive:true});
new ResizeObserver(resize).observe(frame);
new IntersectionObserver(e=>{visible=!!e[0]?.isIntersecting;if(visible)startLoop()},{threshold:.01}).observe(frame);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=null}else startLoop()});
canvas?.addEventListener('webglcontextlost',e=>{e.preventDefault();if(raf)cancelAnimationFrame(raf);raf=null;renderer=null;canvas.hidden=true;fallback.hidden=false});
document.querySelectorAll('[data-world-view]').forEach(btn=>btn.addEventListener('click',()=>setPreset(btn.dataset.worldView)));
document.getElementById('worldDayBtn').addEventListener('click',()=>changeSceneTheme('dusk'));
document.getElementById('worldNightBtn').addEventListener('click',()=>changeSceneTheme('night'));
document.getElementById('worldPhotoBtn').addEventListener('click',saveFrame);
document.getElementById('worldQualityBtn').addEventListener('click',()=>{state.detail=state.detail==='high'?'low':'high';document.getElementById('worldQualityBtn').textContent=state.detail==='high'?'HD':'ECO';resize()});
document.getElementById('worldMotionBtn').addEventListener('click',()=>{state.motion=!state.motion;document.getElementById('worldMotionBtn').setAttribute('aria-pressed',String(state.motion));document.getElementById('worldMotionBtn').textContent=state.motion?'Motion on':'Motion off'});
const expBtn=document.getElementById('worldExploreBtn'),exitBtn=document.getElementById('worldExitBtn');
function setImmersive(enabled){state.immersive=enabled;document.body.classList.toggle('world-immersive',enabled);expBtn?.setAttribute('aria-expanded',String(enabled));exitBtn.hidden=!enabled; if(enabled){frame.scrollIntoView({block:'start'});setPreset('gate')}else{setPreset('arrival');mouse.x=0;mouse.y=0}resize()}
exitBtn.addEventListener('click',()=>setImmersive(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.immersive)setImmersive(false);if(state.immersive&&['1','2','3','4'].includes(e.key))setPreset(['arrival','gate','water','bamboo'][+e.key-1])});
window.addEventListener('resize',resize,{passive:true});
init();
function synchronizeSceneWithPage(){const light=document.documentElement.dataset.theme==='light';changeSceneTheme(light?'dusk':'night')}
new MutationObserver(synchronizeSceneWithPage).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
synchronizeSceneWithPage();
