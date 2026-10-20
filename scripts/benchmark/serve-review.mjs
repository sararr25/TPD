import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { renderReview } from './review.mjs';
const [id] = process.argv.slice(2);
if(!id||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw Error('Supply a run ID');
const dir=`.private/benchmark/${id}`;
const packet=JSON.parse(await readFile(dir+'/blind-review.json','utf8'));
const html=renderReview(packet);
await writeFile(dir+'/review.html',html,{mode:0o600});
const server=createServer((request,response)=>{
  if(!['GET','HEAD'].includes(request.method)||request.url!=='/study'){response.writeHead(404,{'Cache-Control':'no-store'});response.end();return}
  response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
  response.end(request.method==='HEAD'?'':html);
});
server.listen(3212,'127.0.0.1',()=>console.log('Private local review: http://127.0.0.1:3212/study (only this blind packet is served; no source key or directory listing)'));
