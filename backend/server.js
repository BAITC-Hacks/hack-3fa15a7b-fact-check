import http from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiError, loadContractors, recommend, catalog } from './recommendations.js';

export const defaultDataPath = fileURLToPath(new URL('./src/data/contractors.json', import.meta.url));
export const dataPath = () => process.env.DATA_PATH ? resolve(process.env.DATA_PATH) : defaultDataPath;
const maxBytes = 16 * 1024;
export function createServer(rows, { corsOrigin = process.env.CORS_ORIGIN || '*' } = {}) {
  const server = http.createServer(async (req, res) => {
    const send = (code, data) => {
      res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify(data));
    };
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      const methods = { '/health': 'GET', '/catalog': 'GET', '/recommendations': 'POST' };
      if (!Object.hasOwn(methods, path)) return send(404, { status: 'not_found', message: 'Эндпоинт не найден.', recommendations: [] });
      if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
      if (req.method !== methods[path]) {
        res.setHeader('Allow', `${methods[path]}, OPTIONS`);
        return send(405, { status: 'method_not_allowed', message: `Используйте ${methods[path]}.`, recommendations: [] });
      }
      if (path === '/health') return send(200, { status: 'ok', contractor_count: rows.length });
      if (path === '/catalog') return send(200, catalog(rows));
      if ((req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') throw new ApiError(415, 'unsupported_media_type', 'Нужен Content-Type: application/json.');
      if (Number(req.headers['content-length']) > maxBytes) throw new ApiError(413, 'payload_too_large', 'Максимальный размер запроса — 16 КБ.');
      const body = await new Promise((done, fail) => {
        let size = 0;
        const chunks = [];
        const timer = setTimeout(() => { fail(new ApiError(408, 'request_timeout', 'Истекло время чтения запроса.')); req.resume(); }, 5000);
        const cleanup = () => clearTimeout(timer);
        req.on('data', chunk => {
          size += chunk.length;
          if (size > maxBytes) { cleanup(); fail(new ApiError(413, 'payload_too_large', 'Максимальный размер запроса — 16 КБ.')); }
          else chunks.push(chunk);
        });
        req.on('end', () => { cleanup(); done(Buffer.concat(chunks).toString('utf8')); });
        req.on('error', error => { cleanup(); fail(error); });
        req.on('aborted', () => { cleanup(); fail(new ApiError(400, 'invalid_request', 'Запрос прерван.')); });
      });
      let input;
      try { input = JSON.parse(body); } catch { throw new ApiError(400, 'invalid_request', 'Некорректный JSON.'); }
      return send(200, recommend(rows, input));
    } catch (error) {
      if (res.destroyed || res.writableEnded) return;
      if (error instanceof ApiError) return send(error.statusCode, { status: error.status, message: error.message, recommendations: [] });
      console.error(error);
      send(500, { status: 'internal_error', message: 'Внутренняя ошибка сервера.', recommendations: [] });
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const rows = loadContractors(dataPath());
    const port = Number(process.env.PORT || 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1..65535');
    const server = createServer(rows);
    server.on('error', error => { console.error(error.message); process.exitCode = 1; });
    server.listen(port, process.env.HOST || '0.0.0.0', () => console.log(`EventMatch API: http://localhost:${port} (${rows.length} contractors)`));
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.close(); server.closeIdleConnections(); });
  } catch (error) {
    console.error(`Startup failed: ${error.message}\nОжидается ./src/data/contractors.json или переменная DATA_PATH.`);
    process.exitCode = 1;
  }
}
