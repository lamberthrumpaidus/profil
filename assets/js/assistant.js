/* ALL Create by LamberthRumpaidus — safe, data-grounded local assistant with optional Netlify AI endpoint */
(()=>{'use strict';
  const $=s=>document.querySelector(s);
  const shell=$('#assistantShell'),trigger=$('#assistantTrigger'),panel=$('#assistantPanel'),close=$('#assistantClose'),messages=$('#assistantMessages'),form=$('#assistantForm'),input=$('#assistantInput'),chips=$('#assistantChips'),disclosure=$('#assistantDisclosure');
  const projects=window.PORTFOLIO_PROJECTS||[];
  const skills=window.PORTFOLIO_SKILLS||[];
  const mail='lamberthrumpaidus@gmail.com';
  let remote=false,busy=false;
  const norm=s=>String(s).toLocaleLowerCase('id').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const tokens=s=>norm(s).split(' ').filter(w=>w.length>2&& !['yang','dan','atau','saya','anda','tentang','dengan','apa','itu','ada','berapa','bagaimana','bisa','untuk','dari','the','can','what','are','does'].includes(w));
  function has(t,keys){const n=norm(t);return keys.some(k=>n.includes(norm(k)))}
  function rank(p,q){const ts=tokens(q),name=norm(p.title+' '+p.id),doc=norm([p.title,p.type,p.summary,...(p.stack||[])].join(' '));return ts.reduce((a,w)=>a+(name.includes(w)?8:doc.includes(w)?2:0),0)}
  function localAnswer(raw){
    const t=norm(raw);if(!t)return 'Coba tanyakan tentang proyek, keahlian, teknologi, atau cara menghubungi Lamberth.';
    if(has(t,['siapa','profil','tentang kamu','tentang lamberth','about','who','kenalkan','bio']))return 'Lamberth Paulinus Rumpaidus adalah pengembang kreatif yang mengerjakan proyek web, game browser, komputasi ilmiah, antarmuka interaktif, dan eksperimen 3D. Portfolio ini menampilkan karya sekaligus proses pengembangannya. Kamu bisa membaca profil selengkapnya di bagian Tentang.';
    if(has(t,['kontak','hubungi','email','kerja sama','kolaborasi','sosial','linkedin','contact','message','whatsapp','nomor']))return 'Untuk menghubungi Lamberth, gunakan email '+mail+'. Kamu juga bisa membuka bagian Kontak untuk menemukan tautan GitHub, LinkedIn, dan formulir yang membuka aplikasi email.';
    if(has(t,['3d','torii','bambu','scene','dunia','garden','grafis','animasi','kamera','render']))return 'Dunia 3D interaktif dibangun dengan Three.js. Coba tombol “Jelajahi dunia 3D”, lalu ganti kamera Arrival, Torii, Lake, dan Grove. Kamu juga bisa mengganti senja/malam, kualitas HD/ECO, mematikan animasi, atau menyimpan gambar.';
    if(has(t,['skill','keahlian','teknologi','framework','tech','kemampuan','tools','bahasa pemrograman']))return 'Bidang yang dipresentasikan di sini:\n'+skills.map(s=>'• '+s.title[0]+' — '+s.tags.slice(0,4).join(', ')).join('\n')+'\n\nLihat bagian Keahlian untuk detailnya.';
    if(has(t,['berapa proyek','semua proyek','daftar proyek','project apa','projek apa','karya apa','list project','list proyek']))return 'Saat ini ada '+projects.length+' proyek dalam katalog. Di antaranya:\n'+projects.map(p=>'• '+p.title).join('\n')+'\n\nBuka bagian Karya untuk melihat gambar, penjelasan masalah, pendekatan, dan hasil masing-masing proyek.';
    const matches=projects.map(p=>({p,score:rank(p,raw)})).filter(p=>p.score>0).sort((a,b)=>b.score-a.score);
    if(matches.length&&matches[0].score>=4){const p=matches[0].p;return p.title+'\n\n'+p.summary+'\n\nTeknologi: '+p.stack.join(', ')+'.\n\nPendekatan: '+p.approach+'\n\nHasil: '+p.outcome+'\n\nTemukan studi kasusnya di bagian Karya.'}
    if(has(t,['proyek','project','karya','game','web','aplikasi']))return 'Katalog karya memuat '+projects.length+' proyek dengan topik game, web, riset, keamanan digital, dan 3D. Tulis nama proyek atau tanya “Daftar proyek” untuk melihat semuanya.';
    if(has(t,['halo','hai','hi','hello','pagi','siang','malam']))return 'Halo! Senang bertemu denganmu. Kamu bisa bertanya tentang proyek, keahlian, pengalaman 3D, atau cara menghubungi Lamberth.';
    return 'Saya belum menemukan jawaban yang dapat dipastikan dari isi portofolio. Coba tanyakan nama proyek tertentu, keahlian, dunia 3D, atau kontak. Saya tidak akan mengarang informasi yang tidak tersedia di situs.';
  }
  function append(text,user=false){const p=document.createElement('div');p.className='assistant-message '+(user?'assistant-user':'assistant-bot');p.textContent=String(text).slice(0,4500);messages.append(p);messages.scrollTop=messages.scrollHeight;return p}
  function setOpen(open){panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)input.focus()}
  trigger.addEventListener('click',()=>setOpen(panel.hidden));close.addEventListener('click',()=>setOpen(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)setOpen(false)});
  chips.addEventListener('click',e=>{const b=e.target.closest('[data-ask]');if(b){input.value=b.dataset.ask;form.requestSubmit()}});
  async function send(question){
    const own=append(question,true);own.dataset.question='true';
    const waiting=append('Sedang mencari jawaban...');
    busy=true;shell.classList.add('is-thinking');form.querySelector('button').disabled=true;
    let answer;
    if(remote){
      try{const c=new AbortController();const t=setTimeout(()=>c.abort(),9000);
        const r=await fetch('/.netlify/functions/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question}),signal:c.signal});clearTimeout(t);
        const result=await r.json();if(!r.ok||typeof result.answer!=='string')throw Error('Service unavailable');answer=result.answer;
      }catch{answer=localAnswer(question)+'\n\n(Mode lokal aktif: layanan AI generatif tidak tersedia.)'}
    }else answer=localAnswer(question);
    waiting.textContent=answer;busy=false;shell.classList.remove('is-thinking');form.querySelector('button').disabled=false;messages.scrollTop=messages.scrollHeight;
  }
  form.addEventListener('submit',e=>{e.preventDefault();if(busy)return;const q=input.value.trim();if(!q)return;input.value='';void send(q)});
  // GET is a lightweight capability check; 404 on static hosting is expected and handled silently.
  fetch('/.netlify/functions/chat',{method:'GET'}).then(r=>r.ok?r.json():null).then(o=>{if(o?.enabled===true){remote=true;disclosure.textContent='AI generatif aktif melalui server; jawaban merujuk pada data portofolio. Gratis selama kuota layanan tersedia.'}}).catch(()=>{});
})();
