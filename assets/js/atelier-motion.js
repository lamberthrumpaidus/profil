/* ALL Create by LamberthRumpaidus — Canvas atmospheric effects and motion feedback. */
(()=>{'use strict';
 const canvas=document.getElementById('atmosphereCanvas'),hero=document.querySelector('.immersive-hero'),toggle=document.getElementById('worldMotionBtn');
 if(!canvas||!hero)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let w=1,h=1,dpr=1,raf=0,visible=true,last=0,elapsed=0,particles=[],bursts=[];
 let pointer={x:.68,y:.5,tx:.68,ty:.5};
 const r=(a,b)=>a+Math.random()*(b-a);
 const active=()=>visible&&!document.hidden&&!reduce.matches&&(toggle?.getAttribute('aria-pressed')!=='false'||toggle?.disabled);
 const mobile=()=>innerWidth<700;
 function setup(){
   w=Math.max(1,hero.clientWidth);h=Math.max(1,hero.clientHeight);
   dpr=Math.min(devicePixelRatio||1,mobile()?1.15:1.5);
   canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);
   particles=Array.from({length:mobile()?22:48},(_,i)=>({x:r(0,w),y:r(0,h),size:r(.7,2.7),speed:r(7,19),phase:r(0,Math.PI*2),depth:r(.3,1),petal:i%4===0,spin:r(-1.3,1.3)}));
   draw(0);start();
 }
 function draw(dt){
   elapsed+=dt;ctx.clearRect(0,0,w,h);
   const k=1-Math.exp(-dt*4);pointer.x+=(pointer.tx-pointer.x)*k;pointer.y+=(pointer.ty-pointer.y)*k;
   const x=w*(.64+(pointer.x-.5)*.065),y=h*(.31+(pointer.y-.5)*.05);
   const grad=ctx.createRadialGradient(x,y,0,x,y,Math.max(w,h)*.53);grad.addColorStop(0,'rgba(219,201,161,0.085)');grad.addColorStop(.48,'rgba(164,189,166,0.03)');grad.addColorStop(1,'rgba(164,189,166,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
   if(reduce.matches)return;
   for(const p of particles){
     p.x+=dt*(p.speed*.40+Math.sin(elapsed*.65+p.phase)*7)*p.depth;p.y+=dt*(p.petal?p.speed:-p.speed*.4)*p.depth;
     if(p.x>w+12)p.x=-12;if(p.x< -12)p.x=w+12;if(p.y>h+12)p.y=-12;if(p.y< -12)p.y=h+12;
     const opacity=(.24+.21*Math.sin(elapsed*.85+p.phase))*p.depth,px=p.x+(pointer.x-.5)*20*p.depth,py=p.y+(pointer.y-.5)*12*p.depth;
     ctx.save();ctx.translate(px,py);ctx.globalAlpha=opacity;
     if(p.petal){ctx.rotate(elapsed*p.spin+p.phase);ctx.fillStyle='#d7b6a1';ctx.beginPath();ctx.ellipse(0,0,p.size*1.8,p.size*.7,0,0,Math.PI*2);ctx.fill();}
     else{ctx.fillStyle='#e3d5ad';ctx.beginPath();ctx.arc(0,0,p.size*.72,0,Math.PI*2);ctx.fill();}
     ctx.restore();
   }
   for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.age+=dt;const a=1-b.age/.6;if(a<=0){bursts.splice(i,1);continue;}ctx.strokeStyle='rgba(226,214,179,'+(a*.46)+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(b.x,b.y,8+(1-a)*45,0,Math.PI*2);ctx.stroke();}
 }
 function frame(t){raf=0;if(!active()){last=0;return;}const dt=last?Math.min((t-last)/1000,.04):0;last=t;draw(dt);start();}
 function start(){if(!raf&&active())raf=requestAnimationFrame(frame);}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;draw(0);}
 hero.addEventListener('pointermove',e=>{const b=hero.getBoundingClientRect();pointer.tx=(e.clientX-b.left)/Math.max(1,b.width);pointer.ty=(e.clientY-b.top)/Math.max(1,b.height);},{passive:true});
 hero.addEventListener('pointerleave',()=>{pointer.tx=.68;pointer.ty=.5;});
 hero.addEventListener('pointerdown',e=>{if(!active()||e.target.closest('button,a'))return;const b=hero.getBoundingClientRect();bursts.push({x:e.clientX-b.left,y:e.clientY-b.top,age:0});if(bursts.length>8)bursts.shift();},{passive:true});
 if('ResizeObserver'in window)new ResizeObserver(setup).observe(hero);else window.addEventListener('resize',setup,{passive:true});
 if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;visible?start():stop();},{threshold:0.01}).observe(hero);
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 reduce.addEventListener?.('change',()=>active()?start():stop());
 if(toggle)new MutationObserver(()=>active()?start():stop()).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
 // One short compositor-friendly reaction on controls; no delay or navigation blocking.
 document.addEventListener('pointerdown',e=>{const el=e.target.closest('button,.button,.project-source-link');if(!el||reduce.matches||el.disabled||!el.animate)return;el.animate([{scale:'1'},{scale:'.97'},{scale:'1'}],{duration:210,easing:'cubic-bezier(.2,.65,.2,1)'});},{passive:true});
 setup();
})();