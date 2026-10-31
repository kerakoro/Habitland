import {analysePhoto} from './lib/photo-ai.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
const port=Number(process.env.PORT||8787);
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist'),data=process.env.GARDEN_DATA_DIR||path.join(path.dirname(root),'data');
await fs.mkdir(path.join(data,'images'),{recursive:true});
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
let writes=Promise.resolve();
async function records(){try{return JSON.parse(await fs.readFile(path.join(data,'displays.json'),'utf8'))}catch(e){if(e.code==='ENOENT')return [];throw e}}
async function bodyJSON(req,limit=8e6){let chunks=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>limit)throw Error('Image too large');chunks.push(chunk)}return JSON.parse(Buffer.concat(chunks).toString())}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf','.otf':'font/otf','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{try{
const pathname=new URL(req.url,'http://localhost').pathname;
if(pathname==='/api/displays'&&req.method==='GET'){send(res,200,await records());return}
if(pathname==='/api/displays'&&req.method==='POST'){
 if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){send(res,403,{error:'Origin not allowed'});return}
 if(!String(req.headers['content-type']).startsWith('application/json')){send(res,415,{error:'JSON required'});return}
 const input=await bodyJSON(req);const title=String(input.title||'').trim();if(!title||title.length>80)throw Error('Please enter a title of 1 to 80 characters.');if(!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(input.image||''))throw Error('PNG image required');
 const bytes=Buffer.from(input.image.split(',')[1],'base64');if(bytes.length>5e6||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid PNG image');
 if(bytes.readUInt32BE(16)!==1320||![720,748].includes(bytes.readUInt32BE(20)))throw Error('Expected a 1320 × 748 garden image (legacy 720 is also supported)');
 const id=randomUUID(),entry={id,title,image:'/uploads/'+id+'.png',createdAt:new Date().toISOString()};
 const write=writes.catch(()=>{}).then(async()=>{await fs.writeFile(path.join(data,'images',id+'.png'),bytes);const list=await records();list.push(entry);const tmp=path.join(data,'displays.json.tmp');await fs.writeFile(tmp,JSON.stringify(list));await fs.rename(tmp,path.join(data,'displays.json'))});writes=write;await write;send(res,201,entry);return;
}
if(pathname==='/api/analyse'){let payload=req.method==='POST'?JSON.stringify(await bodyJSON(req,4e6)):undefined;let headers=Object.fromEntries(Object.entries(req.headers).filter(([,v])=>v!==undefined).map(([k,v])=>[k,Array.isArray(v)?v.join(','):v]));const result=await analysePhoto(new Request('http://'+req.headers.host+req.url,{method:req.method,headers,body:payload}));res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return}
if(req.method==='GET'){
 let file;
 if(/^\/uploads\/[a-f0-9-]{36}\.png$/.test(pathname))file=path.join(data,'images',path.basename(pathname));
 else {const relative=decodeURIComponent(pathname==='/'?'/index.html':pathname);file=path.resolve(root,'.'+relative);if(!file.startsWith(root+path.sep)||relative.split('/').some(p=>p.startsWith('.'))){send(res,404,{error:'Not found'});return}}
 try{const content=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(content);return}catch(e){if(e.code!=='ENOENT'&&e.code!=='EISDIR')throw e}
}
send(res,404,{error:'Not found'});
}catch(e){send(res,400,{error:e.message||'Unable to process request'})}
}).listen(port,process.env.HOST||'127.0.0.1',()=>console.log('Garden running at http://localhost:'+port));
