/* ALL Create by LamberthRumpaidus — zero-dependency, local-only static web server. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {execFile} = require('node:child_process');
const root = __dirname;
const mime = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.cjs':'text/plain','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.mp3':'audio/mpeg','.mp4':'video/mp4','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.eot':'application/vnd.ms-fontobject','.xml':'application/xml','.txt':'text/plain'};
const server = http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Method not allowed');return}
  let name;
  try{name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}catch{res.writeHead(400);res.end('Invalid URL');return}
  if(name==='/'||name.endsWith('/'))name+='index.html';
  if(name.split('/').some(x=>x.startsWith('.'))||name.startsWith('/netlify/')||name==='/server.cjs') {res.writeHead(403);res.end('Forbidden');return}
  const file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return}
    res.writeHead(200,{'Content-Type':(mime[path.extname(file).toLowerCase()]||'application/octet-stream')+'; charset=utf-8','Content-Length':stat.size,'X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  });
});
server.listen(8000,'127.0.0.1',()=>{
  const url='http://127.0.0.1:8000/';
  console.log('lamberthrumpaidus is running at '+url+'\nPress Ctrl+C to close.');
  if(process.platform==='win32')execFile('cmd',['/c','start','',url],{windowsHide:true},()=>{});
});
