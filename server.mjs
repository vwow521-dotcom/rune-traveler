import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.wasm':'application/wasm','.zip':'application/zip','.woff2':'font/woff2'};
const port = Number(process.env.PORT || 4174);
http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400);res.end();return;}
  if(pathname==='/')pathname='/index.html';
  const file=path.resolve(root,'.'+pathname);
  const relative=path.relative(root,file);
  if(relative.startsWith('..')||path.isAbsolute(relative)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-cache');
  createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Rune Traveler: http://127.0.0.1:${port}`));
