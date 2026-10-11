import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  // Local-only responsive review frame; never emitted into the production build.
  if(url.pathname==='/__review'){
   const width=[320,390,768].includes(Number(url.searchParams.get('width')))?Number(url.searchParams.get('width')):390;
   const routes=['/','/work/','/contact/','/products/','/products/odd-ecosys/','/services/','/research/','/research/verdict/','/about/'];
   const route=routes.includes(url.searchParams.get('path'))?url.searchParams.get('path'):'/';
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
   res.end(`<!doctype html><title>Oddwebs responsive review</title><style>body{margin:0;background:#242622;display:grid;place-items:start center}iframe{border:0;width:${width}px;height:844px;background:#0c0e0c}</style><iframe id="responsive-preview" title="Oddwebs at ${width} pixels" src="${route}"></iframe>`);return;
  }
  if(url.pathname==='/api/contact'){
   let body='';for await(const part of req){body+=part;if(body.length>16000){res.writeHead(413);res.end();return;}}
   const {default:handler}=await import('../api/contact.js');
   const adapted={setHeader:(k,v)=>res.setHeader(k,v),status(code){res.statusCode=code;return this;},json(data){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}};
   return handler({method:req.method,body},adapted);
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(file!==root && !file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  try{if((await stat(file)).isDirectory())file=path.join(file,'index.html');}catch{}
  try{const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);}
  catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(root,'404.html')));}
 }catch{res.writeHead(400);res.end('Bad request');}
});
server.listen(Number(process.env.ODD_STUDIO_PORT||4173),'127.0.0.1',()=>console.log('Oddwebs preview: http://127.0.0.1:'+server.address().port));
