import Fastify from 'fastify';
import crypto from 'node:crypto';

export const JWT_SECRET = process.env.JWT_SECRET || 'campushub-dev-secret';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const sig = (data) => crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');

export function signToken(payload, expiresInSec = 3600) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec };
  const data = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(body)}`;
  return `${data}.${sig(data)}`;
}

export function verifyToken(token) {
  try {
    const [h, p, s] = token.split('.');
    if (sig(`${h}.${p}`) !== s) return null;
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString());
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getUser(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? verifyToken(h.slice(7)) : null;
}

/**
 * Hata simülasyonu:
 *   env SIMULATE_ERROR=500 | timeout | 503 | down
 *   veya istek başına ?fail=500|timeout|503
 * /health her zaman çalışır.
 */
export function createApp(name) {
  const app = Fastify({ logger: process.env.LOG === '1' });
  app.addHook('onRequest', async (req, reply) => {
    if (req.url.startsWith('/health')) return;
    const mode = req.query?.fail || process.env.SIMULATE_ERROR || 'none';
    if (mode === 'none') return;
    if (mode === 'timeout') return new Promise(() => {});
    const code = mode === 'down' ? 503 : Number(mode) || 500;
    return reply.code(code).send({ error: 'simulated_error', message: `${name} simulated ${mode}` });
  });
  app.get('/health', async () => ({ status: 'ok', service: name }));
  return app;
}

export const start = (app, defaultPort) =>
  app.listen({ port: Number(process.env.PORT) || defaultPort, host: '0.0.0.0' });
