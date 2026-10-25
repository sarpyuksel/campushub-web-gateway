import { pathToFileURL } from 'node:url';
import { createApp, start, signToken, getUser } from '../shared/common.js';
import { users as seed } from '../shared/seed.js';

export function build() {
  const app = createApp('auth-mock');
  const users = seed.map((u) => ({ ...u }));
  const safe = ({ password, ...u }) => u;

  app.post('/register', async (req, reply) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return reply.code(400).send({ error: 'validation_error', message: 'name, email, password gerekli' });
    if (users.some((u) => u.email === email)) return reply.code(409).send({ error: 'email_exists', message: 'Bu e-posta kayıtlı' });
    const user = { id: `u${users.length + 1}`, name, email, password };
    users.push(user);
    return reply.code(201).send({ user: safe(user), token: signToken({ sub: user.id, name }) });
  });

  app.post('/login', async (req, reply) => {
    const { email, password } = req.body || {};
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return reply.code(401).send({ error: 'invalid_credentials', message: 'E-posta veya şifre hatalı' });
    return { user: safe(user), token: signToken({ sub: user.id, name: user.name }) };
  });

  app.get('/me', async (req, reply) => {
    const p = getUser(req);
    if (!p) return reply.code(401).send({ error: 'unauthorized', message: 'Geçersiz token' });
    return safe(users.find((u) => u.id === p.sub));
  });
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) start(build(), 4001);
