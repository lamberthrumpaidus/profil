/* ALL Create by LamberthRumpaidus */
(()=>{'use strict';const root=document.documentElement,theme=document.getElementById('themeSwitch'),print=document.getElementById('printBoard'),notice=document.getElementById('notice');let timer;
const announce=msg=>{notice.textContent=msg;clearTimeout(timer);timer=setTimeout(()=>notice.textContent='',2600)};
const getTheme=()=>{try{return localStorage.getItem('portfolio-theme')}catch{return null}};
function setTheme(light){root.dataset.theme=light?'light':'dark';theme.textContent=light?'Tema gelap':'Tema terang';theme.setAttribute('aria-pressed',String(light))}
setTheme(getTheme()==='light');theme.hidden=false;theme.onclick=()=>{const light=root.dataset.theme!=='light';setTheme(light);try{localStorage.setItem('portfolio-theme',light?'light':'dark')}catch{}};
print.hidden=false;print.onclick=()=>window.print();
document.querySelectorAll('[data-hex]').forEach(b=>{b.hidden=false;b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.hex);announce('Kode warna '+b.dataset.hex+' disalin.')}catch{announce('Kode warna: '+b.dataset.hex)}}});
const canvas=document.getElementById('motionCanvas'),button=document.getElementById('motionToggle'),ctx=canvas.getContext('2d');if(!ctx)return;const reduce=matchMedia('(prefers-reduced-motion: reduce)');let playing=!reduce.matches,visible=true,raf=0,w=1,h=1,t=0,last=0;
function paint(){ctx.clearRect(0,0,w,h);ctx.fillStyle='#26363a';ctx.fillRect(0,0,w,h);for(let j=0;j<13;j++){ctx.beginPath();ctx.strokeStyle='rgba(166,196,189,'+(.13+j*.023)+')';ctx.lineWidth=1.2;for(let x=0;x<=w;x+=5){const y=h*.36+j*11+Math.sin(x*.013+t*.7+j*.23)*22+Math.sin(x*.006-t*.3)*14;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()}for(let j=0;j<28;j++){const x=((j*97+t*(8+j%4))%w+w)%w,y=h*.5+Math.sin(j*2.7+t*.55)*h*.4;ctx.fillStyle=j%4===0?'#ddc5a4':'#b7cbb5';ctx.globalAlpha=.35+(j%3)*.18;ctx.beginPath();ctx.arc(x,y,1+j%3*.45,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
function tick(now){raf=0;if(!playing||!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.04):0;last=now;t+=dt;paint();start()}
function start(){if(playing&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(tick)}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
function resize(){const box=canvas.getBoundingClientRect();w=Math.max(1,box.width);h=Math.max(1,box.height);const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);paint();start()}
function sync(){button.textContent=playing?'Jeda animasi':'Putar animasi';button.setAttribute('aria-pressed',String(!playing));playing?start():stop()}
button.hidden=false;button.onclick=()=>{playing=!playing;sync()};reduce.addEventListener?.('change',()=>{playing=!reduce.matches;sync()});
if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);else addEventListener('resize',resize);
if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;visible?start():stop()}).observe(canvas);
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());resize();sync();
})();