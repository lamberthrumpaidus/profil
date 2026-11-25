/* ALL Create by LamberthRumpaidus — terminal interface. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),out=$('terminalDisplay'),input=$('terminalCommand'),form=$('terminalForm'),prompt=$('terminalPrompt');if(!out||!input||!form||!window.PortfolioShell)return;
 const root=document.documentElement,lang=()=>root.lang==='en'?'en':'id',tr=(a,b)=>lang()==='en'?b:a;
 const engine=window.PortfolioShell.createShell({projects:[...(window.PORTFOLIO_PROJECTS||[]),...(window.PORTFOLIO_ACADEMIC||[])],skills:window.PORTFOLIO_SKILLS||[],language:lang,theme:()=>root.dataset.theme==='light'?'light':'dark'});
 let cursor=0,draft='';
 function append(text,kind='normal',url){const el=document.createElement('div');el.className='shell-line shell-'+kind;if(url){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=text+' ↗';el.append(a)}else el.textContent=text||' ';out.append(el);while(out.children.length>450)out.firstElementChild.remove();}
 function bottom(){out.scrollTop=out.scrollHeight}
 let welcomeNodes=[];
 function welcomeText(){return [tr('Sesi terminal','Terminal session'),tr('Sistem berkas virtual dengan akses baca saja.','Read-only virtual filesystem.'),tr('Jalankan perintah help untuk menampilkan panduan.','Run help to view the command reference.'),tr('Contoh: ','Examples: ')+'ls  ·  cd projects  ·  github  ·  search WebGL  ·  mean 10 20 30']}
 function welcome(){out.replaceChildren();const labels=welcomeText();labels.forEach((label,i)=>append(label,['accent','muted','normal','muted'][i]));welcomeNodes=Array.from(out.children);bottom()}
 function syncWelcome(){const labels=welcomeText();welcomeNodes.forEach((node,i)=>{if(node.isConnected&&node.textContent!==labels[i])node.textContent=labels[i]})}
 function sync(){prompt.textContent=engine.prompt;input.setAttribute('aria-label',tr('Perintah terminal','Terminal command'));out.setAttribute('aria-label',tr('Keluaran terminal','Terminal output'));}
 function run(raw){if(!raw.trim())return;append(engine.prompt+' '+raw,'command');let result;try{result=engine.run(raw)}catch{append(tr('Perintah tidak dapat diproses. Periksa sintaks atau jalankan help.','Unable to process command.'),'error');bottom();return}if(result.clear)out.replaceChildren();for(const row of result.rows)append(row.text,row.kind,row.url);if(result.theme){root.dataset.theme=result.theme;try{localStorage.setItem('portfolio-theme',result.theme)}catch{}}if(result.language&&result.language!==lang())$('languageBtn')?.click();if(result.open){try{window.open(result.open,'_blank','noopener,noreferrer')}catch{}}cursor=engine.history.length;draft='';sync();bottom()}
 form.addEventListener('submit',e=>{e.preventDefault();run(input.value);input.value='';input.focus({preventScroll:true})});
 $('terminalHint')?.addEventListener('click',()=>{run('help');input.focus({preventScroll:true})});
 input.addEventListener('keydown',e=>{
   if(e.key==='ArrowUp'||e.key==='ArrowDown'){const h=engine.history;if(!h.length)return;e.preventDefault();if(cursor===h.length)draft=input.value;cursor=Math.max(0,Math.min(h.length,cursor+(e.key==='ArrowUp'?-1:1)));input.value=cursor===h.length?draft:h[cursor];input.setSelectionRange(input.value.length,input.value.length);}
   else if(e.key==='Tab'&&!e.shiftKey){const text=input.value;if(!text.trim()||input.selectionStart!==text.length)return;const options=engine.complete(text);if(!options.length)return;e.preventDefault();const start=text.search(/\S+$/);const prefix=start<0?text:text.slice(0,start);if(options.length===1){input.value=prefix+options[0]+(options[0].endsWith('/')?'':' ')}else{let common=options[0];while(common&&!options.every(x=>x.startsWith(common)))common=common.slice(0,-1);const typed=start<0?'':text.slice(start);if(common.length>typed.length)input.value=prefix+common;else{append(options.join('  '),'muted');bottom()}}}
   else if(e.ctrlKey&&e.key.toLowerCase()==='l'){e.preventDefault();out.replaceChildren();bottom()}
   else if(e.ctrlKey&&e.key.toLowerCase()==='c'&&input.selectionStart===input.selectionEnd){e.preventDefault();append(engine.prompt+' '+input.value+' ^C','muted');input.value='';cursor=engine.history.length;bottom()}
 });
 new MutationObserver(()=>{sync();syncWelcome()}).observe(root,{attributes:true,attributeFilter:['lang']});welcome();sync();
})();