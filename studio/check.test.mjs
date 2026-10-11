import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHandler, validateEnquiry } from '../api/contact.js';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const valid={name:'Preview Test',email:'preview@example.com',subject:'New project',message:'A local test message that is never delivered.',website:''};
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(v){this.data=v;}};}
test('enquiries reject injection, invalid fields and bot submissions',()=>{
 assert.equal(validateEnquiry({...valid,email:'invalid'}),null);
 assert.equal(validateEnquiry({...valid,subject:'Project\nBcc: other@example.com'}),null);
 assert.equal(validateEnquiry({...valid,website:'bot'}),null);
 assert.equal(validateEnquiry({...valid,message:'short'}),null);
 assert.equal(validateEnquiry({...valid,message:'x'.repeat(5001)}),null);
 assert.equal(validateEnquiry(valid).email,valid.email);
});
test('contact reports only provider-confirmed acceptance; no external email is sent',async()=>{
 const prior={key:process.env.RESEND_API_KEY,from:process.env.RESEND_FROM_EMAIL};
 try{
  delete process.env.RESEND_API_KEY;delete process.env.RESEND_FROM_EMAIL;
  const disabled=response();await createHandler(()=>assert.fail('Must not send'))({method:'POST',body:valid},disabled);assert.equal(disabled.code,503);
  const method=response();await createHandler()({method:'GET'},method);assert.equal(method.code,405);
  const invalid=response();await createHandler()({method:'POST',body:'not json'},invalid);assert.equal(invalid.code,400);
  process.env.RESEND_API_KEY='test-only';process.env.RESEND_FROM_EMAIL='test@example.com';
  for(const outcome of [{error:{message:'rejected'}},{data:{}},null]){
   const res=response();await createHandler(async()=>outcome)({method:'POST',body:valid},res);assert.equal(res.code,502);assert.equal(res.data.success,false);
  }
  let archived=false;
  const res=response();await createHandler(async payload=>{assert.equal(payload.replyTo,valid.email);return {data:{id:'local-mock'}};},async data=>{assert.equal(data.message,valid.message);archived=true;})({method:'POST',body:valid},res);assert.equal(res.code,200);assert.equal(res.data.success,true);assert.equal(archived,true);
 }finally{for(const [k,v] of [['RESEND_API_KEY',prior.key],['RESEND_FROM_EMAIL',prior.from]]){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
test('all public HTML pages have complete metadata, local assets and working internal links',async()=>{
 const files=(await readdir(root,{recursive:true})).filter(p=>p.endsWith('.html')&&!p.startsWith('legacy'+path.sep)&&p!=='404.html');
 assert.equal(files.length,16);
 for(const file of files){
  const html=await readFile(path.join(root,file),'utf8');
  assert.equal((html.match(/<h1>/g)||[]).length,1,file);
  for(const s of ['name="description"','rel="canonical"','application/ld+json','id="main"'])assert.ok(html.includes(s),`${file}: ${s}`);
  for(const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)){
   const url=new URL(match[1],'https://oddwebs.com');let target=path.join(root,decodeURIComponent(url.pathname));
   if((await stat(target)).isDirectory())target=path.join(target,'index.html');
   assert.ok((await stat(target)).isFile(),`${file}: ${match[1]}`);
   if(url.hash){const destination=await readFile(target,'utf8');assert.ok(destination.includes(`id="${url.hash.slice(1)}"`),`${file}: missing ${url.hash}`);}
  }
  assert.ok(!/InventoryAvangers|BizzHouse|320%|99\.4%|4\.9\/5/.test(html),`${file}: unsupported/private content`);
 }
});
