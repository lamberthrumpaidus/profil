/* ALL Create by LamberthRumpaidus — one reused WebGL shader for project covers.
   The DOM image remains the accessible fallback; shaders only load on pointer hover. */
const fine=matchMedia('(hover:hover) and (pointer:fine)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
if(fine.matches&&!reduced.matches&&innerWidth>=900){
 let THREE=null,renderer=null,scene=null,camera=null,mesh=null,material=null,texture=null,active=null,raf=0,last=0,token=0,mouse={x:.5,y:.5},visible=true;
 const canvas=document.createElement('canvas');canvas.className='shader-project-canvas';canvas.setAttribute('aria-hidden','true');
 const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
 const fragmentShader=String.raw`precision mediump float;
uniform sampler2D uTexture;
uniform float uTime,uStrength,uViewAspect,uImageAspect;
uniform vec2 uMouse;
varying vec2 vUv;
vec2 fitUV(vec2 uv){vec2 d=uv-.5;if(uViewAspect>uImageAspect)d.x*=uViewAspect/uImageAspect;else d.y*=uImageAspect/uViewAspect;return d+.5;}
void main(){
 vec2 uv=fitUV(vUv);
 if(any(lessThan(uv,vec2(0.0)))||any(greaterThan(uv,vec2(1.0)))){gl_FragColor=vec4(.04,.092,.125,1.);return;}
 vec2 center=fitUV(uMouse),delta=uv-center;
 float dist=length(delta);
 float wave=sin(dist*29.-uTime*5.7)*exp(-dist*12.)*.017*uStrength;
 vec2 ripple=normalize(delta+vec2(.00001))*wave;
 vec2 aberration=normalize(delta+vec2(.00001))*.005*uStrength;
 float red=texture2D(uTexture,clamp(uv+ripple+aberration,0.,1.)).r;
 float green=texture2D(uTexture,clamp(uv+ripple,0.,1.)).g;
 float blue=texture2D(uTexture,clamp(uv+ripple-aberration,0.,1.)).b;
 gl_FragColor=vec4(vec3(red,green,blue),1.);
}`;
 async function init(){
   if(THREE)return true;
   try{
     const mod=await import('./lib/three.module.js');THREE=mod;
     renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});
     renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.2));
     scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
     return true;
   }catch(e){console.warn('Project shader unavailable; using CSS fallback.',e);THREE=null;return false}
 }
 const stop=()=>{
   token++;cancelAnimationFrame(raf);raf=0;
   if(active){active.img.style.opacity='';active=null}
   canvas.remove();if(texture){texture.dispose();texture=null}if(material){material.dispose();material=null}if(mesh){scene?.remove(mesh);mesh.geometry.dispose();mesh=null}
 };
 async function enter(holder){
   const img=holder.querySelector('img');
   if(!img||!img.complete||img.naturalWidth<1)return;
   if(active)stop();
   const myToken=++token;
   if(!await init()||token!==myToken)return;
   const src=img.currentSrc||img.src;
   const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
   loader.load(src,loaded=>{
     if(token!==myToken){loaded.dispose();return}
     texture=loaded;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
     material=new THREE.ShaderMaterial({uniforms:{uTexture:{value:texture},uTime:{value:0},uStrength:{value:0},uMouse:{value:new THREE.Vector2(.5,.5)},uViewAspect:{value:1},uImageAspect:{value:img.naturalWidth/img.naturalHeight}},vertexShader,fragmentShader,depthTest:false,depthWrite:false});
     mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);scene.add(mesh);
     holder.append(canvas);active={holder,img};img.style.opacity='0';mouse={x:.5,y:.5};resize();start();
   },undefined,()=>{if(token===myToken)stop()});
 }
 function resize(){if(!active||!renderer)return;const r=active.holder.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);material.uniforms.uViewAspect.value=r.width/r.height}
 function draw(time){raf=0;if(!active||!visible||document.hidden)return;if(time-last<30){raf=requestAnimationFrame(draw);return}last=time;
   material.uniforms.uTime.value=time*.001;material.uniforms.uStrength.value=Math.min(1,material.uniforms.uStrength.value+.065);
   material.uniforms.uMouse.value.lerp(new THREE.Vector2(mouse.x,mouse.y),.22);
   renderer.render(scene,camera);raf=requestAnimationFrame(draw);
 }
 function start(){if(!raf&&active)raf=requestAnimationFrame(draw)}
 document.addEventListener('pointerover',e=>{
   const holder=e.target.closest('.project-card .project-visual,.feature-card .project-visual');
   if(holder&&!holder.contains(e.relatedTarget))void enter(holder);
 });
 document.addEventListener('pointerout',e=>{
   const holder=e.target.closest('.project-card .project-visual,.feature-card .project-visual');
   if(holder&&!holder.contains(e.relatedTarget))stop();
 });
 document.addEventListener('pointermove',e=>{
   if(!active)return;const r=active.holder.getBoundingClientRect();
   mouse.x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));mouse.y=1-Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
 },{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else start()});
 window.addEventListener('resize',()=>{resize();start()},{passive:true});
 window.addEventListener('scroll',()=>{if(!active)return;const r=active.holder.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)stop()},{passive:true});
}
