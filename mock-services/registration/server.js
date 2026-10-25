import { pathToFileURL } from 'node:url';
import { createApp, start, getUser } from '../shared/common.js';
import { events as seed } from '../shared/seed.js';

export function build() {
  const app = createApp('registration-mock');
  const events = seed.map((e) => ({ ...e }));
  const registrations = [];

  const auth = (req, reply) => {
    const p = getUser(req);
    if (!p) reply.code(401).send({ error: 'unauthorized', message: 'Geçersiz token' });
    return p;
  };

  app.post('/registrations', async (req, reply) => {
    const p = auth(req, reply); if (!p) return;
    const { eventId } = req.body || {};
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return reply.code(404).send({ error: 'not_found', message: 'Etkinlik bulunamadı' });
    if (registrations.some((r) => r.userId === p.sub && r.eventId === eventId))
      return reply.code(409).send({ error: 'already_registered', message: 'Zaten kayıtlısın' });
    if (ev.registered >= ev.capacity)
      return reply.code(409).send({ error: 'event_full', message: 'Kontenjan dolu' });
    ev.registered++;
    const reg = { id: `r${registrations.length + 1}`, userId: p.sub, eventId, status: 'confirmed', createdAt: new Date().toISOString() };
    registrations.push(reg);
    return reply.code(201).send(reg);
  });

  app.get('/registrations/me', async (req, reply) => {
    const p = auth(req, reply); if (!p) return;
    return registrations.filter((r) => r.userId === p.sub);
  });

  app.delete('/registrations/:id', async (req, reply) => {
    const p = auth(req, reply); if (!p) return;
    const i = registrations.findIndex((r) => r.id === req.params.id && r.userId === p.sub);
    if (i < 0) return reply.code(404).send({ error: 'not_found', message: 'Kayıt bulunamadı' });
    const [reg] = registrations.splice(i, 1);
    events.find((e) => e.id === reg.eventId).registered--;
    return reply.code(204).send();
  });
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) start(build(), 4003);
