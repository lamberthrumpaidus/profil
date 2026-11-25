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
let riverUniforms, foliageUniform={value:0}, flyBase, petBase, fishSchool=[], lanterns=[], surfaceTime=0;
const pointerTarget={x:0,y:0}, smoothPointer={x:0,y:0};
let pose = new THREE.Vector3(...cameras.arrival.position), look = new THREE.Vector3(...cameras.arrival.target);
const mouse = {x:0,y:0}; const targets = {x:0,y:0};
let raf = null; let visible = true;
const colors = { dusk: {fog:0x465958, sky:0x465958, floor:0x33483e, water:0x416b69, light:0xffe1b8, lamp:0xe7c18c}, night:{fog:0x263740,sky:0x263740,floor:0x253b37,water:0x294e5b,light:0x9eb8cb,lamp:0xe7c18c}};
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
  const light=new THREE.PointLight(0xffce91,1.35,8,2);light.position.set(0,2.8,0);g.add(light);lanterns.push({light,glass,phase:rr(0,6.28)});
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
  leafMat.onBeforeCompile=shader=>{shader.uniforms.uWind=foliageUniform;shader.vertexShader='uniform float uWind;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(uWind * 1.15 + instanceMatrix[3].x * 0.43 + instanceMatrix[3].z * 0.22) * 0.15 * abs(position.z);');};
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

function makeWater(c){
  riverUniforms={uTime:{value:0},uWater:{value:new THREE.Color(c.water)},uFog:{value:new THREE.Color(c.fog)},uSun:{value:new THREE.Color(0xd5c4a5)},uNight:{value:0}};
  const material=new THREE.ShaderMaterial({uniforms:riverUniforms,vertexShader:`
  varying vec3 vWorld;
  void main(){vec4 w=modelMatrix*vec4(position,1.0);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`
  uniform float uTime; uniform vec3 uWater,uFog,uSun; uniform float uNight;
  varying vec3 vWorld;
  void main(){
    vec2 p=vWorld.xz;float t=uTime;
    float a=sin(p.x*1.37+p.y*.48-t*1.28);
    float b=sin(p.x*.61-p.y*1.8+t*.86);
    float c=sin(p.x*3.3+p.y*2.1+t*.62);
    vec3 n=normalize(vec3(.12*a+.055*c,1.0,.12*b));
    vec3 viewDir=normalize(cameraPosition-vWorld);
    vec3 lightDir=normalize(vec3(-.45,.76,.43));
    vec3 halfDir=normalize(lightDir+viewDir);
    float spec=pow(max(dot(n,halfDir),0.0),75.0)*.66;
    float fres=pow(1.0-max(dot(n,viewDir),0.0),3.0);
    float ripple=pow(.5+.5*sin(p.y*4.2+p.x*.7+a*.8-t*.65),14.0);
    float glow=exp(-abs(p.x-6.0)*.14)*(.48+.52*sin(p.y*.7+a*.2)*sin(p.y*.7+a*.2));
    vec3 color=mix(uWater*.72,uFog*1.13,fres*.62)+uSun*(spec+glow*ripple*.11)*(1.0-uNight*.35);
    color+=vec3(.055,.085,.073)*(a+b+c)*.35;
    float d=length(cameraPosition-vWorld);
    float fog=1.0-exp(-d*d*.00045);
    gl_FragColor=vec4(mix(color,uFog,clamp(fog,0.0,.94)),1.0);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`});
  return material;
}
function createFish(low){
 const bodyGeo=new THREE.SphereGeometry(1,12,8), finGeo=new THREE.ConeGeometry(.17,.36,3);
 const palette=[0xcaa177,0xb8c2ae,0xb8755c];
 for(let i=0;i<(low?5:12);i++){
   const group=new THREE.Group();const material=mat(palette[i%3],.62);
   const body=mesh(bodyGeo,material,0,0,0);body.scale.set(.13,.09,.38);group.add(body);
   const tailPivot=new THREE.Group();tailPivot.position.z=-.31;group.add(tailPivot);
   const tail=mesh(finGeo,material,0,0,-.13);tail.rotation.x=-Math.PI/2;tail.scale.set(.6,1,1);tailPivot.add(tail);
   const fin=mesh(finGeo,material,0,.08,-.02);fin.scale.set(.35,.65,.6);group.add(fin);
   scene.add(group);fishSchool.push({group,tailPivot,phase:rr(0,6.28),speed:rr(.18,.36),radius:rr(1.5,3.1),x:rr(8.5,15),z:rr(-25,0)});
 }
}
function animateWorld(dt,time){
  surfaceTime+=dt;foliageUniform.value=surfaceTime;
  if(riverUniforms)riverUniforms.uTime.value=surfaceTime;
  if(flyBase){const attr=fireflies.geometry.attributes.position;for(let i=0;i<attr.count;i++){const j=i*3,p=i*1.71;attr.array[j]=flyBase[j]+Math.sin(time*.51+p)*.52;attr.array[j+1]=flyBase[j+1]+Math.sin(time*.69+p)*.32;attr.array[j+2]=flyBase[j+2]+Math.cos(time*.32+p)*.38;}attr.needsUpdate=true;fireflies.material.opacity=.66+Math.sin(time*1.02)*.14;}
  if(petBase){const attr=petals.geometry.attributes.position;for(let i=0;i<attr.count;i++){const j=i*3,p=i*.83;attr.array[j]=petBase[j]+Math.sin(time*.43+p)*.8;attr.array[j+1]=.35+((petBase[j+1]+10-(surfaceTime*(.24+i%5*.04))%10)%10+10)%10;attr.array[j+2]=petBase[j+2]+Math.sin(time*.22+p)*.7;}attr.needsUpdate=true;}
  lanterns.forEach(({light,glass,phase})=>{const wave=.94+.045*Math.sin(time*2.4+phase)+.025*Math.sin(time*6.7+phase);light.intensity=1.35*wave;glass.material.opacity=.65+.09*wave});
  bloomTrees.forEach((tree,i)=>{tree.rotation.z=Math.sin(time*.58+i*2)*.009;tree.rotation.x=Math.cos(time*.4+i)*.006});
  fishSchool.forEach(({group,tailPivot,phase,speed,radius,x,z})=>{const a=surfaceTime*speed+phase;group.position.set(x+Math.cos(a)*radius,.018+Math.sin(a*2)*.012,z+Math.sin(a)*radius*1.45);group.rotation.y=Math.atan2(-Math.sin(a),Math.cos(a)*1.45);tailPivot.rotation.y=Math.sin(surfaceTime*6+phase)*.42;group.rotation.z=Math.sin(surfaceTime*3+phase)*.06});
}

function createGarden(){
  const c=colors.dusk;
  scene.background=new THREE.Color(c.sky);
  scene.fog=new THREE.FogExp2(c.fog,.021);
  hemi=new THREE.HemisphereLight(0xd2f2dc,0x102624,1.8);scene.add(hemi);
  keyLight=new THREE.DirectionalLight(0xffd9ae,2.9);keyLight.position.set(-14,26,11);scene.add(keyLight);
  const rim=new THREE.DirectionalLight(0x8fc5d2,.85);rim.position.set(15,9,-16);scene.add(rim);
  const floor=mesh(new THREE.PlaneGeometry(300,300),mat(c.floor),0,-.08,-14);floor.rotation.x=-Math.PI/2;scene.add(floor);
  const river=mesh(new THREE.PlaneGeometry(48,95,1,1), makeWater(c),17,-.035,-15);
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
  createBambooForest(low);createFish(low);
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
  flyBase=flyArray.slice();fireflies=new THREE.Points(flyGeo,new THREE.PointsMaterial({color:0xffdda1,size:low?.12:.15,transparent:true,opacity:.81,sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(fireflies);
  const petCount=low?80:210,pPositions=new Float32Array(petCount*3);
  for(let i=0;i<petCount;i++){pPositions[i*3]=rr(-16,18);pPositions[i*3+1]=rr(.4,10);pPositions[i*3+2]=rr(-43,12)}
  const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(pPositions,3));
  petBase=pPositions.slice();petals=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xef9c9d,size:.105,transparent:true,opacity:.8,depthWrite:false}));scene.add(petals);
  const haze=mesh(new THREE.SphereGeometry(85,16,8),new THREE.MeshBasicMaterial({color:0x255257,transparent:true,opacity:.055,side:THREE.BackSide}),0,17,-27);scene.add(haze);
}
function changeSceneTheme(next){
  state.theme=next;const c=colors[next];
  frame.dataset.scene=next;document.getElementById('worldTime').textContent=next==='night'?'MOONLIT / 02':'GOLDEN HOUR / 01';
  if(scene){scene.background.set(c.sky);scene.fog.color.set(c.fog);keyLight.color.set(c.light);keyLight.intensity=next==='night'?1.3:2.9;hemi.intensity=next==='night'?.94:1.8;riverUniforms.uWater.value.set(c.water);riverUniforms.uFog.value.set(c.fog);riverUniforms.uNight.value=next==='night'?1:0;startLoop();}
  document.getElementById('worldDayBtn').setAttribute('aria-pressed',String(next==='dusk'));
  document.getElementById('worldNightBtn').setAttribute('aria-pressed',String(next==='night'));
}
function resize(){if(!renderer)return;const w=Math.max(1,frame.clientWidth),h=Math.max(1,frame.clientHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,state.detail==='low'?1:(innerWidth<700?1.25:1.65)*qualityScale));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<700?67:w<1100?62:54;camera.updateProjectionMatrix();startLoop()}
function startLoop(){if(!raf&&renderer&&!document.hidden&&(visible||state.immersive)){clock?.getDelta();raf=requestAnimationFrame(tick)}}
function tick(){
  raf=null;
  if(document.hidden||(!visible&&!state.immersive)||!renderer)return;
  const dt=Math.min(clock.getDelta(),.05),time=surfaceTime;
  if(dt>.035&&qualityScale===1&&++slowFrameCount>28){qualityScale=.75;resize()}else if(dt<.029)slowFrameCount=Math.max(0,slowFrameCount-1);
  const preset=state.wanted||cameras[state.preset];
  if(state.motion){
    const damping=1-Math.exp(-dt*5.5);smoothPointer.x+=(mouse.x-smoothPointer.x)*damping;smoothPointer.y+=(mouse.y-smoothPointer.y)*damping;
    const pos=v(...preset.position);const tar=v(...preset.target);
    if(!state.immersive){pos.x+=smoothPointer.x*.78+Math.sin(time*.18)*.16;pos.y+=smoothPointer.y*.31+Math.sin(time*.3)*.055;tar.x+=smoothPointer.x*.46;tar.y+=smoothPointer.y*.20}
    else {pos.x+=smoothPointer.x*.95;tar.x+=smoothPointer.x*1.3;tar.y+=smoothPointer.y*.75}
    const easing=1-Math.exp(-dt*3.6);
    pose.lerp(pos,easing);look.lerp(tar,easing);
    animateWorld(dt,time);
  }else{pose.set(...preset.position);look.set(...preset.target);}
  camera.position.copy(pose);camera.lookAt(look);
  if(heroSpot){heroSpot.position.x+=(mouse.x*5-heroSpot.position.x)*.08;heroSpot.position.y+=(4+mouse.y*2-heroSpot.position.y)*.08;heroSpot.intensity=state.motion?1.12+Math.abs(mouse.x)*.25:.6}
  renderer.render(scene,camera);
  if(state.motion)raf=requestAnimationFrame(tick);
}
function setPreset(id){if(!cameras[id])return;state.preset=id;startLoop();document.querySelectorAll('[data-world-view]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.worldView===id)))}
function saveFrame(){if(!renderer)return;try{renderer.render(scene,camera);const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='lamberthrumpaidus-immersive-garden.png';a.click()}catch{document.getElementById('worldError').textContent='Gambar tidak dapat disimpan di browser ini.'}}
function init(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:innerWidth>=720,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
    renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.10;
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(54,1,.08,210);clock=new THREE.Clock();createGarden();heroSpot=new THREE.PointLight(0xffd8ac,1.1,26,1.65);heroSpot.position.set(2,4,4);scene.add(heroSpot);resize();startLoop();
    fallback.hidden=true;
  }catch(error){console.warn('3D mode unavailable, using accessible fallback.',error);canvas.style.display='none';fallback.hidden=false;frame.classList.add('world-unavailable');document.getElementById('worldPhotoBtn').disabled=true;document.getElementById('worldQualityBtn').disabled=true;document.getElementById('worldMotionBtn').disabled=true;document.querySelectorAll('[data-world-view]').forEach(b=>{b.disabled=true;b.title='Kamera 3D memerlukan WebGL'});document.getElementById('worldError').textContent='Mode 3D tidak didukung pada perangkat ini. Seluruh portofolio tetap bisa digunakan.'}
}

frame.addEventListener('pointermove',e=>{if(!state.motion)return;const r=frame.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width-.5)*2;mouse.y=-((e.clientY-r.top)/r.height-.5)*2},{passive:true});
frame.addEventListener('pointerleave',()=>{mouse.x=0;mouse.y=0});
frame.addEventListener('touchmove',e=>{const t=e.touches[0];if(!t||!state.motion)return;const r=frame.getBoundingClientRect();mouse.x=Math.max(-1,Math.min(1,((t.clientX-r.left)/r.width-.5)*2));mouse.y=-Math.max(-1,Math.min(1,((t.clientY-r.top)/r.height-.5)*2))},{passive:true});
if('ResizeObserver'in window)new ResizeObserver(resize).observe(frame);
if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=!!e[0]?.isIntersecting;if(visible)startLoop()},{threshold:.01}).observe(frame);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=null}else startLoop()});
canvas?.addEventListener('webglcontextlost',e=>{e.preventDefault();if(raf)cancelAnimationFrame(raf);raf=null;renderer=null;canvas.hidden=true;fallback.hidden=false});
document.querySelectorAll('[data-world-view]').forEach(btn=>btn.addEventListener('click',()=>setPreset(btn.dataset.worldView)));
document.getElementById('worldDayBtn').addEventListener('click',()=>changeSceneTheme('dusk'));
document.getElementById('worldNightBtn').addEventListener('click',()=>changeSceneTheme('night'));
document.getElementById('worldPhotoBtn').addEventListener('click',saveFrame);
document.getElementById('worldQualityBtn').addEventListener('click',()=>{state.detail=state.detail==='high'?'low':'high';document.getElementById('worldQualityBtn').textContent=state.detail==='high'?'HD':'ECO';resize()});
document.getElementById('worldMotionBtn').addEventListener('click',()=>{state.motion=!state.motion;document.getElementById('worldMotionBtn').setAttribute('aria-pressed',String(state.motion));document.getElementById('worldMotionBtn').textContent=state.motion?'Animasi aktif':'Animasi nonaktif';startLoop()});
const expBtn=document.getElementById('worldExploreBtn'),exitBtn=document.getElementById('worldExitBtn');
function setImmersive(enabled){state.immersive=enabled;document.body.classList.toggle('world-immersive',enabled);expBtn?.setAttribute('aria-expanded',String(enabled));exitBtn.hidden=!enabled; if(enabled){frame.scrollIntoView({block:'start'});setPreset('gate')}else{setPreset('arrival');mouse.x=0;mouse.y=0}resize()}
exitBtn.addEventListener('click',()=>setImmersive(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.immersive)setImmersive(false);if(state.immersive&&['1','2','3','4'].includes(e.key))setPreset(['arrival','gate','water','bamboo'][+e.key-1])});
window.addEventListener('resize',resize,{passive:true});
init();
const motionPref=matchMedia('(prefers-reduced-motion: reduce)');
function syncMotion(){state.motion=!motionPref.matches;const b=document.getElementById('worldMotionBtn');b.setAttribute('aria-pressed',String(state.motion));b.textContent=state.motion?'Animasi aktif':'Animasi nonaktif';startLoop()}
motionPref.addEventListener?.('change',syncMotion);syncMotion();
function synchronizeSceneWithPage(){const light=document.documentElement.dataset.theme==='light';changeSceneTheme(light?'dusk':'night')}
new MutationObserver(synchronizeSceneWithPage).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
synchronizeSceneWithPage();
