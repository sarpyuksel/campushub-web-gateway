import { pathToFileURL } from 'node:url';
import { createApp, start, signToken, getUser } from '../shared/common.js';
import { users as seed } from '../shared/seed.js';

export function build() {
  const app = createApp('auth-service');
  const users = seed.map((u) => ({ ...u }));
  const toResponse = ({ id, name, email, role }) => ({ id, name, email, role }); // UserResponse

  // POST /register  { name, email, password } -> UserResponse
  app.post('/register', async (req, reply) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return reply.code(400).send({ error: 'VALIDATION_ERROR', message: 'name, email ve password gerekli' });
    if (users.some((u) => u.email === email)) return reply.code(409).send({ error: 'EMAIL_ALREADY_EXISTS', message: 'Bu e-posta zaten kayıtlı' });
    const user = { id: users.length + 1, name, email, password, role: 'STUDENT' };
    users.push(user);
    return reply.code(201).send(toResponse(user));
  });

  // POST /login  { email, password } -> LoginResponse { token, userId }
  app.post('/login', async (req, reply) => {
    const { email, password } = req.body || {};
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return reply.code(401).send({ error: 'INVALID_CREDENTIALS', message: 'E-posta veya şifre hatalı' });
    return { token: signToken({ sub: user.id, name: user.name, role: user.role }), userId: user.id };
  });

  // GET /users/:id -> UserResponse (token gerekli)   |   GET /me -> UserResponse
  const find = (id) => users.find((u) => u.id === Number(id));
  app.get('/users/:id', async (req, reply) => {
    if (!getUser(req)) return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Geçersiz veya eksik token' });
    const u = find(req.params.id);
    return u ? toResponse(u) : reply.code(404).send({ error: 'USER_NOT_FOUND', message: 'Kullanıcı bulunamadı' });
  });
  app.get('/me', async (req, reply) => {
    const p = getUser(req);
    if (!p) return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Geçersiz veya eksik token' });
    return toResponse(find(p.sub));
  });
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) start(build(), 4001);
