import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { company } from '../src/content.mjs';

const root = process.cwd();
const base = new URL(company.url).pathname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};

createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  let file = resolve(root, pathname.slice(base.length));
  let status = 200;

  try {
    if (!pathname.startsWith(base) || pathname.split('/').some((part) => part.startsWith('.')) || (!file.startsWith(root+sep) && file !== root)) throw new Error('Outside site');
    if ((await stat(file)).isDirectory()) file = resolve(file,'index.html');
    if (!(await stat(file)).isFile()) throw new Error('Missing file');
  } catch {
    file = resolve(root,'404.html');
    status = 404;
  }

  response.writeHead(status,{'content-type':types[extname(file)] || 'application/octet-stream'});
  if (request.method === 'HEAD') response.end();
  else createReadStream(file).pipe(response);
}).listen(8766,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:8766'+base));
