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
 file('/README.md',()=>tr('Portfolio Shell\nSistem berkas virtual hanya-baca. Tidak ada akses ke sistem operasi atau server.\nMulai dengan ls, cd projects, ls, dan cat <id>/README.md.','Portfolio Shell\nRead-only virtual filesystem. No operating system or server access.\nStart with ls, cd projects, ls, and cat <id>/README.md.'));
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
 function run(input){
 const raw=String(input??'').trim();if(!raw)return ok();if(raw.length>1000)return err(tr('Perintah terlalu panjang.','Command too long.'));history.push(raw);if(history.length>200)history.shift();
 let args;try{args=tokenize(raw)}catch(e){return err(e.message)}
 const cmd=(args.shift()||'').toLowerCase(),a=args[0],rest=args.join(' ');
 const notFound=p=>err(tr('Tidak ditemukan: ','Not found: ')+p);
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
 case 'theme':if(!a)return ok(options.theme?.()||'dark');if(!['dark','light'].includes(a)||args.length!==1)return usage(cmd);return output(lines(tr('Tema: ','Theme: ')+a),{theme:a});
 case 'lang':if(!a)return ok(language());if(!['id','en'].includes(a)||args.length!==1)return usage(cmd);return output(lines('Language: '+a),{language:a});
 case 'history':return ok(history.map((s,i)=>String(i+1).padStart(3)+'  '+s).join('\n'));
 case 'clear':return output([],{clear:true});
 case 'whoami':return ok('guest');
 case 'date':return ok(new Date().toLocaleString(language()==='en'?'en-US':'id-ID',{dateStyle:'full',timeStyle:'long'}));
 case 'uname':return ok('Portfolio Shell / Browser JavaScript / Read-only VFS');
 case 'echo':return ok(rest);
 default:return err(tr('Perintah tidak dikenal: ','Command not found: ')+cmd+'\n'+tr('Masukkan help untuk panduan.','Enter help for guidance.'));
 }}
 function complete(input){const raw=String(input),parts=raw.trimStart().split(/\s+/),command=parts[0]||'';if(parts.length===1&&!/\s$/.test(raw))return Object.keys(commands).filter(x=>x.startsWith(command));const last=/\s$/.test(raw)?'':parts.at(-1);if(['github','docs','open','search'].includes(command)){return [...projects.map(p=>p.id),...(command==='open'?['github','docs','about','work','contact','design']:[])].filter(x=>x.startsWith(last))}if(!['cd','ls','cat','tree','find','grep'].includes(command))return [];const slash=last.lastIndexOf('/'),prefix=slash>=0?last.slice(0,slash+1):'',stem=slash>=0?last.slice(slash+1):last,parent=pathOf(prefix||'.');return children(parent).filter(p=>basename(p).startsWith(stem)&&(!['cd','tree'].includes(command)||nodes.get(p).kind==='dir')).map(p=>prefix+basename(p)+(nodes.get(p).kind==='dir'?'/':''))}
 return {run,complete,tokenize,get cwd(){return cwd},get history(){return history.slice()},get prompt(){return 'guest@portfolio:'+(cwd==='/'?'~':cwd)+'$'}};
}
root.PortfolioShell={createShell};
})(typeof window!=='undefined'?window:globalThis);