/* ALL Create by LamberthRumpaidus — read-only browser shell. */
(function(root){'use strict';
function createShell(options={}){
 const projects=options.projects||[],skills=options.skills||[],language=options.language||(()=>'id');
 const tr=(a,b)=>language()==='en'?b:a, val=(p,k)=>language()==='en'&&p.en?.[k]?p.en[k]:p[k];
 const title=p=>val(p,'title')||p.title, rows=[],nodes=new Map(),history=[];
 let cwd='/';
 const commands={
 help:'help [command]',man:'man <command>',ls:'ls [-l] [-a] [path]',pwd:'pwd',cd:'cd [directory]',cat:'cat <file> [file...]',tree:'tree [directory]',find:'find <name> | find <path> -name <pattern>',grep:'grep [-i] <text> <file>',search:'search <query>',projects:'projects',skills:'skills',about:'about',contact:'contact',github:'github [project-id]',docs:'docs [project-id]',open:'open <project-id|github|docs|about|work|contact|design>',theme:'theme [dark|light]',lang:'lang [id|en]',history:'history',clear:'clear',whoami:'whoami',date:'date',uname:'uname',echo:'echo <text>'};
 const explanations={
 help:['Daftar perintah dan sintaks.','List commands and syntax.'],man:['Panduan suatu perintah.','Show a command manual.'],ls:['Tampilkan isi direktori virtual.','List virtual directory contents.'],pwd:['Tampilkan direktori aktif.','Print working directory.'],cd:['Pindah direktori virtual.','Change virtual directory.'],cat:['Baca berkas teks virtual.','Read virtual text files.'],tree:['Tampilkan struktur direktori.','Display the directory tree.'],find:['Cari nama berkas atau direktori.','Find file or directory names.'],grep:['Cari baris yang memuat teks dalam berkas.','Find matching lines in a file.'],search:['Cari proyek berdasarkan judul dan teknologi.','Search projects by title and technology.'],projects:['Tampilkan seluruh proyek.','List all projects.'],skills:['Tampilkan keahlian dan teknologi.','List skills and technologies.'],about:['Baca profil profesional.','Read professional profile.'],contact:['Tampilkan kanal kontak.','Show contact channels.'],github:['Tampilkan tautan GitHub yang dapat dibuka.','Show clickable GitHub links.'],docs:['Tampilkan tautan dokumentasi.','Show documentation links.'],open:['Buka halaman atau proyek pada tab baru.','Open a page or project in a new tab.'],theme:['Lihat atau ubah tema situs.','Inspect or change website theme.'],lang:['Lihat atau ubah bahasa situs.','Inspect or change website language.'],history:['Tampilkan riwayat perintah sesi ini.','Show command history for this session.'],clear:['Bersihkan keluaran terminal.','Clear terminal output.'],whoami:['Identitas sesi virtual.','Virtual session identity.'],date:['Waktu lokal perangkat.','Local device time.'],uname:['Informasi lingkungan terminal.','Terminal environment information.'],echo:['Tampilkan teks.','Print text.']};
 const dir=p=>nodes.set(p,{kind:'dir'});
 const file=(p,content)=>nodes.set(p,{kind:'file',content});
 const pathOf=(value='',base=cwd)=>{let raw=String(value);if(raw==='~'||raw.startsWith('~/'))raw='/'+raw.slice(1).replace(/^\//,'');const parts=(raw.startsWith('/')?raw:(base==='/'?'':base)+'/'+raw).split('/'),out=[];for(const x of parts){if(!x||x==='.')continue;if(x==='..')out.pop();else out.push(x)}return '/'+out.join('/')};
 const children=p=>[...nodes.keys()].filter(x=>x!==p&&x.slice(0,x.lastIndexOf('/'))===(p==='/'?'':p)).sort((a,b)=>Number(nodes.get(b).kind==='dir')-Number(nodes.get(a).kind==='dir')||a.localeCompare(b));
 const basename=p=>p.split('/').pop()||'/';
 const profile=()=>tr('Lamberth Paulinus Rumpaidus\nMahasiswa Teknik Informatika asal Mimika, Papua Tengah.\nFokus: pengembangan web, antarmuka interaktif, dan komputasi.','Lamberth Paulinus Rumpaidus\nInformatics Engineering student from Mimika, Central Papua.\nFocus: web development, interactive interfaces, and computing.');
 const contact=()=> 'Email: lamberthrumpaidus@gmail.com\nGitHub: https://github.com/lamberthrumpaidus\nLinkedIn: https://www.linkedin.com/in/lamberth-paulinus-rumpaidus-b60a2b298/';
 const skillText=()=>skills.map(s=>s.title[language()==='en'?1:0]+'\n  '+(s.tags||[]).join(' · ')).join('\n');
 const projectText=p=>[title(p),val(p,'summary'),tr('Tantangan: ','Challenge: ')+val(p,'problem'),tr('Pendekatan: ','Approach: ')+val(p,'approach'),tr('Hasil: ','Outcome: ')+val(p,'outcome'),tr('Refleksi: ','Reflection: ')+val(p,'reflection'),tr('Teknologi: ','Technology: ')+(p.stack||[]).join(', '),p.repositoryKind==='archive'?tr('Arsip GitHub: ','GitHub archive: ')+p.repository:'GitHub: '+p.repository].filter(Boolean).join('\n\n');
 dir('/');dir('/projects');dir('/profile');dir('/skills');dir('/docs');
 file('/README.md',()=>tr('Portfolio Shell\nSistem berkas virtual dengan akses baca saja. Terminal tidak memiliki akses ke sistem operasi atau server.\nContoh perintah: ls, cd projects, ls, dan cat <id>/README.md.','Portfolio Shell\nRead-only virtual filesystem. No operating system or server access.\nStart with ls, cd projects, ls, and cat <id>/README.md.'));
 file('/profile/about.txt',profile);file('/profile/contact.txt',contact);file('/skills/technology.txt',skillText);
 file('/docs/index.txt',()=>tr('Dokumentasi: ','Documentation: ')+'documentation.html\n'+tr('Sistem desain: ','Design system: ')+'design-system.html');
 projects.forEach(p=>{const path='/projects/'+p.id;dir(path);file(path+'/README.md',()=>projectText(p));file(path+'/github.txt',()=>p.repository||'');file(path+'/technology.txt',()=> (p.stack||[]).join('\n'));if(p.code)file(path+'/example.cs',()=>p.code)});
 const lines=(text,kind='normal')=>String(text).split('\n').map(text=>({text,kind}));
 const err=s=>({rows:lines(s,'error'),code:1}),ok=(s='')=>({rows:s?lines(s):[],code:0});
 const link=(text,url)=>({text,url,kind:'link'});
 const output=(entries,extra={})=>({rows:entries,code:0,...extra});
 const usage=cmd=>err(tr('Penggunaan: ','Usage: ')+commands[cmd]);
 function tokenize(input){let result=[],word='',quote='',started=false;for(let i=0;i<input.length;i++){const ch=input[i];if(ch==='\\'&&quote!=="'"&&i+1<input.length){word+=input[++i];started=true;continue}if(quote){if(ch===quote)quote='';else word+=ch;started=true;continue}if(ch==='"'||ch==="'"){quote=ch;started=true;continue}if(/\s/.test(ch)){if(started){result.push(word);word='';started=false}}else{word+=ch;started=true}}if(quote)throw Error(tr('Tanda kutip belum ditutup.','Unclosed quotation mark.'));if(started)result.push(word);return result}
 const lookup=id=>projects.find(p=>p.id.toLowerCase()===String(id).toLowerCase())||projects.find(p=>title(p).toLowerCase()===String(id).toLowerCase());
 function readFile(p){const n=nodes.get(pathOf(p));return n?.kind==='file'?String(n.content()):null}
 function treeText(path){const result=[path];function visit(p,prefix){const list=children(p);list.forEach((child,i)=>{const last=i===list.length-1,n=nodes.get(child);result.push(prefix+(last?'└── ':'├── ')+basename(child)+(n.kind==='dir'?'/':''));if(n.kind==='dir')visit(child,prefix+(last?'    ':'│   '))})}visit(path,'');return result.join('\n')}

 const extra=Object.create(null);
 const add=(name,syntax,id,en,fn)=>{commands[name]=name+(syntax?' '+syntax:'');explanations[name]=[id,en];extra[name]=fn};
 const bad=()=>err(tr('Argumen tidak valid. Jalankan help untuk menampilkan panduan.','Invalid arguments. See help.'));
 const txt=(a,f)=>a.length?ok(String(f(a.join(' ')))):bad();
 const fileOp=(a,f)=>{if(!a.length)return bad();const s=readFile(a[0]);return s===null?err(tr('Berkas tidak ditemukan: ','File not found: ')+a[0]):ok(String(f(s)))};
 const row=s=>s.split('\n'),num=(x,l,h)=>/^-?\d+$/.test(String(x))&&Number(x)>=l&&Number(x)<=h?Number(x):null;
 const utf8=s=>{const r=[];for(const c of String(s)){let n=c.codePointAt(0);if(n>=0xd800&&n<=0xdfff)n=0xfffd;if(n<128)r.push(n);else if(n<2048)r.push(192|n>>6,128|n&63);else if(n<65536)r.push(224|n>>12,128|n>>6&63,128|n&63);else r.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|n&63)}return r};
 const bytes=s=>utf8(s).length,under=p=>[...nodes.keys()].filter(x=>x===p||x.startsWith(p==='/'?'/':p+'/'));
 const nodeOp=(a,f)=>{const p=pathOf(a[0]||'.'),n=nodes.get(p);return n?ok(String(f(p,n))):err(tr('Jalur tidak ditemukan: ','Path not found: ')+p)};
 const projectOp=(a,f)=>{const p=lookup(a.join(' '));return p?f(p):err(tr('Proyek tidak ditemukan.','Project not found.'))};
 const fileCmd=(n,id,en,f)=>add(n,'<file>',id,en,a=>fileOp(a,f));
 for(const [n,id,en,last] of [['head','Baca baris awal.','Read first lines.',false],['tail','Baca baris akhir.','Read last lines.',true]])add(n,'[-n N] <file>',id,en,a=>{const k=a[0]==='-n'?num(a[1],0,1000):10,p=a[0]==='-n'?a[2]:a[0];return k===null||!p?bad():fileOp([p],s=>(last?(k?row(s).slice(-k):[]):row(s).slice(0,k)).join('\n'))});
 fileCmd('wc','Hitung baris, kata, dan byte.','Count lines, words and bytes.',s=>row(s).length+tr(' baris · ',' lines · ')+(s.trim()?s.trim().split(/\s+/).length:0)+tr(' kata · ',' words · ')+bytes(s)+tr(' byte',' bytes'));
 fileCmd('sort','Urutkan baris.','Sort lines.',s=>row(s).sort((a,b)=>a.localeCompare(b)).join('\n'));
 fileCmd('uniq','Hapus duplikasi baris berurutan.','Remove adjacent duplicates.',s=>row(s).filter((v,i,a)=>!i||v!==a[i-1]).join('\n'));
 fileCmd('nl','Nomori baris.','Number lines.',s=>row(s).map((v,i)=>(i+1)+'  '+v).join('\n'));
 for(const [n,id,en,f] of [['rev','Balik karakter.','Reverse characters.',s=>Array.from(s).reverse().join('')],['upper','Huruf kapital.','Uppercase text.',s=>s.toUpperCase()],['lower','Huruf kecil.','Lowercase text.',s=>s.toLowerCase()],['trim','Hapus spasi tepi.','Trim whitespace.',s=>s.trim()],['chars','Hitung karakter Unicode.','Count Unicode characters.',s=>Array.from(s).length],['words','Hitung kata.','Count words.',s=>s.trim()?s.trim().split(/\s+/).length:0]])add(n,'<text>',id,en,a=>txt(a,f));
 add('cut','<start> <end> <text>','Potong karakter berdasarkan indeks nol.','Extract zero-based character range.',a=>{const x=num(a[0],0,1000),y=num(a[1],0,1000);return x===null||y===null||y<x||a.length<3?bad():ok(Array.from(a.slice(2).join(' ')).slice(x,y).join(''))});
 add('replace','<old> <new> <text>','Ganti teks literal.','Replace literal text.',a=>a.length<3||!a[0]?bad():ok(a.slice(2).join(' ').split(a[0]).join(a[1])));
 add('split','<separator> <text>','Pisahkan teks menjadi baris.','Split text into lines.',a=>a.length<2||!a[0]?bad():ok(a.slice(1).join(' ').split(a[0]).join('\n')));
 add('join','<separator> <item...>','Gabungkan nilai.','Join values.',a=>a.length<2?bad():ok(a.slice(1).join(a[0])));
 add('count','<needle> <text>','Hitung kemunculan literal.','Count literal occurrences.',a=>a.length<2||!a[0]?bad():ok(String(a.slice(1).join(' ').split(a[0]).length-1)));
 add('wrap','<width> <text>','Pecah teks menurut lebar karakter.','Wrap text by character width.',a=>{const n=num(a[0],1,200);if(n===null||a.length<2)return bad();const s=Array.from(a.slice(1).join(' ')),r=[];for(let i=0;i<s.length;i+=n)r.push(s.slice(i,i+n).join(''));return ok(r.join('\n'))});
 add('indent','<spaces> <text>','Tambahkan indentasi.','Indent text.',a=>{const n=num(a[0],0,80);return n===null||a.length<2?bad():ok(row(a.slice(1).join(' ')).map(s=>' '.repeat(n)+s).join('\n'))});
 add('diff','<file1> <file2>','Bandingkan baris dua berkas.','Compare file lines.',a=>{if(a.length!==2)return bad();const x=readFile(a[0]),y=readFile(a[1]);if(x===null||y===null)return bad();const u=row(x),v=row(y),r=[];for(let i=0;i<Math.max(u.length,v.length);i++)if(u[i]!==v[i]){if(u[i]!==undefined)r.push('- '+(i+1)+': '+u[i]);if(v[i]!==undefined)r.push('+ '+(i+1)+': '+v[i])}return ok(r.join('\n')||tr('Berkas identik.','Files are identical.'))});
 add('stat','<path>','Jenis, izin virtual, ukuran.','Type, virtual permissions, size.',a=>nodeOp(a,(p,n)=>p+'\n'+(n.kind==='dir'?tr('Direktori · r-x · ','Directory · r-x · ')+children(p).length+tr(' entri',' entries'):tr('Berkas · r-- · ','File · r-- · ')+bytes(n.content())+tr(' byte',' bytes'))));
 add('file','<path>','Identifikasi jenis berkas.','Identify file type.',a=>nodeOp(a,(p,n)=>n.kind==='dir'?tr('Direktori','Directory'):p.endsWith('.md')?tr('Teks Markdown','Markdown text'):p.endsWith('.cs')?tr('Kode sumber C#','C# source text'):tr('Teks UTF-8','UTF-8 text')));
 for(const [n,id,en,f] of [['realpath','Jalur absolut.','Absolute path.',p=>p],['basename','Nama terakhir jalur.','Final path component.',p=>basename(p)],['dirname','Direktori induk.','Parent directory.',p=>p.split('/').slice(0,-1).join('/')||'/']])add(n,'<path>',id,en,a=>a.length?ok(f(pathOf(a[0]))):bad());
 add('du','[path]','Ukuran isi berkas rekursif.','Recursive content bytes.',a=>nodeOp(a,p=>under(p).filter(x=>nodes.get(x).kind==='file').reduce((n,x)=>n+bytes(nodes.get(x).content()),0)+tr(' byte',' bytes')));
 for(const [n,k,id,en] of [['files','file','Daftar berkas rekursif.','List files recursively.'],['dirs','dir','Daftar direktori rekursif.','List directories recursively.']])add(n,'[path]',id,en,a=>nodeOp(a,p=>under(p).filter(x=>nodes.get(x).kind===k).sort().join('\n')));
 add('extensions','[path]','Hitung ekstensi berkas.','Count file extensions.',a=>nodeOp(a,p=>{const m=new Map();under(p).filter(x=>nodes.get(x).kind==='file').forEach(x=>{const n=basename(x),e=n.includes('.')?n.slice(n.lastIndexOf('.')):'(none)';m.set(e,(m.get(e)||0)+1)});return [...m].sort().map(([k,v])=>k+'  '+v).join('\n')}));
 fileCmd('size','Ukuran byte UTF-8.','UTF-8 byte size.',bytes);
 add('exists','<path>','Periksa keberadaan jalur.','Check path existence.',a=>a.length?ok(String(nodes.has(pathOf(a[0])))):bad());
 fileCmd('preview','Pratinjau 160 karakter.','Preview 160 characters.',s=>Array.from(s).slice(0,160).join('')+(Array.from(s).length>160?'…':''));
 fileCmd('checksum','Checksum FNV-1a 32-bit nonkriptografis.','Non-cryptographic FNV-1a 32-bit checksum.',s=>{let h=2166136261;for(const b of utf8(s))h=Math.imul(h^b,16777619)>>>0;return h.toString(16).padStart(8,'0')});
 add('json','<project-id>','Metadata proyek dalam JSON.','Project metadata as JSON.',a=>projectOp(a,p=>ok(JSON.stringify({id:p.id,title:title(p),category:p.category,summary:val(p,'summary'),technologies:p.stack,github:p.repository,archive:p.repositoryKind==='archive'},null,2))));
 const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const r=a%b;a=b;b=r}return a};
 const ints=n=>n.every(Number.isSafeInteger);
 const maths=[
 ['add','Penjumlahan.','Addition.',n=>n[0]+n[1],2,2],
 ['sub','Pengurangan.','Subtraction.',n=>n[0]-n[1],2,2],
 ['mul','Perkalian.','Multiplication.',n=>n[0]*n[1],2,2],
 ['div','Pembagian.','Division.',n=>n[0]/n[1],2,2],
 ['mod','Sisa pembagian.','Remainder.',n=>n[0]%n[1],2,2],
 ['pow','Pangkat.','Power.',n=>Math.pow(...n),2,2],
 ['sqrt','Akar kuadrat.','Square root.',n=>Math.sqrt(n[0]),1,1],
 ['abs','Nilai absolut.','Absolute value.',n=>Math.abs(n[0]),1,1],
 ['round','Pembulatan terdekat.','Nearest integer.',n=>Math.round(n[0]),1,1],
 ['floor','Pembulatan bawah.','Round down.',n=>Math.floor(n[0]),1,1],
 ['ceil','Pembulatan atas.','Round up.',n=>Math.ceil(n[0]),1,1],
 ['min','Nilai minimum.','Minimum.',n=>Math.min(...n),1,100],
 ['max','Nilai maksimum.','Maximum.',n=>Math.max(...n),1,100],
 ['sum','Jumlah nilai.','Sum.',n=>n.reduce((a,b)=>a+b,0),1,100],
 ['mean','Rata-rata.','Arithmetic mean.',n=>n.reduce((a,b)=>a+b,0)/n.length,1,100],
 ['median','Nilai tengah.','Median.',n=>{n.sort((a,b)=>a-b);let i=Math.floor(n.length/2);return n.length%2?n[i]:(n[i-1]+n[i])/2},1,100],
 ['range','Rentang nilai.','Numerical range.',n=>Math.max(...n)-Math.min(...n),1,100],
 ['percent','Persentase terhadap total.','Percentage of total.',n=>100*n[0]/n[1],2,2],
 ['gcd','FPB.','Greatest common divisor.',n=>ints(n)?gcd(...n):NaN,2,2],
 ['lcm','KPK.','Least common multiple.',n=>ints(n)?(!n[0]||!n[1]?0:Math.abs(n[0]/gcd(...n)*n[1])):NaN,2,2],
 ['factorial','Faktorial 0–170.','Factorial 0–170.',n=>{if(!ints(n)||n[0]<0||n[0]>170)return NaN;let r=1;for(let i=2;i<=n[0];i++)r*=i;return r},1,1],
 ['fib','Fibonacci indeks 0–78.','Fibonacci index 0–78.',n=>{if(!ints(n)||n[0]<0||n[0]>78)return NaN;let a=0,b=1;for(let i=0;i<n[0];i++)[a,b]=[b,a+b];return a},1,1],
 ['clamp','Batasi nilai dalam interval.','Clamp to interval.',n=>n[1]<=n[2]?Math.min(n[2],Math.max(n[1],n[0])):NaN,3,3],
 ['radians','Derajat ke radian.','Degrees to radians.',n=>n[0]*Math.PI/180,1,1],
 ['degrees','Radian ke derajat.','Radians to degrees.',n=>n[0]*180/Math.PI,1,1],
 ['hypot','Hipotenusa.','Hypotenuse.',n=>Math.hypot(...n),2,100]];
 for(const [n,id,en,f,min,max] of maths)add(n,min===max?Array.from({length:min},(_,i)=>'<'+String.fromCharCode(97+i)+'>').join(' '):'<number...>',id,en,a=>{if(a.length<min||a.length>max||a.some(x=>!x.trim()||!Number.isFinite(Number(x))))return bad();const r=f(a.map(Number));return Number.isFinite(r)?ok(String(r)):err(tr('Hasil tidak terdefinisi atau di luar batas.','Undefined or out-of-range result.'))});
 add('categories','','Jumlah proyek per kategori.','Count projects by category.',()=>{const m=new Map();projects.forEach(p=>m.set(p.category,(m.get(p.category)||0)+1));return ok([...m].sort().map(([k,v])=>k+'  '+v).join('\n'))});
 add('technologies','','Teknologi unik proyek.','Unique project technologies.',()=>ok([...new Set(projects.flatMap(p=>p.stack||[]))].sort().join('\n')));
 add('related','<project-id>','Proyek dengan teknologi bersama.','Projects with shared technology.',a=>projectOp(a,p=>{const t=new Set((p.stack||[]).map(x=>x.toLowerCase()));return output(projects.filter(q=>q!==p).map(q=>[q,(q.stack||[]).filter(x=>t.has(x.toLowerCase())).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).map(([q,n])=>link(title(q)+' · '+n+tr(' teknologi yang sama',' shared technologies'),'documentation.html?project='+encodeURIComponent(q.id))))}));
 add('info','<project-id>','Ringkasan proyek.','Project overview.',a=>projectOp(a,p=>ok(title(p)+'\n'+val(p,'summary')+'\n'+(p.stack||[]).join(' · '))));
 add('stats','','Statistik katalog.','Catalog statistics.',()=>ok(projects.length+tr(' proyek\n',' projects\n')+projects.filter(p=>p.repository&&p.repositoryKind!=='archive').length+tr(' tautan kode sumber\n',' source destinations\n')+projects.filter(p=>p.repositoryKind==='archive').length+tr(' arsip',' archives')));
 const repoRows=a=>output(a.filter(p=>p.repository).map(p=>link(title(p),p.repository)));
 add('sources','','Tujuan kode sumber.','Source destinations.',()=>repoRows(projects.filter(p=>p.repositoryKind!=='archive')));
 add('archives','','Arsip studi kasus GitHub.','GitHub case-study archives.',()=>repoRows(projects.filter(p=>p.repositoryKind==='archive')));
 add('academic','','Proyek akademik.','Academic projects.',()=>repoRows(projects.filter(p=>p.category==='academic')));
 add('demos','','Demonstrasi tercatat dalam katalog.','Demos recorded in the catalog.',()=>output(projects.filter(p=>p.demo).map(p=>link(title(p),p.demo))));
 add('links','','Tautan halaman portofolio.','Portfolio page links.',()=>output([link(tr('Beranda','Home'),'index.html'),link(tr('Karya','Projects'),'index.html#work'),link(tr('Dokumentasi','Documentation'),'documentation.html'),link(tr('Sistem desain','Design system'),'design-system.html'),link(tr('Kontak','Contact'),'index.html#contact')]));
 for(const [n,k,id,en] of [['role','role','Peran proyek.','Project role.'],['challenge','problem','Tantangan proyek.','Project challenge.'],['approach','approach','Pendekatan teknis.','Technical approach.'],['outcome','outcome','Hasil implementasi.','Implementation outcome.'],['reflection','reflection','Refleksi pengembangan.','Development reflection.']])add(n,'<project-id>',id,en,a=>projectOp(a,p=>ok(val(p,k)||tr('Belum dicatat.','Not recorded.'))));

 function run(input){
 const raw=String(input??'').trim();if(!raw)return ok();if(raw.length>1000)return err(tr('Perintah terlalu panjang.','Command too long.'));history.push(raw);if(history.length>200)history.shift();
 let args;try{args=tokenize(raw)}catch(e){return err(e.message)}
 const cmd=(args.shift()||'').toLowerCase(),a=args[0],rest=args.join(' ');
 const notFound=p=>err(tr('Tidak ditemukan: ','Not found: ')+p);
 if(Object.hasOwn(extra,cmd))return extra[cmd](args);
 switch(cmd){
 case 'help':case 'man':{if(a){if(!Object.hasOwn(commands,a))return notFound(a);return ok(commands[a]+'\n'+tr(...explanations[a]))}if(cmd==='man')return usage(cmd);return ok(tr('PERINTAH TERSEDIA','AVAILABLE COMMANDS')+'\n'+Object.keys(commands).map(k=>k.padEnd(10)+tr(...explanations[k])).join('\n')+'\n\n'+tr('Contoh: cd projects  ·  ls  ·  cat rubaka/README.md  ·  open rubaka','Example: cd projects  ·  ls  ·  cat rubaka/README.md  ·  open rubaka'))}
 case 'pwd':return ok(cwd);
 case 'cd':{const p=pathOf(a||'/');if(!nodes.has(p))return notFound(p);if(nodes.get(p).kind!=='dir')return err(tr('Bukan direktori: ','Not a directory: ')+p);cwd=p;return ok()}
 case 'ls':{const flags=args.filter(x=>x.startsWith('-'));if(flags.some(x=>!/^-[al]+$/.test(x)))return usage(cmd);const targets=args.filter(x=>!x.startsWith('-'));if(targets.length>1)return usage(cmd);const p=pathOf(targets[0]||'.'),n=nodes.get(p);if(!n)return notFound(p);if(n.kind==='file')return ok(basename(p));const long=flags.some(x=>x.includes('l')),all=flags.some(x=>x.includes('a'));const list=children(p).map(x=>{const n=nodes.get(x),name=basename(x)+(n.kind==='dir'?'/':'');return long?(n.kind==='dir'?'dr-xr-xr-x  ':'-r--r--r--  ')+name:name});if(all)list.unshift(...(long?['dr-xr-xr-x  ./','dr-xr-xr-x  ../']:['./','../']));return ok(list.join(long?'\n':'  '))}
 case 'cat':{if(!a)return usage(cmd);const result=[];for(const p of args){const v=readFile(p);if(v===null)return notFound(pathOf(p));result.push(v)}return ok(result.join('\n\n'))}
 case 'tree':{const p=pathOf(a||'.');if(nodes.get(p)?.kind!=='dir')return notFound(p);return ok(treeText(p))}
 case 'find':{if(!a)return usage(cmd);const named=args[1]==='-name',base=named?pathOf(a):cwd,q=(named?args[2]:rest)||'';if(!nodes.has(base)||!q)return usage(cmd);const pattern=q.toLowerCase().split('*').map(x=>x.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g,'\\$&')).join('.*');const re=new RegExp(q.includes('*')?'^'+pattern+'$':pattern,'i');return ok([...nodes.keys()].filter(p=>(base==='/'||p===base||p.startsWith(base+'/'))&&re.test(basename(p))).join('\n')||tr('Tidak ada hasil.','No matches.'))}
 case 'grep':{const insensitive=a==='-i';const values=insensitive?args.slice(1):args;if(values.length!==2)return usage(cmd);const [q,p]=values,v=readFile(p);if(v===null)return notFound(pathOf(p));const matches=v.split('\n').map((s,i)=>[s,i+1]).filter(([s])=>(insensitive?s.toLowerCase():s).includes(insensitive?q.toLowerCase():q)).map(([s,i])=>i+': '+s);return matches.length?ok(matches.join('\n')):{rows:lines(tr('Tidak ada hasil.','No matches.')),code:1}}
 case 'projects':return ok(projects.map(p=>p.id.padEnd(20)+title(p)).join('\n'));
 case 'search':{if(!a)return usage(cmd);const q=rest.toLowerCase(),found=projects.filter(p=>[p.id,title(p),val(p,'summary'),...(p.stack||[])].join(' ').toLowerCase().includes(q));return output(found.length?found.map(p=>link(p.id+' — '+title(p),'documentation.html?project='+encodeURIComponent(p.id))):lines(tr('Tidak ada proyek yang sesuai.','No matching projects.')))}
 case 'skills':return ok(skillText());
 case 'about':return ok(profile());
 case 'contact':return output([...lines('Email: lamberthrumpaidus@gmail.com'),link('GitHub — lamberthrumpaidus','https://github.com/lamberthrumpaidus'),link('LinkedIn — Lamberth Rumpaidus','https://www.linkedin.com/in/lamberth-paulinus-rumpaidus-b60a2b298/')]);
 case 'github':{if(!a)return output([link('GitHub — lamberthrumpaidus','https://github.com/lamberthrumpaidus'),...projects.filter(p=>p.repository).map(p=>link(p.id+' — '+title(p)+(p.repositoryKind==='archive'?tr(' (arsip)',' (archive)'):''),p.repository))]);const p=lookup(rest);return p?.repository?output([link(title(p)+(p.repositoryKind==='archive'?tr(' (arsip)',' (archive)'):''),p.repository)]):notFound(rest)}
 case 'docs':{if(!a)return output([link(tr('Dokumentasi proyek','Project documentation'),'documentation.html')]);const p=lookup(rest);return p?output([link(title(p),'documentation.html?project='+encodeURIComponent(p.id))]):notFound(rest)}
 case 'open':{if(!a)return usage(cmd);const urls={github:'https://github.com/lamberthrumpaidus',docs:'documentation.html',about:'index.html#about',work:'index.html#work',contact:'index.html#contact',design:'design-system.html'};const p=lookup(rest);const url=p?.repository||(Object.hasOwn(urls,rest.toLowerCase())?urls[rest.toLowerCase()]:null);return url?output([link(tr('Buka: ','Open: ')+(p?title(p):rest),url)],{open:url}):notFound(rest)}
 case 'theme':if(!a)return ok(options.theme?.()||'dark');if(!['dark','light'].includes(a)||args.length!==1)return usage(cmd);return output(lines(tr('Tema: ','Theme: ')+(a==='dark'?tr('gelap','dark'):tr('terang','light'))),{theme:a});
 case 'lang':if(!a)return ok(language());if(!['id','en'].includes(a)||args.length!==1)return usage(cmd);return output(lines(tr('Bahasa: ','Language: ')+a),{language:a});
 case 'history':return ok(history.map((s,i)=>String(i+1).padStart(3)+'  '+s).join('\n'));
 case 'clear':return output([],{clear:true});
 case 'whoami':return ok('guest');
 case 'date':return ok(new Date().toLocaleString(language()==='en'?'en-US':'id-ID',{dateStyle:'full',timeStyle:'long'}));
 case 'uname':return ok(tr('Portfolio Shell / JavaScript peramban / Sistem berkas virtual dengan akses baca saja','Portfolio Shell / Browser JavaScript / Read-only VFS'));
 case 'echo':return ok(rest);
 default:return err(tr('Perintah tidak tersedia: ','Command not found: ')+cmd+'\n'+tr('Jalankan help untuk menampilkan panduan.','Enter help for guidance.'));
 }}
 function complete(input){const raw=String(input),parts=raw.trimStart().split(/\s+/),command=parts[0]||'';if(parts.length===1&&!/\s$/.test(raw))return Object.keys(commands).filter(x=>x.startsWith(command));const last=/\s$/.test(raw)?'':parts.at(-1);if(['github','docs','open','search','json','related','info','role','challenge','approach','outcome','reflection'].includes(command)){return [...projects.map(p=>p.id),...(command==='open'?['github','docs','about','work','contact','design']:[])].filter(x=>x.startsWith(last))}if(!['cd','ls','cat','tree','find','grep','head','tail','wc','sort','uniq','nl','diff','stat','file','realpath','basename','dirname','du','files','dirs','extensions','size','exists','preview','checksum'].includes(command))return [];const slash=last.lastIndexOf('/'),prefix=slash>=0?last.slice(0,slash+1):'',stem=slash>=0?last.slice(slash+1):last,parent=pathOf(prefix||'.');return children(parent).filter(p=>basename(p).startsWith(stem)&&(!['cd','tree'].includes(command)||nodes.get(p).kind==='dir')).map(p=>prefix+basename(p)+(nodes.get(p).kind==='dir'?'/':''))}
 return {run,complete,tokenize,get commands(){return Object.keys(commands)},get cwd(){return cwd},get history(){return history.slice()},get prompt(){return 'guest@portfolio:'+(cwd==='/'?'~':cwd)+'$'}};
}
root.PortfolioShell={createShell};
})(typeof window!=='undefined'?window:globalThis);